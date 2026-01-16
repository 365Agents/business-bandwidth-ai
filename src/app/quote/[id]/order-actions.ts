"use server"

import { getDb } from "@/lib/db"
import { contactsSchema, orderFormSchema, type OrderFormValues } from "@/lib/validations/order"
import { sendOrderConfirmationWithDocuments } from "@/lib/email"
import { revalidatePath } from "next/cache"

/**
 * Link a quote to a user account
 */
export async function linkQuoteToUser(
  quoteId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb()

  try {
    await db.quote.update({
      where: { id: quoteId },
      data: { userId },
    })

    return { success: true }
  } catch (error) {
    console.error("Link quote to user error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to link quote",
    }
  }
}

/**
 * Save order contacts (billing and technical) before signing
 */
export async function saveOrderContacts(
  quoteId: string,
  formData: OrderFormValues
): Promise<{ success: boolean; error?: string }> {
  // Validate contacts data
  const validated = contactsSchema.safeParse({
    billingContact: formData.billingContact,
    technicalContact: formData.technicalContact,
    sameAsBilling: formData.sameAsBilling,
    salesRepName: formData.salesRepName,
    salesRepEmail: formData.salesRepEmail,
  })

  if (!validated.success) {
    return { success: false, error: "Invalid contact data" }
  }

  const db = await getDb()

  try {
    await db.quote.update({
      where: { id: quoteId },
      data: {
        // Billing contact
        billingName: validated.data.billingContact.name,
        billingEmail: validated.data.billingContact.email,
        billingPhone: validated.data.billingContact.phone,
        billingCompany: validated.data.billingContact.company || null,
        // Technical contact
        technicalName: validated.data.technicalContact.name,
        technicalEmail: validated.data.technicalContact.email,
        technicalPhone: validated.data.technicalContact.phone,
        // Sales rep
        salesRepName: validated.data.salesRepName || null,
        salesRepEmail: validated.data.salesRepEmail || null,
      },
    })

    revalidatePath(`/quote/${quoteId}`)

    return { success: true }
  } catch (error) {
    console.error("Save order contacts error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save contacts",
    }
  }
}

/**
 * Legacy submit order function - now handled by DocuSeal webhook
 * Kept for backwards compatibility
 */
export async function submitOrder(
  quoteId: string,
  formData: OrderFormValues
): Promise<{ success: boolean; error?: string; orderNumber?: string }> {
  // Validate form data
  const validated = orderFormSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: "Invalid form data" }
  }

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
      return { success: false, error: "Quote is not ready for order" }
    }

    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase()
    const orderNumber = `ORD-${timestamp}`

    // Update quote with order details
    await db.quote.update({
      where: { id: quoteId },
      data: {
        status: "accepted",
        orderNumber,
        orderCreatedAt: new Date(),
        termsAcceptedAt: new Date(),
        // Billing contact
        billingName: validated.data.billingContact.name,
        billingEmail: validated.data.billingContact.email,
        billingPhone: validated.data.billingContact.phone,
        billingCompany: validated.data.billingContact.company || null,
        // Technical contact
        technicalName: validated.data.technicalContact.name,
        technicalEmail: validated.data.technicalContact.email,
        technicalPhone: validated.data.technicalContact.phone,
        // Sales rep
        salesRepName: validated.data.salesRepName || null,
        salesRepEmail: validated.data.salesRepEmail || null,
      },
    })

    // Send confirmation email with PDF attachments
    sendOrderConfirmationWithDocuments({
      quoteId,
      orderNumber,
      to: validated.data.billingContact.email,
      customerName: validated.data.billingContact.name,
      company: validated.data.billingContact.company || quote.lead?.company || "",
      streetAddress: quote.streetAddress,
      city: quote.city,
      state: quote.state,
      zipCode: quote.zipCode,
      speed: quote.speed,
      term: quote.term,
      mrc: quote.mrc || 0,
      nrc: quote.nrc || 0,
      carrierName: quote.carrierName || undefined,
    }).catch(console.error) // Don't block on email

    revalidatePath(`/quote/${quoteId}`)
    revalidatePath(`/dashboard/quotes/${quoteId}`)
    revalidatePath("/dashboard")

    return { success: true, orderNumber }
  } catch (error) {
    console.error("Order submission error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit order",
    }
  }
}
