"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

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
import { GoogleAddressAutocomplete, type ParsedAddress } from "@/components/google-address-autocomplete"

import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote"
import { submitQuoteRequest } from "./actions"

const speedOptions = [
  { value: "100", label: "100 Mbps" },
  { value: "250", label: "250 Mbps" },
  { value: "500", label: "500 Mbps" },
  { value: "1000", label: "1 Gbps" },
  { value: "10000", label: "10 Gbps" },
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
    setIsAddressVerified(true)
  }

  function handleStreetChange(value: string) {
    form.setValue("streetAddress", value)
    // If user manually types, remove verified status
    setIsAddressVerified(false)
  }

  async function onSubmit(data: QuoteFormValues) {
    setIsSubmitting(true)
    try {
      const result = await submitQuoteRequest(data)
      if (result.success) {
        toast.success("Quote request submitted!", {
          description: "We're finding the best rates for your location.",
        })
        router.push("/dashboard")
      } else {
        toast.error("Failed to submit", {
          description: result.error || "Please try again.",
        })
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Request a Quote</CardTitle>
          <CardDescription>
            Get pricing for business internet at your location. We&apos;ll check 200+ carriers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <Input placeholder="John Smith" {...field} />
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
                          <Input type="email" placeholder="john@company.com" {...field} />
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
                          <Input type="tel" placeholder="(555) 123-4567" {...field} />
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
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Service Location</h3>
                  {isAddressVerified && (
                    <Badge variant="secondary" className="text-green-600 bg-green-100">
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
                      Verified
                    </Badge>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <GoogleAddressAutocomplete
                          value={field.value}
                          onChange={handleStreetChange}
                          onPlaceSelect={handlePlaceSelect}
                          placeholder="Start typing to search..."
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
                          <Input placeholder="Austin" {...field} />
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
                          <Input placeholder="TX" {...field} />
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
                          <Input placeholder="78701" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Service Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="speed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bandwidth Speed</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {speedOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Term</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {termOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Get My Quote"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
