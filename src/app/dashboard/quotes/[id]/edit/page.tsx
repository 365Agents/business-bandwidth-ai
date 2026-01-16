"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getQuoteDetails } from "../actions"
import { updateAndReprocessQuote } from "./actions"

type QuoteDetails = NonNullable<Awaited<ReturnType<typeof getQuoteDetails>>>

const SPEED_OPTIONS = [
  { value: "100", label: "100 Mbps" },
  { value: "200", label: "200 Mbps" },
  { value: "500", label: "500 Mbps" },
  { value: "1000", label: "1 Gbps" },
  { value: "2000", label: "2 Gbps" },
  { value: "5000", label: "5 Gbps" },
  { value: "10000", label: "10 Gbps" },
]

const TERM_OPTIONS = [
  { value: "12", label: "12 months" },
  { value: "24", label: "24 months" },
  { value: "36", label: "36 months" },
  { value: "60", label: "60 months" },
]

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
]

export default function EditQuotePage() {
  const params = useParams()
  const router = useRouter()
  const quoteId = params.id as string

  const [quote, setQuote] = useState<QuoteDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [streetAddress, setStreetAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [speed, setSpeed] = useState("")
  const [term, setTerm] = useState("")

  const loadQuote = useCallback(async () => {
    const data = await getQuoteDetails(quoteId)
    if (data) {
      setQuote(data)
      setStreetAddress(data.streetAddress)
      setCity(data.city)
      setState(data.state)
      setZipCode(data.zipCode)
      setSpeed(data.speed)
      setTerm(data.term)
    }
    setIsLoading(false)
  }, [quoteId])

  useEffect(() => {
    loadQuote()
  }, [loadQuote])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const result = await updateAndReprocessQuote(quoteId, {
        streetAddress,
        city,
        state,
        zipCode,
        speed,
        term,
      })

      if (result.success) {
        // Redirect to the quote page to see processing
        router.push(`/quote/${quoteId}`)
      } else {
        setError(result.error || "Failed to update quote")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
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
      <div className="container py-16">
        <Card className="bg-[#0a0a0f] border-white/10 max-w-lg mx-auto">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Quote Not Found</h2>
            <p className="text-[#808090] mb-4">This quote doesn&apos;t exist or has been deleted.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild className="text-[#808090]">
          <Link href={`/dashboard/quotes/${quoteId}`}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Edit Quote</h1>
          <p className="text-sm text-[#808090]">Update details and reprocess for new pricing</p>
        </div>
      </div>

      <Card className="bg-[#0a0a0f] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#808090] uppercase tracking-wider">
                Service Location
              </h3>

              <div className="space-y-2">
                <Label htmlFor="streetAddress" className="text-[#b0b0c0]">
                  Street Address
                </Label>
                <Input
                  id="streetAddress"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="123 Main St"
                  required
                  className="bg-[#12121a] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[#b0b0c0]">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    required
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-[#b0b0c0]">State</Label>
                  <Select value={state} onValueChange={setState} required>
                    <SelectTrigger className="bg-[#12121a] border-white/10 text-white">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-white/10">
                      {US_STATES.map((s) => (
                        <SelectItem key={s} value={s} className="text-white hover:bg-[#1a1a28]">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-[#b0b0c0]">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                  required
                  maxLength={5}
                  className="bg-[#12121a] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff] w-32"
                />
              </div>
            </div>

            {/* Service Options Section */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-[#808090] uppercase tracking-wider">
                Service Options
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speed" className="text-[#b0b0c0]">Bandwidth</Label>
                  <Select value={speed} onValueChange={setSpeed} required>
                    <SelectTrigger className="bg-[#12121a] border-white/10 text-white">
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-white/10">
                      {SPEED_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-[#1a1a28]">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term" className="text-[#b0b0c0]">Contract Term</Label>
                  <Select value={term} onValueChange={setTerm} required>
                    <SelectTrigger className="bg-[#12121a] border-white/10 text-white">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12121a] border-white/10">
                      {TERM_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-[#1a1a28]">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#ff4466]/10 border border-[#ff4466]/30 rounded-lg p-4">
                <p className="text-[#ff4466] text-sm">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-[#0066ff]/10 border border-[#0066ff]/20 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-[#0066ff] flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-[#b0b0c0]">
                  Updating these details will resubmit the quote to our carrier network.
                  New pricing will be returned based on the updated location and service options.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5"
                onClick={() => router.push(`/dashboard/quotes/${quoteId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-electric-gradient shadow-electric hover:shadow-electric-lg"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Reprocessing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update & Reprocess
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
