"use server"

import { getDb } from "@/lib/db"
import { checkQuoteStatus } from "@/lib/momentum-api"

export async function getDashboardData() {
  const db = await getDb()

  const [leadCount, quoteCount, processingCount, recentQuotes] = await Promise.all([
    db.lead.count(),
    db.quote.count(),
    db.quote.count({ where: { status: "processing" } }),
    db.quote.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { lead: true },
    }),
  ])

  return {
    leadCount,
    quoteCount,
    processingCount,
    recentQuotes,
  }
}

export async function refreshProcessingQuotes(): Promise<boolean> {
  const db = await getDb()

  // Get all processing quotes
  const processingQuotes = await db.quote.findMany({
    where: {
      status: "processing",
      quoteRequestId: { not: null },
    },
  })

  if (processingQuotes.length === 0) {
    return false
  }

  let anyUpdated = false

  // Check status for each
  for (const quote of processingQuotes) {
    if (!quote.quoteRequestId) continue

    try {
      const result = await checkQuoteStatus(quote.quoteRequestId)

      if (result.bestQuote) {
        await db.quote.update({
          where: { id: quote.id },
          data: {
            status: result.status,
            mrc: result.bestQuote.mrc,
            nrc: result.bestQuote.nrc,
            carrierName: result.bestQuote.carrierName || null,
          },
        })
        anyUpdated = true
      } else if (result.status === "complete") {
        await db.quote.update({
          where: { id: quote.id },
          data: { status: "complete" },
        })
        anyUpdated = true
      }
    } catch (error) {
      console.error(`Failed to refresh quote ${quote.id}:`, error)
    }
  }

  return anyUpdated
}
