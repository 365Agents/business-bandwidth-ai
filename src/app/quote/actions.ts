"use server"

import { getDb } from "@/lib/db"
import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote"
import { submitQuoteToMomentum, checkQuoteStatus, type MomentumQuoteResult } from "@/lib/momentum-api"
import { sendQuoteReadyEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function submitQuoteRequest(data: QuoteFormValues) {
  // Validate on server
  const validated = quoteFormSchema.safeParse(data)
  if (!validated.success) {
    return { success: false as const, error: "Invalid form data" }
  }

  try {
    const db = await getDb()

    // Create lead
    const lead = await db.lead.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        company: validated.data.company,
      },
    })

    // Create quote request in database first
    const quote = await db.quote.create({
      data: {
        leadId: lead.id,
        streetAddress: validated.data.streetAddress,
        city: validated.data.city,
        state: validated.data.state,
        zipCode: validated.data.zipCode,
        speed: validated.data.speed,
        term: validated.data.term,
        status: "processing",
        addressType: validated.data.addressType,
        placeId: validated.data.placeId,
      },
    })

    // Submit to Momentum API
    try {
      const momentumResponse = await submitQuoteToMomentum({
        streetAddress: validated.data.streetAddress,
        city: validated.data.city,
        state: validated.data.state,
        zipCode: validated.data.zipCode,
        speed: validated.data.speed,
        term: validated.data.term,
      })

      if (momentumResponse.status === "failed") {
        // Address validation or other immediate failure
        await db.quote.update({
          where: { id: quote.id },
          data: {
            status: "failed",
            errorMessage: momentumResponse.error || "Quote submission failed",
          },
        })
        return { success: false as const, error: momentumResponse.error || "Quote submission failed" }
      } else {
        // Quote submitted successfully - save the Momentum quote request ID
        // Convert to string since Momentum returns numeric ID
        await db.quote.update({
          where: { id: quote.id },
          data: {
            quoteRequestId: String(momentumResponse.quoteRequestId),
            status: "processing",
          },
        })
      }
    } catch (momentumError) {
      console.error("Momentum API error:", momentumError)
      await db.quote.update({
        where: { id: quote.id },
        data: {
          status: "failed",
          errorMessage: momentumError instanceof Error ? momentumError.message : "Momentum API error",
        },
      })
      return {
        success: false as const,
        error: momentumError instanceof Error ? momentumError.message : "Failed to submit to carrier network"
      }
    }

    return { success: true as const, quoteId: quote.id, leadId: lead.id }
  } catch (error) {
    console.error("Failed to create quote request:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { success: false as const, error: errorMessage }
  }
}

/**
 * Check and update the status of a quote from Momentum.
 * Returns all carrier quotes found so far.
 * Sends email notification when quote completes.
 */
export async function refreshQuoteStatus(quoteId: string): Promise<MomentumQuoteResult | null> {
  try {
    const db = await getDb()

    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lead: true },
    })

    if (!quote || !quote.quoteRequestId) {
      return null
    }

    // Don't refresh if already complete
    if (quote.status === "complete" || quote.status === "accepted") {
      return {
        quoteRequestId: quote.quoteRequestId,
        status: "complete",
        quotes: [],
        bestQuote: quote.mrc ? {
          quoteStatus: "COMPLETE",
          mrc: quote.mrc,
          nrc: quote.nrc || 0,
          carrierName: quote.carrierName || undefined,
        } : undefined,
      }
    }

    // Check status from Momentum
    const statusResult = await checkQuoteStatus(quote.quoteRequestId)

    // Update our database with the best quote if we have results
    if (statusResult.bestQuote) {
      const wasProcessing = quote.status === "processing"
      const nowComplete = statusResult.status === "complete"

      await db.quote.update({
        where: { id: quoteId },
        data: {
          status: statusResult.status,
          mrc: statusResult.bestQuote.mrc,
          nrc: statusResult.bestQuote.nrc,
          carrierName: statusResult.bestQuote.carrierName || null,
        },
      })

      // Send email when quote first completes
      if (wasProcessing && nowComplete && quote.lead) {
        sendQuoteReadyEmail({
          to: quote.lead.email,
          customerName: quote.lead.name,
          company: quote.lead.company,
          streetAddress: quote.streetAddress,
          city: quote.city,
          state: quote.state,
          zipCode: quote.zipCode,
          speed: quote.speed,
          mrc: statusResult.bestQuote.mrc,
          nrc: statusResult.bestQuote.nrc,
          quoteId: quote.quoteRequestId,
          carrierName: statusResult.bestQuote.carrierName,
        }).catch(console.error) // Don't block on email
      }
    } else if (statusResult.status === "complete") {
      // Mark as complete even without quotes
      await db.quote.update({
        where: { id: quoteId },
        data: { status: "complete" },
      })
    }

    if (statusResult.status === "complete") {
      revalidatePath("/dashboard")
    }

    return statusResult
  } catch (error) {
    console.error("Failed to refresh quote status:", error)
    return null
  }
}

/**
 * Get quote by ID for status page
 */
export async function getQuoteById(quoteId: string) {
  try {
    const db = await getDb()
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lead: true },
    })
    return quote
  } catch (error) {
    console.error("Failed to get quote:", error)
    return null
  }
}
