"use server"

import { getDb } from "@/lib/db"
import { submitQuoteToMomentum, checkQuoteStatus, type MomentumCarrierQuote } from "@/lib/momentum-api"
import { revalidatePath } from "next/cache"

interface UpdateQuoteData {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  speed: string
  term: string
}

export async function updateAndReprocessQuote(
  quoteId: string,
  data: UpdateQuoteData
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb()

  try {
    // Get the existing quote with lead info
    const existingQuote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lead: true },
    })

    if (!existingQuote) {
      return { success: false, error: "Quote not found" }
    }

    // Don't allow editing accepted orders
    if (existingQuote.status === "accepted") {
      return { success: false, error: "Cannot edit an order that has been placed" }
    }

    // Update quote with new data and set to processing
    await db.quote.update({
      where: { id: quoteId },
      data: {
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        speed: data.speed,
        term: data.term,
        status: "processing",
        mrc: null,
        nrc: null,
        carrierName: null,
        errorMessage: null,
        quoteRequestId: null,
      },
    })

    // Revalidate paths
    revalidatePath(`/quote/${quoteId}`)
    revalidatePath(`/dashboard/quotes/${quoteId}`)
    revalidatePath("/dashboard")

    // Submit new quote request to Momentum API (async, don't wait)
    reprocessQuoteAsync(quoteId, data).catch(console.error)

    return { success: true }
  } catch (error) {
    console.error("Update quote error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update quote",
    }
  }
}

// Background function to reprocess the quote
async function reprocessQuoteAsync(quoteId: string, data: UpdateQuoteData) {
  const db = await getDb()

  try {
    // Get the quote with lead info
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lead: true },
    })

    if (!quote || !quote.lead) {
      console.error(`Quote ${quoteId} not found for reprocessing`)
      return
    }

    // Submit to Momentum API
    const quoteResponse = await submitQuoteToMomentum({
      term: data.term,
      speed: data.speed,
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    })

    if (!quoteResponse.quoteRequestId || quoteResponse.status === "failed") {
      await db.quote.update({
        where: { id: quoteId },
        data: {
          status: "failed",
          errorMessage: quoteResponse.error || "Failed to submit quote request",
        },
      })
      return
    }

    // Update with quote request ID
    await db.quote.update({
      where: { id: quoteId },
      data: {
        quoteRequestId: quoteResponse.quoteRequestId,
      },
    })

    // Poll for results
    let attempts = 0
    const maxAttempts = 10
    const pollInterval = 30000 // 30 seconds

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
      attempts++

      const pollResult = await checkQuoteStatus(quoteResponse.quoteRequestId)

      if (pollResult.status === "complete" && pollResult.quotes && pollResult.quotes.length > 0) {
        // Find best quote (lowest MRC)
        const bestQuote = pollResult.quotes.reduce((best: MomentumCarrierQuote, current: MomentumCarrierQuote) =>
          current.mrc < best.mrc ? current : best
        )

        await db.quote.update({
          where: { id: quoteId },
          data: {
            status: "complete",
            mrc: bestQuote.mrc,
            nrc: bestQuote.nrc,
            carrierName: bestQuote.carrierName || null,
          },
        })

        // Revalidate paths after completion
        revalidatePath(`/quote/${quoteId}`)
        revalidatePath(`/dashboard/quotes/${quoteId}`)
        revalidatePath("/dashboard")
        return
      } else if (pollResult.status === "failed") {
        await db.quote.update({
          where: { id: quoteId },
          data: {
            status: "failed",
            errorMessage: pollResult.error || "No quotes available for this location",
          },
        })
        return
      }
    }

    // Timeout - mark as failed
    await db.quote.update({
      where: { id: quoteId },
      data: {
        status: "failed",
        errorMessage: "Quote processing timed out",
      },
    })
  } catch (error) {
    console.error("Reprocess quote error:", error)
    await db.quote.update({
      where: { id: quoteId },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Reprocessing failed",
      },
    })
  }
}
