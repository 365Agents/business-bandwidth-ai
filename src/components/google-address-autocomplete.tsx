"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

export type AddressType = "business" | "residential" | "unknown"

export interface ParsedAddress {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  placeId: string
  formattedAddress: string
  isLikelyResidential: boolean
  addressType: AddressType
  isEstablishment: boolean
  businessName?: string
}

interface Prediction {
  placeId: string
  description: string
}

export type SearchMode = "address" | "establishment"

interface GoogleAddressAutocompleteProps {
  defaultValue?: string
  onAddressChange?: (value: string) => void
  onPlaceSelect?: (address: ParsedAddress) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
  searchMode?: SearchMode
  onSearchModeChange?: (mode: SearchMode) => void
  showModeToggle?: boolean
}

// Business-related place types that indicate a non-residential address
const BUSINESS_TYPES = [
  "establishment",
  "store",
  "point_of_interest",
  "food",
  "health",
  "finance",
  "lodging",
  "shopping_mall",
  "gym",
  "restaurant",
  "cafe",
  "bar",
  "bank",
  "hospital",
  "doctor",
  "dentist",
  "pharmacy",
  "school",
  "university",
  "church",
  "local_government_office",
  "post_office",
  "library",
  "museum",
  "stadium",
  "airport",
  "train_station",
  "bus_station",
  "parking",
  "gas_station",
  "car_dealer",
  "car_repair",
  "car_wash",
  "real_estate_agency",
  "lawyer",
  "accounting",
  "insurance_agency",
  "travel_agency",
  "moving_company",
  "storage",
  "electrician",
  "plumber",
  "painter",
  "roofing_contractor",
  "general_contractor",
]

// Types that indicate residential addresses
const RESIDENTIAL_TYPES = [
  "premise",        // A named location, usually a building (often homes)
  "subpremise",     // Apartment, suite, etc.
]

function parseAddressComponents(
  place: google.maps.places.PlaceResult
): ParsedAddress {
  const components = place.address_components || []
  const placeTypes = place.types || []

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

  // Check place types for classification
  const hasBusiness = placeTypes.some(type => BUSINESS_TYPES.includes(type))
  const hasResidential = placeTypes.some(type => RESIDENTIAL_TYPES.includes(type))
  const isEstablishment = placeTypes.includes("establishment")
  const hasStreetAddress = placeTypes.includes("street_address")
  const hasRoute = placeTypes.includes("route")

  // Log for debugging
  console.log("[AddressType] Place types:", placeTypes)
  console.log("[AddressType] hasBusiness:", hasBusiness, "hasResidential:", hasResidential, "isEstablishment:", isEstablishment)

  // isLikelyResidential is true if:
  // 1. Has residential types (premise, subpremise) without business types, OR
  // 2. Has street_address or route type with no business indicators
  // 3. Has no business types at all (conservative approach)
  const isLikelyResidential =
    (hasResidential && !hasBusiness) ||
    ((hasStreetAddress || hasRoute) && !hasBusiness) ||
    (!hasBusiness && !isEstablishment && streetAddress.length > 0)

  // Determine address type for analytics and display
  // "business" = clearly an establishment
  // "residential" = likely a home address (blocks form submission)
  // "unknown" = ambiguous (shows warning but allows submission)
  let addressType: AddressType
  if (isEstablishment || hasBusiness) {
    addressType = "business"
  } else if (isLikelyResidential) {
    addressType = "residential"
  } else {
    addressType = "unknown"
  }

  console.log("[AddressType] Final addressType:", addressType)

  return {
    streetAddress,
    city,
    state,
    zipCode,
    placeId: place.place_id || "",
    formattedAddress: place.formatted_address || "",
    isLikelyResidential,
    addressType,
    isEstablishment,
    businessName: place.name,
  }
}

// Load Google Maps script dynamically
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window not defined"))
      return
    }

    // Already loaded
    if (window.google?.maps?.places) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      const checkLoaded = () => {
        if (window.google?.maps?.places) {
          resolve()
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google Maps"))
    document.head.appendChild(script)
  })
}

