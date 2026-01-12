"use client"

import { useCallback, useRef, useState } from "react"
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface ParsedAddress {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  placeId: string
  formattedAddress: string
}

interface GoogleAddressAutocompleteProps {
  value?: string
  onChange?: (value: string) => void
  onPlaceSelect?: (address: ParsedAddress) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
}

const libraries: ("places")[] = ["places"]

function parseAddressComponents(
  place: google.maps.places.PlaceResult
): ParsedAddress {
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
      // Fallback for cities like NYC where locality might not be present
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

  return {
    streetAddress,
    city,
    state,
    zipCode,
    placeId: place.place_id || "",
    formattedAddress: place.formatted_address || "",
  }
}

export function GoogleAddressAutocomplete({
  value = "",
  onChange,
  onPlaceSelect,
  placeholder = "Enter address...",
  className,
  inputClassName,
  disabled,
}: GoogleAddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()

      if (place.address_components) {
        const parsedAddress = parseAddressComponents(place)
        setInputValue(parsedAddress.formattedAddress)
        onChange?.(parsedAddress.formattedAddress)
        onPlaceSelect?.(parsedAddress)
      }
    }
  }, [onChange, onPlaceSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  // Fallback to regular input if Google Maps is not loaded
  if (!isLoaded) {
    return (
      <div className={cn("relative", className)}>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={inputClassName}
          disabled={disabled}
        />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          componentRestrictions: { country: "us" },
          types: ["address"],
          fields: ["address_components", "formatted_address", "place_id"],
        }}
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={inputClassName}
          disabled={disabled}
        />
      </Autocomplete>
    </div>
  )
}
