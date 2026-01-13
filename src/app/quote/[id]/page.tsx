"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getQuoteById, refreshQuoteStatus } from "../actions"
import type { MomentumCarrierQuote } from "@/lib/momentum-api"

const POLL_INTERVAL = 30000 // 30 seconds
const MAX_POLL_TIME = 5 * 60 * 1000 // 5 minutes max

export default function QuoteStatusPage() {
  const params = useParams()
  const router = useRouter()
  const quoteId = params.id as string

  const [quote, setQuote] = useState<Awaited<ReturnType<typeof getQuoteById>> | null>(null)
  const [quotes, setQuotes] = useState<MomentumCarrierQuote[]>([])
  const [status, setStatus] = useState<"loading" | "processing" | "complete" | "failed" | "timeout">("loading")
  const [pollCount, setPollCount] = useState(0)
  const [startTime] = useState(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Load initial quote data
  useEffect(() => {
    async function loadQuote() {
      const data = await getQuoteById(quoteId)
      if (!data) {
        setError("Quote not found")
        setStatus("failed")
        return
      }
      setQuote(data)

      // If already complete or failed, don't poll
      if (data.status === "complete" || data.status === "failed") {
        setStatus(data.status as "complete" | "failed")
        if (data.mrc) {
          setQuotes([{
            quoteStatus: "COMPLETE",
            mrc: data.mrc,
            nrc: data.nrc || 0,
            carrierName: data.carrierName || undefined,
          }])
        }
      } else {
        setStatus("processing")
      }
    }
    loadQuote()
  }, [quoteId])

  // Update elapsed time every second for progress bar
  useEffect(() => {
    if (status !== "processing") return

    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, startTime])

  // Polling logic
  const pollForUpdates = useCallback(async () => {
    if (status !== "processing") return

    // Check timeout
    if (Date.now() - startTime > MAX_POLL_TIME) {
      setStatus("timeout")
      return
    }

    try {
      const result = await refreshQuoteStatus(quoteId)

      if (result) {
        // Update quotes list - show all found quotes
        if (result.quotes.length > 0) {
          setQuotes(result.quotes)
        }

        // Update status
        if (result.status === "complete") {
          setStatus("complete")
        } else if (result.status === "failed") {
          setStatus("failed")
          setError(result.error || "Quote failed")
        }
      }

      setPollCount(prev => prev + 1)
    } catch (err) {
      console.error("Poll error:", err)
      // Don't fail on poll error, just continue
    }
  }, [quoteId, status, startTime])

  // Set up polling interval
  useEffect(() => {
    if (status !== "processing") return

    // Initial poll after 5 seconds
    const initialTimeout = setTimeout(pollForUpdates, 5000)

    // Then poll every 30 seconds
    const interval = setInterval(pollForUpdates, POLL_INTERVAL)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [status, pollForUpdates])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get best quote (lowest MRC)
  const bestQuote = quotes.length > 0 ? quotes[0] : null

  if (status === "loading") {
    return (
      <div className="container py-16 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#0066ff] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#808090]">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (error && status === "failed") {
    return (
      <div className="container py-16 max-w-3xl mx-auto">
        <Card className="bg-[#0a0a0f] border-[#ff4466]/30">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-[#ff4466]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#ff4466]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#ff4466] mb-2">Quote Failed</h2>
            <p className="text-[#808090] mb-6">{error}</p>
            <Button onClick={() => router.push("/quote")} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl font-semibold">
          {status === "complete" ? "Your Quote is Ready" : "Finding Best Rates"}
        </h1>
        {quote && (
          <p className="text-[#808090]">
            {quote.streetAddress}, {quote.city}, {quote.state} {quote.zipCode}
          </p>
        )}
      </div>

      {/* Status Card */}
      <Card className="bg-[#0a0a0f] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quote Status</CardTitle>
            <Badge
              variant="secondary"
              className={
                status === "complete"
                  ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20"
                  : status === "timeout"
                  ? "bg-[#ff9900]/10 text-[#ff9900] border-[#ff9900]/20"
                  : "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/20"
              }
            >
              {status === "complete" ? "Complete" : status === "timeout" ? "Timed Out" : "Searching..."}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator - Always show while processing */}
          {status === "processing" && (
            <div className="space-y-4">
              {/* Main status */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-[#0066ff]/30 rounded-full" />
                  <div className="absolute inset-0 w-10 h-10 border-4 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {quotes.length === 0
                      ? "Querying 200+ carriers..."
                      : "Still searching for better prices..."}
                  </p>
                  <p className="text-sm text-[#808090]">
                    Check #{pollCount + 1} • Updates every 30 seconds • ~{Math.max(0, Math.ceil((MAX_POLL_TIME - timeElapsed) / 60000))} min remaining
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1a1a28] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] transition-all duration-1000"
                  style={{ width: `${Math.min(100, (timeElapsed / MAX_POLL_TIME) * 100)}%` }}
                />
              </div>

              {/* How it works explanation */}
              <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
                <p className="text-sm text-[#b0b0c0]">
                  <span className="text-[#0066ff] font-medium">How this works:</span> We&apos;re checking rates from over 200 carriers for your location.
                  {quotes.length > 0
                    ? ` We found ${quotes.length} price${quotes.length > 1 ? 's' : ''} so far, but more carriers are still responding. The price may go down as we find better rates. We'll keep searching for up to 5 minutes.`
                    : " As carriers respond, prices will appear below. You may see multiple prices as different carriers respond at different speeds. The best price will be highlighted."}
                </p>
              </div>
            </div>
          )}

          {/* Timeout Message */}
          {status === "timeout" && (
            <div className="bg-[#ff9900]/10 rounded-xl p-4 border border-[#ff9900]/20">
              <p className="text-sm text-[#ff9900]">
                The quote is taking longer than expected. The carriers may still be processing.
                You can check back later or contact us for assistance.
              </p>
            </div>
          )}

          {/* Quotes List */}
          {quotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#808090] uppercase tracking-wider">
                Prices Found ({quotes.length})
              </h3>

              {quotes.map((q, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 border transition-all ${
                    index === 0
                      ? "bg-gradient-to-r from-[#0066ff]/10 to-[#00d4ff]/10 border-[#0066ff]/30 shadow-[0_0_30px_rgba(0,102,255,0.1)]"
                      : "bg-[#12121a] border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {index === 0 && (
                        <Badge className={status === "processing" ? "bg-[#00d4ff] text-black mb-2" : "bg-[#00ff88] text-black mb-2"}>
                          {status === "processing" ? "Current Best" : "Best Price"}
                        </Badge>
                      )}
                      <p className="text-sm text-[#808090]">
                        {q.carrierName || `Carrier ${index + 1}`}
                        {q.productName && ` • ${q.productName}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-display text-2xl font-bold ${
                        index === 0 ? "text-[#0066ff]" : "text-white"
                      }`}>
                        {formatCurrency(q.mrc)}
                        <span className="text-sm font-normal text-[#808090]">/mo</span>
                      </p>
                      {q.nrc > 0 && (
                        <p className="text-sm text-[#808090]">
                          +{formatCurrency(q.nrc)} setup
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No quotes yet */}
          {quotes.length === 0 && status === "processing" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#0066ff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0066ff] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-[#808090]">Waiting for carrier responses...</p>
              <p className="text-sm text-[#505060] mt-1">First results typically appear within 30-60 seconds</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details */}
      {quote && (
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#808090]">Speed</p>
                <p className="font-medium">{quote.speed} Mbps</p>
              </div>
              <div>
                <p className="text-[#808090]">Term</p>
                <p className="font-medium">{quote.term} months</p>
              </div>
              <div>
                <p className="text-[#808090]">Product</p>
                <p className="font-medium">Dedicated Internet Access (DIA)</p>
              </div>
              <div>
                <p className="text-[#808090]">Quote ID</p>
                <p className="font-mono text-xs">{quote.quoteRequestId || quote.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {status === "complete" && bestQuote && (
          <Button className="bg-electric-gradient shadow-electric hover:shadow-electric-lg">
            Proceed with Quote
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/quote">Request New Quote</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">View Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
