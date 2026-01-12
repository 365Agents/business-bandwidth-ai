"use server"

import { db } from "@/lib/db"
import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote"
import { revalidatePath } from "next/cache"

export async function submitQuoteRequest(data: QuoteFormValues) {
  // Validate on server
  const validated = quoteFormSchema.safeParse(data)
  if (!validated.success) {
    return { success: false as const, error: "Invalid form data" }
  }

  try {
    // Create lead
    const lead = await db.lead.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        company: validated.data.company,
      },
    })

    // Create quote request
    const quote = await db.quote.create({
      data: {
        leadId: lead.id,
        streetAddress: validated.data.streetAddress,
        city: validated.data.city,
        state: validated.data.state,
        zipCode: validated.data.zipCode,
        speed: validated.data.speed,
        term: validated.data.term,
        status: "pending",
      },
    })

    revalidatePath("/dashboard")

    return { success: true as const, quoteId: quote.id, leadId: lead.id }
  } catch (error) {
    console.error("Failed to create quote request:", error)
    return { success: false as const, error: "Failed to submit quote request" }
  }
}
