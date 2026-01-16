"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleAddressAutocomplete, type ParsedAddress, type SearchMode, type AddressType } from "@/components/google-address-autocomplete"

import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote"
import { submitQuoteRequest } from "./actions"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

const speedOptions = [
  { value: "10", label: "10 Mbps", description: "Basic" },
  { value: "20", label: "20 Mbps", description: "Starter" },
  { value: "50", label: "50 Mbps", description: "Small team" },
  { value: "100", label: "100 Mbps", description: "Small office" },
  { value: "250", label: "250 Mbps", description: "Medium office" },
  { value: "500", label: "500 Mbps", description: "Large office" },
  { value: "1000", label: "1 Gbps", description: "Enterprise" },
  { value: "10000", label: "10 Gbps", description: "Data center" },
]

const termOptions = [
  { value: "12", label: "12 months" },
  { value: "24", label: "24 months" },
  { value: "36", label: "36 months" },
  { value: "60", label: "60 months" },
]

export default function QuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddressVerified, setIsAddressVerified] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchMode>("address")
  const [currentAddressType, setCurrentAddressType] = useState<AddressType | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  // Read all address query params
  const streetFromParams = searchParams.get("street") || ""
  const cityFromParams = searchParams.get("city") || ""
  const stateFromParams = searchParams.get("state") || ""
  const zipFromParams = searchParams.get("zip") || ""
  // Legacy support for old single-param format
  const legacyAddress = searchParams.get("address") || ""

  // Determine initial street address
  const initialStreet = streetFromParams || legacyAddress

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      streetAddress: initialStreet,
      city: cityFromParams,
      state: stateFromParams,
      zipCode: zipFromParams,
      speed: "",
      term: "",
    },
  })

  // Set verified badge if came from Google autocomplete
  useEffect(() => {
    if (streetFromParams && cityFromParams && stateFromParams) {
      setIsAddressVerified(true)
    }
  }, [streetFromParams, cityFromParams, stateFromParams])

  function handlePlaceSelect(parsedAddress: ParsedAddress) {
    // Auto-fill all address fields when a place is selected
    form.setValue("streetAddress", parsedAddress.streetAddress, { shouldValidate: true })
    form.setValue("city", parsedAddress.city, { shouldValidate: true })
    form.setValue("state", parsedAddress.state, { shouldValidate: true })
    form.setValue("zipCode", parsedAddress.zipCode, { shouldValidate: true })
    // Store addressType and placeId for analytics
    form.setValue("addressType", parsedAddress.addressType)
    form.setValue("placeId", parsedAddress.placeId)
    setCurrentAddressType(parsedAddress.addressType)
    setIsAddressVerified(true)

    // If it's an establishment and has a business name, suggest for company field
    if (parsedAddress.isEstablishment && parsedAddress.businessName) {
      const currentCompany = form.getValues("company")
      if (!currentCompany) {
        form.setValue("company", parsedAddress.businessName, { shouldValidate: true })
      }
    }
  }

  function handleStreetChange(value: string) {
    form.setValue("streetAddress", value)
    // If user manually types, remove verified status and clear addressType
    setIsAddressVerified(false)
    setCurrentAddressType(null)
    form.setValue("addressType", undefined)
    form.setValue("placeId", undefined)
  }

  async function onSubmit(data: QuoteFormValues) {
    // Verify Turnstile token if site key is configured
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error("Please complete the verification", {
        description: "Click the checkbox to verify you're human.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Verify token server-side if we have one
      if (turnstileToken) {
        const verifyResponse = await fetch("/api/turnstile/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        })
        const verifyResult = await verifyResponse.json()
        if (!verifyResult.success) {
          toast.error("Verification failed", {
            description: "Please try again.",
          })
          turnstileRef.current?.reset()
          setTurnstileToken(null)
          setIsSubmitting(false)
          return
        }
      }

      const result = await submitQuoteRequest({ ...data, turnstileToken: turnstileToken || undefined })
      if (result.success && result.quoteId) {
        toast.success("Quote request submitted!", {
          description: "Searching 200+ carriers for the best rates...",
        })
        // Redirect to the live status page
        router.push(`/quote/${result.quoteId}`)
      } else {
        toast.error("Failed to submit", {
          description: result.error || "Please try again.",
        })
        turnstileRef.current?.reset()
        setTurnstileToken(null)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
      turnstileRef.current?.reset()
      setTurnstileToken(null)
      setIsSubmitting(false)
    }
  }

  const selectedSpeed = form.watch("speed")
  const selectedTerm = form.watch("term")

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Card className="bg-[#0a0a0f] border-white/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-display text-3xl">Request a Quote</CardTitle>
          <CardDescription className="text-[#808090]">
            Get pricing for business internet at your location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Service Requirements - HERO SECTION */}
              <div className="bg-gradient-to-br from-[#12121a] to-[#1a1a28] rounded-2xl p-6 border border-[#0066ff]/20">
                <h3 className="font-display text-xl font-semibold mb-6 text-center">
                  What do you need?
                </h3>

                {/* Bandwidth Selection - Large Cards */}
                <FormField
                  control={form.control}
                  name="speed"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-[#808090] text-sm uppercase tracking-wider">
                        Bandwidth Speed
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {speedOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              field.value === option.value
                                ? "border-[#0066ff] bg-[#0066ff]/10 shadow-[0_0_20px_rgba(0,102,255,0.3)]"
                                : "border-white/10 hover:border-white/30 bg-[#12121a]"
                            }`}
                          >
                            <div className={`font-display text-2xl font-bold ${
                              field.value === option.value ? "text-[#0066ff]" : "text-white"
                            }`}>
                              {option.label.split(" ")[0]}
                            </div>
                            <div className="text-xs text-[#808090] mt-1">
                              {option.label.split(" ")[1]}
                            </div>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Term Selection */}
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#808090] text-sm uppercase tracking-wider">
                        Contract Term
                      </FormLabel>
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        {termOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                              field.value === option.value
                                ? "border-[#00d4ff] bg-[#00d4ff]/10 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                                : "border-white/10 hover:border-white/30 bg-[#12121a]"
                            }`}
                          >
                            <div className={`font-semibold ${
                              field.value === option.value ? "text-[#00d4ff]" : "text-white"
                            }`}>
                              {option.label}
                            </div>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selection Summary */}
                {selectedSpeed && selectedTerm && (
                  <div className="mt-6 p-4 rounded-xl bg-[#0066ff]/5 border border-[#0066ff]/20 text-center">
                    <span className="text-[#808090]">You&apos;re requesting </span>
                    <span className="text-[#0066ff] font-semibold">
                      {speedOptions.find(s => s.value === selectedSpeed)?.label}
                    </span>
                    <span className="text-[#808090]"> for </span>
                    <span className="text-[#00d4ff] font-semibold">
                      {termOptions.find(t => t.value === selectedTerm)?.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Service Location</h3>
                  {isAddressVerified && currentAddressType === "business" && (
                    <Badge variant="secondary" className="text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Business Verified
                    </Badge>
                  )}
                  {isAddressVerified && currentAddressType === "residential" && (
                    <Badge variant="secondary" className="text-[#ff4466] bg-[#ff4466]/10 border-[#ff4466]/20">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Residential - Not Eligible
                    </Badge>
                  )}
                  {isAddressVerified && currentAddressType === "unknown" && (
                    <Badge variant="secondary" className="text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/20">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Verify Address
                    </Badge>
                  )}
                </div>

                {/* Error for residential address - blocks submission */}
                {currentAddressType === "residential" && (
                  <Alert className="bg-[#ff4466]/10 border-[#ff4466]/30">
                    <svg
                      className="w-4 h-4 text-[#ff4466]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <AlertDescription className="text-[#ff4466] ml-2">
                      <strong>This appears to be a residential address.</strong> Business internet service is only available for commercial locations.
                      <button
                        type="button"
                        onClick={() => setSearchMode("establishment")}
                        className="ml-2 text-[#0066ff] hover:underline font-medium"
                      >
                        Search by business name instead
                      </button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warning for unknown address type */}
                {currentAddressType === "unknown" && (
                  <Alert className="bg-[#ffaa00]/5 border-[#ffaa00]/20">
                    <svg
                      className="w-4 h-4 text-[#ffaa00]"
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
                    <AlertDescription className="text-[#b0b0c0] ml-2">
                      This appears to be a street address. Business internet quotes are for commercial locations.
                      You can still submit, but we recommend verifying this is a business address.
                      <button
                        type="button"
                        onClick={() => setSearchMode("establishment")}
                        className="ml-2 text-[#0066ff] hover:underline"
                      >
                        Search by business name instead
                      </button>
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {searchMode === "establishment" ? "Business Name" : "Street Address"}
                      </FormLabel>
                      <FormControl>
                        <GoogleAddressAutocomplete
                          defaultValue={field.value}
                          onAddressChange={handleStreetChange}
                          onPlaceSelect={handlePlaceSelect}
                          placeholder={searchMode === "establishment" ? "Search by business name..." : "Start typing to search..."}
                          inputClassName="bg-[#12121a] border-white/10"
                          searchMode={searchMode}
                          onSearchModeChange={setSearchMode}
                          showModeToggle
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="col-span-2 md:col-span-2">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Austin" className="bg-[#12121a] border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="TX" className="bg-[#12121a] border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="78701" className="bg-[#12121a] border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" className="bg-[#12121a] border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@company.com" className="bg-[#12121a] border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(555) 123-4567" className="bg-[#12121a] border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" className="bg-[#12121a] border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Bot Protection */}
              {TURNSTILE_SITE_KEY && (
                <div className="flex justify-center">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={setTurnstileToken}
                    onError={() => setTurnstileToken(null)}
                    onExpire={() => setTurnstileToken(null)}
                    options={{
                      theme: "dark",
                    }}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-electric-gradient shadow-electric hover:shadow-electric-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                disabled={isSubmitting || currentAddressType === "residential" || Boolean(TURNSTILE_SITE_KEY && !turnstileToken)}
              >
                {isSubmitting ? "Finding Best Rates..." : currentAddressType === "residential" ? "Business Address Required" : "Get My Quote"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
