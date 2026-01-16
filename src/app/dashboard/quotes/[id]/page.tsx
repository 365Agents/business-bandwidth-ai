"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getQuoteDetails, refreshSingleQuote, proceedWithQuote } from "./actions"

type QuoteDetails = NonNullable<Awaited<ReturnType<typeof getQuoteDetails>>>

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
  const styles: Record<string, string> = {
    pending: "bg-[#ff9900]/10 text-[#ff9900] border-[#ff9900]/20",
    processing: "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/20",
    complete: "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20",
    accepted: "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
    failed: "bg-[#ff4466]/10 text-[#ff4466] border-[#ff4466]/20",
  }
  const labels: Record<string, string> = {
    accepted: "Order Placed",
  }
  return (
    <Badge variant="outline" className={`text-base px-4 py-1 ${styles[status] || ""}`}>
      {status === "processing" && (
        <span className="w-2 h-2 bg-[#0066ff] rounded-full mr-2 animate-pulse" />
      )}
      {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function QuoteDetailPage() {
  const params = useParams()
  const quoteId = params.id as string

  const [quote, setQuote] = useState<QuoteDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isProceeding, setIsProceeding] = useState(false)
  const [proceedSuccess, setProceedSuccess] = useState(false)

  const loadQuote = useCallback(async () => {
    const data = await getQuoteDetails(quoteId)
    setQuote(data)
    setIsLoading(false)
  }, [quoteId])

  useEffect(() => {
    loadQuote()
  }, [loadQuote])

  // Auto-refresh if processing
  useEffect(() => {
    if (!quote || quote.status !== "processing") return

    const interval = setInterval(async () => {
      const updated = await refreshSingleQuote(quoteId)
      if (updated) {
        loadQuote()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [quote, quoteId, loadQuote])

  async function handleRefresh() {
    setIsRefreshing(true)
    await refreshSingleQuote(quoteId)
    await loadQuote()
    setIsRefreshing(false)
  }

  async function handleProceed() {
    if (!quote) return
    setIsProceeding(true)
    const result = await proceedWithQuote(quoteId)
    if (result.success) {
      setProceedSuccess(true)
    }
    setIsProceeding(false)
  }

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#0066ff] border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-semibold text-white mb-4">Quote Not Found</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Quote Details</h1>
          <p className="text-[#808090]">
            Submitted {formatDate(quote.createdAt)}
          </p>
        </div>
        <div className="flex gap-3">
          {quote.status === "processing" && (
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-white/10"
            >
              {isRefreshing ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </>
              )}
            </Button>
          )}
          <Button variant="outline" asChild className="border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10">
            <Link href={`/dashboard/quotes/${quoteId}/add-location`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Location
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-white/10">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Pricing Hero - Show prominently if complete or accepted */}
      {(quote.status === "complete" || quote.status === "accepted") && quote.mrc && !proceedSuccess && (
        <Card className="bg-gradient-to-br from-[#0066ff]/10 to-[#00d4ff]/10 border-[#0066ff]/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-[#808090] text-sm uppercase tracking-wider mb-2">Best Price Found</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-[#0066ff]">
                    {formatCurrency(quote.mrc)}
                  </span>
                  <span className="text-[#808090] text-xl">/month</span>
                </div>
                {quote.nrc && quote.nrc > 0 && (
                  <p className="text-[#808090] mt-2">
                    + {formatCurrency(quote.nrc)} one-time setup fee
                  </p>
                )}
                {quote.carrierName && (
                  <p className="text-[#b0b0c0] mt-1">via {quote.carrierName}</p>
                )}
              </div>
              {quote.status === "complete" ? (
                <Button
                  size="lg"
                  onClick={handleProceed}
                  disabled={isProceeding}
                  className="bg-electric-gradient shadow-electric hover:shadow-electric-lg text-lg px-8"
                >
                  {isProceeding ? (
                    <>
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Proceed with Quote"
                  )}
                </Button>
              ) : (
                <Badge className="bg-[#00d4ff] text-black text-lg px-6 py-2">
                  Order Placed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {proceedSuccess && (
        <Card className="bg-[#00ff88]/10 border-[#00ff88]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#00ff88]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#00ff88]">Quote Accepted!</h3>
                <p className="text-[#b0b0c0]">
                  We&apos;ll be in touch shortly to finalize your order and schedule installation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {quote.status === "processing" && (
        <Card className="bg-[#0066ff]/5 border-[#0066ff]/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-[#0066ff]/30 rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-4 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="font-medium text-white">Searching for best rates...</p>
                <p className="text-sm text-[#808090]">
                  We&apos;re querying 200+ carriers. This usually takes 2-4 minutes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {quote.status === "failed" && quote.errorMessage && (
        <Card className="bg-[#ff4466]/10 border-[#ff4466]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ff4466]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ff4466]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#ff4466]">Quote Failed</h3>
                <p className="text-[#b0b0c0]">{quote.errorMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Contact Information</CardTitle>
            <CardDescription className="text-[#808090]">Customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#808090]">Name</p>
              <p className="font-medium text-white">{quote.lead.name}</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">Email</p>
              <p className="font-medium text-white">{quote.lead.email}</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">Phone</p>
              <p className="font-medium text-white">{quote.lead.phone}</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">Company</p>
              <p className="font-medium text-white">{quote.lead.company}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Location */}
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Service Location</CardTitle>
            <CardDescription className="text-[#808090]">Address for installation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#808090]">Street Address</p>
              <p className="font-medium text-white">{quote.streetAddress}</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">City</p>
              <p className="font-medium text-white">{quote.city}</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">State</p>
              <p className="font-medium text-white">{quote.state}</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">Zip Code</p>
              <p className="font-medium text-white">{quote.zipCode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Requirements */}
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Service Requirements</CardTitle>
            <CardDescription className="text-[#808090]">Requested configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#808090]">Bandwidth Speed</p>
              <p className="font-medium text-white text-lg">{formatSpeed(quote.speed)}</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">Contract Term</p>
              <p className="font-medium text-white text-lg">{quote.term} months</p>
            </div>
            <div>
              <p className="text-sm text-[#808090]">Product Type</p>
              <p className="font-medium text-white">Dedicated Internet Access (DIA)</p>
            </div>
          </CardContent>
        </Card>

        {/* Quote Status */}
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quote Status</CardTitle>
            <CardDescription className="text-[#808090]">Current status and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#808090]">Status</p>
              <div className="mt-1">{getStatusBadge(quote.status)}</div>
            </div>
            {quote.mrc && (
              <div>
                <p className="text-sm text-[#808090]">Monthly Recurring (MRC)</p>
                <p className="font-medium text-[#00ff88] text-xl">
                  {formatCurrency(quote.mrc)}/mo
                </p>
              </div>
            )}
            {quote.nrc !== null && quote.nrc > 0 && (
              <div>
                <p className="text-sm text-[#808090]">Non-Recurring (NRC)</p>
                <p className="font-medium text-white text-lg">
                  {formatCurrency(quote.nrc)}
                </p>
              </div>
            )}
            {quote.carrierName && (
              <div>
                <p className="text-sm text-[#808090]">Carrier</p>
                <p className="font-medium text-white">{quote.carrierName}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card className="bg-[#0a0a0f] border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-8 text-sm text-[#808090]">
            <div>
              <span className="font-medium text-[#b0b0c0]">Created:</span>{" "}
              {formatDate(quote.createdAt)}
            </div>
            <div>
              <span className="font-medium text-[#b0b0c0]">Updated:</span>{" "}
              {formatDate(quote.updatedAt)}
            </div>
            <div>
              <span className="font-medium text-[#b0b0c0]">Quote ID:</span>{" "}
              <span className="font-mono">{quote.quoteRequestId || quote.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
