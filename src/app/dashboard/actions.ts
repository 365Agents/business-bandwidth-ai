"use server"

import { getDb } from "@/lib/db"
import { checkQuoteStatus } from "@/lib/momentum-api"
import { getExchangeRates, type Currency } from "@/lib/currency"
import { sendQuoteReadyEmail, sendBatchCompleteEmail } from "@/lib/email"

export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  return getExchangeRates()
}

export async function sendQuoteEmail(quoteId: string): Promise<{ success: boolean; error?: string; isBatch?: boolean }> {
  const db = await getDb()

  try {
    // Get the quote with lead info and batch relationship
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        lead: true,
        batchQuotes: {
          include: {
            batchJob: true,
          },
        },
      },
    })

    if (!quote) {
      return { success: false, error: "Quote not found" }
    }

    // Check if this quote is part of a batch
    if (quote.batchQuotes.length > 0) {
      const batchJob = quote.batchQuotes[0].batchJob

      // Get all quotes from this batch
      const batchQuotes = await db.batchQuote.findMany({
        where: { batchJobId: batchJob.id },
        include: { quote: true },
        orderBy: { rowNumber: "asc" },
      })

      // Format quotes for batch email
      const quotesForEmail = batchQuotes
        .filter((bq) => bq.quote)
        .map((bq) => ({
          streetAddress: bq.streetAddress,
          city: bq.city,
          state: bq.state,
          mrc: bq.quote?.mrc || null,
          status: bq.quote?.status || "failed",
          carrierName: bq.quote?.carrierName || null,
        }))

      const successCount = quotesForEmail.filter((q) => q.status === "complete").length
      const failedCount = quotesForEmail.filter((q) => q.status === "failed").length

      const sent = await sendBatchCompleteEmail({
        to: quote.lead.email,
        customerName: quote.lead.name,
        company: quote.lead.company,
        batchJobId: batchJob.id,
        totalCount: batchQuotes.length,
        successCount,
        failedCount,
        quotes: quotesForEmail,
      })

      return { success: sent, isBatch: true, error: sent ? undefined : "Failed to send batch email" }
    }

    // Single quote - check if it's complete with pricing
    if (quote.status !== "complete" || !quote.mrc) {
      return { success: false, error: "Quote is not complete or has no pricing" }
    }

    const sent = await sendQuoteReadyEmail({
      to: quote.lead.email,
      customerName: quote.lead.name,
      company: quote.lead.company,
      streetAddress: quote.streetAddress,
      city: quote.city,
      state: quote.state,
      zipCode: quote.zipCode,
      speed: quote.speed,
      mrc: quote.mrc,
      nrc: quote.nrc || 0,
      quoteId: quote.id,
      carrierName: quote.carrierName || undefined,
    })

    return { success: sent, isBatch: false, error: sent ? undefined : "Failed to send email" }
  } catch (error) {
    console.error("Send quote email error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

export async function getDashboardData() {
  const db = await getDb()

  const [leadCount, quoteCount, processingCount, recentQuotes] = await Promise.all([
    db.lead.count(),
    db.quote.count(),
    db.quote.count({ where: { status: "processing" } }),
    db.quote.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { lead: true, batchQuotes: true },
    }),
  ])

  return {
    leadCount,
    quoteCount,
    processingCount,
    recentQuotes,
  }
}

export async function deleteQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb()

  try {
    // Get the quote to check if it exists and get related data
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        batchQuotes: true,
      },
    })

    if (!quote) {
      return { success: false, error: "Quote not found" }
    }

    // Don't allow deleting accepted orders
    if (quote.status === "accepted") {
      return { success: false, error: "Cannot delete an order that has been placed" }
    }

    // Delete related batch quotes first (if any)
    if (quote.batchQuotes.length > 0) {
      await db.batchQuote.deleteMany({
        where: { quoteId: quoteId },
      })
    }

    // Delete the quote
    await db.quote.delete({
      where: { id: quoteId },
    })

    return { success: true }
  } catch (error) {
    console.error("Delete quote error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete quote",
    }
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
