import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { ServiceOrderPDF } from "@/lib/pdf/service-order-pdf"
import { MsaPDF } from "@/lib/pdf/msa-pdf"
import { getDb } from "@/lib/db"
import { getDocuSealClient } from "@/lib/docuseal/client"

export async function POST(request: NextRequest) {
  try {
    const { quoteId, signerEmail, signerName } = await request.json()

    if (!quoteId || !signerEmail || !signerName) {
      return NextResponse.json(
        { error: "Quote ID, signer email, and signer name are required" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lead: true },
    })

    if (!quote || !quote.lead) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Build add-ons array for PDF
    const addOns: { name: string; price: number }[] = []
    if (quote.addOnSdwan) addOns.push({ name: "Juniper SD-WAN", price: 250 })
    if (quote.addOn5g) addOns.push({ name: "5G Internet Backup", price: 250 })

    const orderNumber =
      quote.orderNumber || `QT-${quoteId.slice(0, 8).toUpperCase()}`
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Generate Service Order PDF
    const serviceOrderBuffer = await renderToBuffer(
      ServiceOrderPDF({
        quoteId,
        orderNumber,
        date: currentDate,
        customer: {
          name: quote.billingName || quote.lead.name,
          email: quote.billingEmail || quote.lead.email,
          phone: quote.billingPhone || quote.lead.phone,
          company: quote.billingCompany || quote.lead.company,
        },
        technicalContact: quote.technicalName
          ? {
              name: quote.technicalName,
              email: quote.technicalEmail || "",
              phone: quote.technicalPhone || "",
            }
          : undefined,
        service: {
          streetAddress: quote.streetAddress,
          city: quote.city,
          state: quote.state,
          zipCode: quote.zipCode,
          speed: quote.speed,
          term: quote.term,
          mrc: quote.mrc || 0,
          nrc: quote.nrc || 0,
          carrierName: quote.carrierName,
        },
        addOns,
      })
    )

    // Generate MSA PDF
    const msaBuffer = await renderToBuffer(
      MsaPDF({
        customerName: quote.billingName || quote.lead.name,
        orderNumber,
      })
    )

    // Convert buffers to base64
    const serviceOrderBase64 = Buffer.from(serviceOrderBuffer).toString(
      "base64"
    )
    const msaBase64 = Buffer.from(msaBuffer).toString("base64")

    // Create DocuSeal submission with both documents
    const docuseal = getDocuSealClient()

    const submission = await docuseal.createSubmissionFromPdfs({
      submitters: [
        {
          email: signerEmail,
          name: signerName,
          role: "Customer",
        },
      ],
      documents: [
        {
          name: `NetworkGPT-Service-Order-${orderNumber}.pdf`,
          file: `data:application/pdf;base64,${serviceOrderBase64}`,
        },
        {
          name: `NetworkGPT-MSA-${orderNumber}.pdf`,
          file: `data:application/pdf;base64,${msaBase64}`,
        },
      ],
      sendEmail: false, // We'll use embedded signing
    })

    // Update quote with DocuSeal submission ID
    await db.quote.update({
      where: { id: quoteId },
      data: {
        docusealSubmissionId: String(submission.id),
      },
    })

    // Get the embed URL for the first submitter
    const embedUrl = submission.submitters[0]?.embed_src

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      embedUrl,
      status: submission.status,
    })
  } catch (error) {
    console.error("DocuSeal submission error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create DocuSeal submission",
      },
      { status: 500 }
    )
  }
}
