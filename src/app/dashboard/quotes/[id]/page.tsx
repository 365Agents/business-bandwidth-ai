import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getQuoteById } from "@/lib/queries/quotes"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    complete: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  }
  return (
    <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function formatSpeed(speed: string) {
  const speedNum = parseInt(speed, 10)
  if (speedNum >= 1000) {
    return `${speedNum / 1000} Gbps`
  }
  return `${speedNum} Mbps`
}

function formatTerm(term: string) {
  return `${term} months`
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await getQuoteById(id)

  if (!quote) {
    notFound()
  }

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quote Details</h1>
          <p className="text-muted-foreground">
            Submitted {formatDate(quote.createdAt)}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{quote.lead.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{quote.lead.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{quote.lead.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{quote.lead.company}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Location */}
        <Card>
          <CardHeader>
            <CardTitle>Service Location</CardTitle>
            <CardDescription>Address for quote</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Street Address</p>
              <p className="font-medium">{quote.streetAddress}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="font-medium">{quote.city}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-medium">{quote.state}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zip Code</p>
              <p className="font-medium">{quote.zipCode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Service Requirements</CardTitle>
            <CardDescription>Requested configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Bandwidth Speed</p>
              <p className="font-medium">{formatSpeed(quote.speed)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contract Term</p>
              <p className="font-medium">{formatTerm(quote.term)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quote Status & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Status</CardTitle>
            <CardDescription>Current status and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(quote.status)}</div>
            </div>
            {quote.carrierName && (
              <div>
                <p className="text-sm text-muted-foreground">Carrier</p>
                <p className="font-medium">{quote.carrierName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Monthly Recurring (MRC)</p>
              <p className="font-medium text-lg">
                {quote.mrc ? `$${quote.mrc.toFixed(2)}/mo` : "Pending"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Non-Recurring (NRC)</p>
              <p className="font-medium text-lg">
                {quote.nrc ? `$${quote.nrc.toFixed(2)}` : "Pending"}
              </p>
            </div>
            {quote.errorMessage && (
              <div>
                <p className="text-sm text-muted-foreground">Error</p>
                <p className="font-medium text-destructive">{quote.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-8 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {formatDate(quote.createdAt)}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{" "}
              {formatDate(quote.updatedAt)}
            </div>
            <div>
              <span className="font-medium">Quote ID:</span> {quote.id}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
