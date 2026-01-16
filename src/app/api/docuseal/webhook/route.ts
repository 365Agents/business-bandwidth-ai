import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { sendOrderConfirmationWithDocuments } from "@/lib/email"

// DocuSeal webhook payload types
interface DocuSealWebhookPayload {
  event_type:
    | "submission.created"
    | "submission.completed"
    | "submitter.completed"
    | "submitter.opened"
    | "submitter.sent"
  timestamp: string
  data: {
    id: number
    source: string
    submitters: Array<{
      id: number
      submission_id: number
      uuid: string
      email: string
      slug: string
      sent_at: string | null
      opened_at: string | null
      completed_at: string | null
      declined_at: string | null
      created_at: string
      updated_at: string
      name: string
      phone: string | null
      status: "pending" | "sent" | "opened" | "completed" | "declined"
      role: string
    }>
    audit_log_url: string | null
    combined_document_url: string | null
    created_at: string
    updated_at: string
    archived_at: string | null
    status: "pending" | "completed"
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: DocuSealWebhookPayload = await request.json()

    console.log("DocuSeal webhook received:", payload.event_type)

    // Handle submission.completed event
    if (
      payload.event_type === "submission.completed" ||
      payload.event_type === "submitter.completed"
    ) {
      const submissionId = String(payload.data.id)

      const db = await getDb()

      // Find the quote with this submission ID
      const quote = await db.quote.findFirst({
        where: { docusealSubmissionId: submissionId },
        include: { lead: true },
      })

      if (!quote) {
        console.error(
          `Quote not found for DocuSeal submission ${submissionId}`
        )
        return NextResponse.json({ received: true })
      }

      // Generate order number if not exists
      const orderNumber =
        quote.orderNumber ||
        `ORD-${Date.now().toString(36).toUpperCase()}`

      // Update quote with signed status
      await db.quote.update({
        where: { id: quote.id },
        data: {
          status: "accepted",
          orderNumber,
          orderCreatedAt: new Date(),
          docusealSignedAt: new Date(),
          docusealDocumentUrls: payload.data.combined_document_url
            ? JSON.stringify([payload.data.combined_document_url])
            : null,
          termsAcceptedAt: new Date(),
        },
      })

      console.log(`Quote ${quote.id} marked as accepted after DocuSeal signing`)

      // Send confirmation email with documents
      if (quote.billingEmail) {
        try {
          await sendOrderConfirmationWithDocuments({
            quoteId: quote.id,
            orderNumber,
            to: quote.billingEmail,
            customerName: quote.billingName || quote.lead?.name || "Customer",
            company: quote.billingCompany || quote.lead?.company || "",
            streetAddress: quote.streetAddress,
            city: quote.city,
            state: quote.state,
            zipCode: quote.zipCode,
            speed: quote.speed,
            term: quote.term,
            mrc: quote.mrc || 0,
            nrc: quote.nrc || 0,
            carrierName: quote.carrierName || undefined,
          })
          console.log(`Confirmation email sent to ${quote.billingEmail}`)
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("DocuSeal webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// DocuSeal may send GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" })
}
