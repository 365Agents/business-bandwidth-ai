"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe } from "@/components/ui/globe"
import { getQuoteById, refreshQuoteStatus } from "../actions"
import { OrderWizardDialog } from "@/components/order-wizard/order-wizard-dialog"
import type { MomentumCarrierQuote } from "@/lib/momentum-api"

const POLL_INTERVAL = 30000 // 30 seconds
const MIN_SEARCH_TIME = 3 * 60 * 1000 // 3 minutes minimum search
const MAX_POLL_TIME = 5 * 60 * 1000 // 5 minutes max

// Major last-mile carriers we query
const CARRIER_NAMES = [
  "AT&T", "Verizon", "Lumen", "Comcast Business", "Spectrum Enterprise",
  "Cox Business", "Frontier", "Windstream", "Zayo", "Crown Castle",
  "Cogent", "GTT", "Consolidated Communications", "TDS Telecom", "Cincinnati Bell",
  "Atlantic Broadband", "Altice Business", "Google Fiber", "Sonic", "Wave Business",
  "Astound Business", "Breezeline", "Mediacom Business", "Midco", "WOW! Business",
  "EPB Fiber", "OTELCO", "Shentel", "TeleCom", "Vexus Fiber",
  "Lumos Networks", "Segra", "FirstLight", "NTT", "Telia Carrier",
  "euNetworks", "Colt Technology", "DE-CIX", "PCCW Global", "Telstra",
  "Orange Business", "BT Wholesale", "Arelion", "Liberty Latin America", "Telefonica",
  "China Telecom Americas", "KDDI America", "SingTel", "PLDT", "Ooredoo",
]

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
  const [currentCarrierIndex, setCurrentCarrierIndex] = useState(0)

  // Add-on selections
  const [addOns, setAddOns] = useState({
    juniperSdwan: false,
    fiveGBackup: false,
    catoSase: false, // Interest only - requires consultation
  })

  // Order wizard state
  const [showOrderWizard, setShowOrderWizard] = useState(false)

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

  // Cycle through carrier names while processing
  useEffect(() => {
    if (status !== "processing") return

    const interval = setInterval(() => {
      setCurrentCarrierIndex(prev => (prev + 1) % CARRIER_NAMES.length)
    }, 400) // Fast cycling through carriers

    return () => clearInterval(interval)
  }, [status])

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

  // Calculate add-on costs
  const addOnPrices = {
    juniperSdwan: 250,
    fiveGBackup: 250,
    catoSase: 0, // Requires consultation
  }

  const totalAddOns = (addOns.juniperSdwan ? addOnPrices.juniperSdwan : 0) +
    (addOns.fiveGBackup ? addOnPrices.fiveGBackup : 0)

  const totalMrc = (bestQuote?.mrc || 0) + totalAddOns

  // Handle proceed with order - opens the wizard
  const handleProceed = () => {
    setShowOrderWizard(true)
  }

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
              {/* Globe visualization - 200 POPs querying carriers */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Globe
                    config={{
                      width: 240,
                      height: 240,
                      devicePixelRatio: 2,
                      dark: 1,
                      diffuse: 0.4,
                      mapSamples: 16000,
                      mapBrightness: 1.2,
                      baseColor: [0.3, 0.3, 0.3],
                      markerColor: [0.1, 0.8, 1],
                      glowColor: [0, 0.4, 1],
                    }}
                  />
                  {/* Glow effect behind globe */}
                  <div className="absolute inset-0 bg-[#0066ff]/10 blur-3xl rounded-full -z-10" />
                </div>
              </div>

              {/* Carrier ticker - scrolling through carriers being queried */}
              <div className="text-center space-y-1">
                <p className="text-xs text-[#808090] uppercase tracking-wider">Now Checking</p>
                <div className="h-8 flex items-center justify-center overflow-hidden">
                  <p className="text-lg font-semibold text-[#00d4ff] transition-opacity duration-200">
                    {CARRIER_NAMES[currentCarrierIndex]}
                  </p>
                </div>
                <p className="text-sm text-[#606070]">
                  and {CARRIER_NAMES.length - 1}+ other carriers
                </p>
              </div>

              {/* Progress bar - two phases */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#808090]">
                  <span>
                    {timeElapsed < MIN_SEARCH_TIME
                      ? "Gathering carrier bids..."
                      : "Waiting for final responses..."}
                  </span>
                  <span>~{Math.max(1, Math.ceil((MAX_POLL_TIME - timeElapsed) / 60000))} min remaining</span>
                </div>
                <div className="w-full bg-[#1a1a28] rounded-full h-3 overflow-hidden relative">
                  {/* Minimum search marker at 60% (3 out of 5 min) */}
                  <div className="absolute left-[60%] top-0 bottom-0 w-0.5 bg-[#404050] z-10" />
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeElapsed < MIN_SEARCH_TIME
                        ? "bg-gradient-to-r from-[#0066ff] to-[#00d4ff]"
                        : "bg-gradient-to-r from-[#0066ff] via-[#00d4ff] to-[#00ff88]"
                    }`}
                    style={{ width: `${Math.min(100, (timeElapsed / MAX_POLL_TIME) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#505060]">
                  <span>Start</span>
                  <span className="text-[#00d4ff]">3 min (best prices)</span>
                  <span>5 min</span>
                </div>
              </div>

              {/* How it works - key messaging */}
              <div className="bg-gradient-to-r from-[#0066ff]/10 to-[#00d4ff]/10 rounded-xl p-4 border border-[#0066ff]/20">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#0066ff]/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-white">
                      {timeElapsed < MIN_SEARCH_TIME
                        ? `Searching for at least ${Math.ceil((MIN_SEARCH_TIME - timeElapsed) / 60000)} more minutes...`
                        : "Finalizing best prices..."}
                    </p>
                    <p className="text-sm text-[#b0b0c0]">
                      We&apos;re querying <span className="text-[#00d4ff] font-medium">200+ carriers</span> in real-time.
                      {timeElapsed < MIN_SEARCH_TIME ? (
                        <> Prices often <span className="text-[#00ff88] font-medium">drop 20-40%</span> as slower carriers respond with competitive bids. We&apos;ll keep searching to find you the lowest rate.</>
                      ) : (
                        <> Most carriers have responded. We&apos;re waiting for any final quotes that may lower your price.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live status */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full" />
                  <span className="text-[#808090]">Check #{pollCount + 1}</span>
                </div>
                <span className="text-[#404050]">•</span>
                <span className="text-[#808090]">Updates every 30 sec</span>
                {quotes.length > 0 && (
                  <>
                    <span className="text-[#404050]">•</span>
                    <span className="text-[#00ff88]">{quotes.length} price{quotes.length > 1 ? 's' : ''} found</span>
                  </>
                )}
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#808090] uppercase tracking-wider">
                  Prices Found ({quotes.length})
                </h3>
                {status === "processing" && (
                  <span className="text-xs text-[#00ff88]">
                    Price may still drop ↓
                  </span>
                )}
              </div>

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

          {/* No quotes yet - waiting indicator */}
          {quotes.length === 0 && status === "processing" && (
            <div className="bg-[#12121a] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#0066ff]/30 border-t-[#0066ff] rounded-full animate-spin" />
                <div>
                  <p className="font-medium">Waiting for first carrier response...</p>
                  <p className="text-sm text-[#808090]">First results typically appear within 30-60 seconds</p>
                </div>
              </div>
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

      {/* Upsell Opportunities - Show when quote is complete */}
      {status === "complete" && (
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Enhance Your Network</CardTitle>
            <p className="text-sm text-[#808090]">Select add-ons to include in your order</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Juniper SDWAN */}
            <label
              className={`block rounded-xl p-4 border cursor-pointer transition-all ${
                addOns.juniperSdwan
                  ? "border-[#00d4ff] bg-[#00d4ff]/5"
                  : "border-white/5 bg-[#12121a] hover:border-[#00d4ff]/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={addOns.juniperSdwan}
                    onChange={(e) => setAddOns({ ...addOns, juniperSdwan: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-[#0a0a0f] text-[#00d4ff] focus:ring-[#00d4ff] focus:ring-offset-0"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold">Juniper SD-WAN</span>
                    <Badge className="bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20">Popular</Badge>
                  </div>
                  <p className="text-sm text-[#808090] mb-2">
                    Intelligent routing with Mist AI management included. Optimize traffic across multiple links automatically.
                  </p>
                  <p className="text-[#00ff88] font-semibold">+$250<span className="text-[#808090] font-normal">/mo</span></p>
                </div>
              </div>
            </label>

            {/* 5G Internet */}
            <label
              className={`block rounded-xl p-4 border cursor-pointer transition-all ${
                addOns.fiveGBackup
                  ? "border-[#00d4ff] bg-[#00d4ff]/5"
                  : "border-white/5 bg-[#12121a] hover:border-[#00d4ff]/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={addOns.fiveGBackup}
                    onChange={(e) => setAddOns({ ...addOns, fiveGBackup: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-[#0a0a0f] text-[#00d4ff] focus:ring-[#00d4ff] focus:ring-offset-0"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold">5G Internet Backup</span>
                    <Badge className="bg-[#ff9900]/10 text-[#ff9900] border-[#ff9900]/20">US Only</Badge>
                  </div>
                  <p className="text-sm text-[#808090] mb-2">
                    Automatic failover to 5G when your primary connection goes down. Stay connected no matter what.
                  </p>
                  <p className="text-[#00ff88] font-semibold">+$250<span className="text-[#808090] font-normal">/mo</span></p>
                </div>
              </div>
            </label>

            {/* Cato SASE */}
            <label
              className={`block rounded-xl p-4 border cursor-pointer transition-all ${
                addOns.catoSase
                  ? "border-[#0066ff] bg-[#0066ff]/5"
                  : "border-white/5 bg-[#12121a] hover:border-[#0066ff]/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={addOns.catoSase}
                    onChange={(e) => setAddOns({ ...addOns, catoSase: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-[#0a0a0f] text-[#0066ff] focus:ring-[#0066ff] focus:ring-offset-0"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold">Cato SASE</span>
                    <Badge className="bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/20">Enterprise</Badge>
                  </div>
                  <p className="text-sm text-[#808090] mb-2">
                    Secure Access Service Edge - combine networking and security in the cloud. Per-user pricing available.
                  </p>
                  <p className="text-[#808090] text-sm">
                    <span className="text-[#0066ff]">Requires consultation</span> — we&apos;ll discuss pricing on our call
                  </p>
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Order Summary - Show when add-ons selected or quote complete */}
      {status === "complete" && bestQuote && (
        <Card className="bg-[#0a0a0f] border-[#0066ff]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Base quote */}
            <div className="flex justify-between text-sm">
              <span className="text-[#808090]">Dedicated Internet ({quote?.speed} Mbps)</span>
              <span>{formatCurrency(bestQuote.mrc)}/mo</span>
            </div>

            {/* Selected add-ons */}
            {addOns.juniperSdwan && (
              <div className="flex justify-between text-sm">
                <span className="text-[#808090]">Juniper SD-WAN</span>
                <span>+{formatCurrency(addOnPrices.juniperSdwan)}/mo</span>
              </div>
            )}
            {addOns.fiveGBackup && (
              <div className="flex justify-between text-sm">
                <span className="text-[#808090]">5G Internet Backup</span>
                <span>+{formatCurrency(addOnPrices.fiveGBackup)}/mo</span>
              </div>
            )}
            {addOns.catoSase && (
              <div className="flex justify-between text-sm">
                <span className="text-[#808090]">Cato SASE</span>
                <span className="text-[#0066ff]">TBD</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold">Total Monthly</span>
                <span className="font-display text-xl font-bold text-[#0066ff]">
                  {formatCurrency(totalMrc)}/mo
                  {addOns.catoSase && <span className="text-sm font-normal text-[#808090]"> + Cato</span>}
                </span>
              </div>
              {bestQuote.nrc > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-[#808090]">One-time setup</span>
                  <span className="text-[#808090]">{formatCurrency(bestQuote.nrc)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Accepted Message */}
      {quote?.status === "accepted" && (
        <Card className="bg-[#00ff88]/10 border-[#00ff88]/30">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#00ff88] mb-1">Order Confirmed</h3>
            <p className="text-sm text-[#808090]">
              You&apos;ve already accepted this quote. Our team will be in touch shortly.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 items-center">
        {status === "complete" && bestQuote && quote?.status !== "accepted" && (
          <Button
            className="bg-electric-gradient shadow-electric hover:shadow-electric-lg w-full max-w-md"
            size="lg"
            onClick={handleProceed}
          >
            {addOns.catoSase ? (
              <>Schedule Consultation &amp; Proceed</>
            ) : (
              <>Proceed with Order — {formatCurrency(totalMrc)}/mo</>
            )}
          </Button>
        )}
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/quote">Request New Quote</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Order Wizard Dialog */}
      {quote && bestQuote && (
        <OrderWizardDialog
          open={showOrderWizard}
          onOpenChange={setShowOrderWizard}
          quoteId={quoteId}
          quoteData={{
            leadName: quote.lead?.name || "",
            leadEmail: quote.lead?.email || "",
            leadPhone: quote.lead?.phone || "",
            leadCompany: quote.lead?.company || "",
            streetAddress: quote.streetAddress,
            city: quote.city,
            state: quote.state,
            zipCode: quote.zipCode,
            speed: quote.speed,
            term: quote.term,
            mrc: bestQuote.mrc,
            nrc: bestQuote.nrc || 0,
            carrierName: bestQuote.carrierName || null,
            addOnSdwan: addOns.juniperSdwan,
            addOn5g: addOns.fiveGBackup,
            addOnCatoSase: addOns.catoSase,
          }}
        />
      )}
    </div>
  )
}
