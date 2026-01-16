"use server"

import { getDb } from "@/lib/db"
import { submitQuoteToMomentum, checkQuoteStatus, type MomentumCarrierQuote } from "@/lib/momentum-api"
import { revalidatePath } from "next/cache"

interface AddLocationData {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  speed: string
  term: string
}

export async function addLocationToLead(
  existingQuoteId: string,
  data: AddLocationData
): Promise<{ success: boolean; newQuoteId?: string; error?: string }> {
  const db = await getDb()

  try {
    // Get the existing quote to find the lead
    const existingQuote = await db.quote.findUnique({
      where: { id: existingQuoteId },
      include: { lead: true },
    })

    if (!existingQuote || !existingQuote.lead) {
      return { success: false, error: "Quote not found" }
    }

    // Create a new quote for the same lead
    const newQuote = await db.quote.create({
      data: {
        leadId: existingQuote.lead.id,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        speed: data.speed,
        term: data.term,
        status: "processing",
      },
    })

    // Revalidate paths
    revalidatePath(`/dashboard`)
    revalidatePath(`/dashboard/quotes/${newQuote.id}`)

    // Start processing in background
    processNewQuote(newQuote.id, existingQuote.lead, data).catch(console.error)

    return { success: true, newQuoteId: newQuote.id }
  } catch (error) {
    console.error("Add location error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add location",
    }
  }
}

// Background processing for the new quote
async function processNewQuote(
  quoteId: string,
  lead: { name: string; email: string; phone: string; company: string },
  data: AddLocationData
) {
  const db = await getDb()

  try {
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

    // Poll for results (simple polling - check a few times)
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

    // Timeout - mark as failed after max attempts
    await db.quote.update({
      where: { id: quoteId },
      data: {
        status: "failed",
        errorMessage: "Quote processing timed out",
      },
    })
  } catch (error) {
    console.error("Process new quote error:", error)
    await db.quote.update({
      where: { id: quoteId },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Processing failed",
      },
    })
  }
}
