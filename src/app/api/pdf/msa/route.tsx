import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { MsaPDF } from "@/lib/pdf/msa-pdf"
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

    const customerName = quote.billingCompany || quote.lead.company
    const orderNumber = quote.orderNumber || `QT-${quoteId.slice(0, 8).toUpperCase()}`

    const pdfBuffer = await renderToBuffer(
      <MsaPDF customerName={customerName} orderNumber={orderNumber} />
    )

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="NetworkGPT-MSA-${quoteId}.pdf"`,
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
