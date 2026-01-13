"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { GoogleAddressAutocomplete, type ParsedAddress, type SearchMode } from "@/components/google-address-autocomplete"

export function AddressInput() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [residentialWarning, setResidentialWarning] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchMode>("address")
  const lastParsedAddressRef = useRef<ParsedAddress | null>(null)

  const navigateToQuote = useCallback((parsedAddress: ParsedAddress) => {
    const params = new URLSearchParams()
    if (parsedAddress.streetAddress) params.set("street", parsedAddress.streetAddress)
    if (parsedAddress.city) params.set("city", parsedAddress.city)
    if (parsedAddress.state) params.set("state", parsedAddress.state)
    if (parsedAddress.zipCode) params.set("zip", parsedAddress.zipCode)
    if (parsedAddress.formattedAddress) params.set("formatted", parsedAddress.formattedAddress)

    router.push(`/quote?${params.toString()}`)
  }, [router])

  const handlePlaceSelect = useCallback((parsedAddress: ParsedAddress) => {
    // Store the parsed address for potential form submission
    lastParsedAddressRef.current = parsedAddress

    // Note: Residential detection disabled - Google's place types aren't reliable
    // for distinguishing business vs residential when searching by street address.
    // A business address like "1600 Amphitheatre Pkwy" won't have "establishment" type
    // unless you search by business name. Consider using a commercial address
    // validation API for more accurate detection.

    setResidentialWarning(false)
    navigateToQuote(parsedAddress)
  }, [navigateToQuote])

  // Geocode an address string to get parsed components
  const geocodeAddress = useCallback((addressString: string): Promise<ParsedAddress | null> => {
    return new Promise((resolve) => {
      if (!window.google?.maps?.places) {
        resolve(null)
        return
      }

      const geocoder = new google.maps.Geocoder()
      geocoder.geocode(
        { address: addressString, componentRestrictions: { country: "us" } },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            const place = results[0]
            const components = place.address_components || []

            let streetNumber = ""
            let route = ""
            let city = ""
            let state = ""
            let zipCode = ""

            for (const component of components) {
              const types = component.types
              if (types.includes("street_number")) {
                streetNumber = component.long_name
              } else if (types.includes("route")) {
                route = component.long_name
              } else if (types.includes("locality")) {
                city = component.long_name
              } else if (types.includes("sublocality_level_1") && !city) {
                city = component.long_name
              } else if (types.includes("administrative_area_level_1")) {
                state = component.short_name
              } else if (types.includes("postal_code")) {
                zipCode = component.long_name
              }
            }

            const streetAddress = streetNumber && route
              ? `${streetNumber} ${route}`
              : route || streetNumber

            // Check place types for residential detection
            const placeTypes = place.types || []
            const businessTypes = ["establishment", "store", "point_of_interest"]
            const hasBusiness = placeTypes.some(type => businessTypes.includes(type))
            const isEstablishment = placeTypes.includes("establishment")

            resolve({
              streetAddress,
              city,
              state,
              zipCode,
              placeId: place.place_id || "",
              formattedAddress: place.formatted_address || "",
              isLikelyResidential: !hasBusiness,
              addressType: isEstablishment ? "business" : "unknown",
              isEstablishment,
            })
          } else {
            resolve(null)
          }
        }
      )
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedAddress = address.trim()
    if (!trimmedAddress) {
      router.push("/quote")
      return
    }

    // If we have a recently selected address from autocomplete, use it
    if (lastParsedAddressRef.current &&
        lastParsedAddressRef.current.formattedAddress.toLowerCase().includes(trimmedAddress.toLowerCase().substring(0, 10))) {
      if (lastParsedAddressRef.current.isLikelyResidential) {
        setResidentialWarning(true)
        return
      }
      navigateToQuote(lastParsedAddressRef.current)
      return
    }

    // Otherwise, geocode the manually entered address
    // Note: We skip residential detection for geocoded addresses because
    // the Geocoder API doesn't return business/establishment types
    setIsGeocoding(true)
    try {
      const parsedAddress = await geocodeAddress(trimmedAddress)

      if (parsedAddress && parsedAddress.streetAddress) {
        // Don't check residential for geocoded addresses - navigate directly
        navigateToQuote(parsedAddress)
      } else {
        // Fallback: just pass the raw address
        router.push(`/quote?address=${encodeURIComponent(trimmedAddress)}`)
      }
    } catch {
      // Fallback on error
      router.push(`/quote?address=${encodeURIComponent(trimmedAddress)}`)
    }
    setIsGeocoding(false)
  }

  function dismissWarning() {
    setResidentialWarning(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
            {isGeocoding ? (
              <svg
                className="h-5 w-5 text-[#0066ff] animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-[#505060] group-hover:text-[#0066ff] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </div>
          <GoogleAddressAutocomplete
            onAddressChange={setAddress}
            onPlaceSelect={handlePlaceSelect}
            placeholder={searchMode === "establishment" ? "Search by business name..." : "Enter your business address..."}
            inputClassName="h-16 pl-14 pr-6 text-lg rounded-2xl bg-[#1a1a28] border border-white/10 text-white placeholder:text-[#505060] hover:border-[#0066ff]/50 focus:border-[#0066ff] focus:ring-[3px] focus:ring-[#0066ff]/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,102,255,0.2)] transition-all"
            disabled={isGeocoding}
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
          />
        </div>
        {/* Search mode toggle */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setSearchMode(searchMode === "address" ? "establishment" : "address")}
            className="text-sm text-[#0066ff] hover:text-[#0066ff]/80 transition-colors"
          >
            {searchMode === "address"
              ? "Can't find your address? Search by business name →"
              : "← Search by street address instead"}
          </button>
        </div>
      </form>

      {/* Residential Address Warning */}
      {residentialWarning && (
        <div className="bg-[#ff4466]/10 border border-[#ff4466]/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-[#ff4466]/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#ff4466]"
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
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#ff4466]">Residential Address Detected</h4>
              <p className="text-sm text-[#b0b0c0] mt-1">
                This appears to be a residential address. NetworkGPT provides quotes for{" "}
                <span className="text-white font-medium">business locations only</span>.
              </p>
              <p className="text-sm text-[#808090] mt-2">
                Please enter a commercial or business address to get a quote.
              </p>
            </div>
            <button
              onClick={dismissWarning}
              className="flex-shrink-0 text-[#808090] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
