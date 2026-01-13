"use server"

import { getDb } from "@/lib/db"
import { checkQuoteStatus } from "@/lib/momentum-api"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function getQuoteDetails(quoteId: string) {
  const db = await getDb()

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { lead: true },
  })

  return quote
}

export async function refreshSingleQuote(quoteId: string): Promise<boolean> {
  const db = await getDb()

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
  })

  if (!quote || !quote.quoteRequestId || quote.status !== "processing") {
    return false
  }

  try {
    const result = await checkQuoteStatus(quote.quoteRequestId)

    if (result.bestQuote) {
      await db.quote.update({
        where: { id: quoteId },
        data: {
          status: result.status,
          mrc: result.bestQuote.mrc,
          nrc: result.bestQuote.nrc,
          carrierName: result.bestQuote.carrierName || null,
        },
      })
      revalidatePath(`/dashboard/quotes/${quoteId}`)
      revalidatePath("/dashboard")
      return true
    } else if (result.status === "complete") {
      await db.quote.update({
        where: { id: quoteId },
        data: { status: "complete" },
      })
      revalidatePath(`/dashboard/quotes/${quoteId}`)
      revalidatePath("/dashboard")
      return true
    }
  } catch (error) {
    console.error(`Failed to refresh quote ${quoteId}:`, error)
  }

  return false
}

export async function proceedWithQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb()

  try {
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lead: true },
    })

    if (!quote) {
      return { success: false, error: "Quote not found" }
    }

    if (quote.status !== "complete") {
      return { success: false, error: "Quote is not ready" }
    }

    // Update quote status to indicate customer accepted
    await db.quote.update({
      where: { id: quoteId },
      data: {
        status: "accepted",
      },
    })

    // Send order confirmation email to customer
    if (quote.lead && quote.mrc) {
      sendOrderConfirmationEmail({
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
        quoteId: quote.quoteRequestId || quote.id,
        carrierName: quote.carrierName || undefined,
      }).catch(console.error) // Don't block on email
    }

    revalidatePath(`/dashboard/quotes/${quoteId}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to proceed with quote:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