export function GoogleAddressAutocomplete({
  defaultValue = "",
  onAddressChange,
  onPlaceSelect,
  placeholder = "Enter address...",
  className,
  inputClassName,
  disabled,
  searchMode = "address",
  onSearchModeChange,
  showModeToggle = false,
}: GoogleAddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedAddress, setSelectedAddress] = useState<ParsedAddress | null>(null)

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch(() => {})
  }, [])

  // Initialize services once loaded
  useEffect(() => {
    if (!isLoaded) return

    autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
    const div = document.createElement("div")
    placesServiceRef.current = new google.maps.places.PlacesService(div)
  }, [isLoaded])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch predictions when input changes
  const fetchPredictions = useCallback((value: string) => {
    if (!autocompleteServiceRef.current || value.length < 3) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    // Use different search types based on mode
    const searchTypes = searchMode === "establishment"
      ? ["establishment"]
      : ["address"]

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "us" },
        types: searchTypes,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(
            results.map((r) => ({
              placeId: r.place_id,
              description: r.description,
            }))
          )
          setShowDropdown(true)
          setSelectedIndex(-1)
        } else {
          setPredictions([])
          setShowDropdown(false)
        }
      }
    )
  }, [searchMode])

  // Handle selecting a prediction
  const selectPrediction = useCallback((prediction: Prediction) => {
    if (!placesServiceRef.current) return

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.placeId,
        fields: ["address_components", "formatted_address", "place_id", "types", "name"],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const parsedAddress = parseAddressComponents(place)
          setInputValue(parsedAddress.formattedAddress)
          setSelectedAddress(parsedAddress)
          // Note: We intentionally DON'T call onAddressChange here because:
          // 1. onPlaceSelect already provides all the address data
          // 2. Calling onAddressChange would trigger handleStreetChange which clears addressType
          // 3. The parent should use onPlaceSelect for full place data including addressType
          onPlaceSelect?.(parsedAddress)
        }
      }
    )

    setShowDropdown(false)
    setPredictions([])
  }, [onPlaceSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    onAddressChange?.(value)
    fetchPredictions(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, predictions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      selectPrediction(predictions[selectedIndex])
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  const handleModeToggle = () => {
    const newMode = searchMode === "address" ? "establishment" : "address"
    onSearchModeChange?.(newMode)
    // Clear input and selection when switching modes
    setInputValue("")
    setSelectedAddress(null)
    setPredictions([])
  }

  // Clear selection when user types (manual entry)
  const handleInputChangeWithClear = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddress(null)
    handleInputChange(e)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChangeWithClear}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={searchMode === "establishment" ? "Search by business name..." : placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm",
            selectedAddress && "pr-24",
            inputClassName
          )}
        />

        {/* Address Type Badge - shown after selection */}
        {selectedAddress && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {selectedAddress.addressType === "business" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Business
              </span>
            ) : selectedAddress.addressType === "residential" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ff4466]/10 text-[#ff4466] border border-[#ff4466]/20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Residential
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Verify
              </span>
            )}
          </div>
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <ul className="absolute z-[100] w-full mt-2 bg-[#12121a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-60 overflow-auto">
          {predictions.map((prediction, index) => (
            <li
              key={prediction.placeId}
              className={cn(
                "px-4 py-3 cursor-pointer text-sm transition-colors",
                index === selectedIndex
                  ? "bg-[#0066ff]/20 text-white"
                  : "text-[#b0b0c0] hover:bg-[#1a1a28] hover:text-white"
              )}
              onClick={() => selectPrediction(prediction)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {prediction.description}
            </li>
          ))}
        </ul>
      )}

      {/* Search Mode Toggle */}
      {showModeToggle && (
        <button
          type="button"
          onClick={handleModeToggle}
          className="mt-2 text-xs text-[#0066ff] hover:text-[#0066ff]/80 transition-colors"
        >
          {searchMode === "address"
            ? "Can't find your business? Search by business name →"
            : "← Search by address instead"}
        </button>
      )}
    </div>
  )
}
