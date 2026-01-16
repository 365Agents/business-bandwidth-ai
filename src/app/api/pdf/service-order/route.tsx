import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { ServiceOrderPDF } from "@/lib/pdf/service-order-pdf"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const quoteId = searchParams.get("quoteId")

  if (!quoteId) {
    return NextResponse.json({ error: "Quote ID required" }, { status: 400 })
  }

  try {
    const db = await getDb()
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lead: true },
    })

    if (!quote || !quote.lead) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Build add-ons array
    const addOns: { name: string; price: number }[] = []
    if (quote.addOnSdwan) addOns.push({ name: "Juniper SD-WAN", price: 250 })
    if (quote.addOn5g) addOns.push({ name: "5G Internet Backup", price: 250 })

    const orderNumber = quote.orderNumber || `QT-${quoteId.slice(0, 8).toUpperCase()}`

    const pdfBuffer = await renderToBuffer(
      <ServiceOrderPDF
        quoteId={quoteId}
        orderNumber={orderNumber}
        date={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        customer={{
          name: quote.billingName || quote.lead.name,
          email: quote.billingEmail || quote.lead.email,
          phone: quote.billingPhone || quote.lead.phone,
          company: quote.billingCompany || quote.lead.company,
        }}
        technicalContact={
          quote.technicalName
            ? {
                name: quote.technicalName,
                email: quote.technicalEmail || "",
                phone: quote.technicalPhone || "",
              }
            : undefined
        }
        service={{
          streetAddress: quote.streetAddress,
          city: quote.city,
          state: quote.state,
          zipCode: quote.zipCode,
          speed: quote.speed,
          term: quote.term,
          mrc: quote.mrc || 0,
          nrc: quote.nrc || 0,
          carrierName: quote.carrierName,
        }}
        addOns={addOns}
      />
    )

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="NetworkGPT-Service-Order-${quoteId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
