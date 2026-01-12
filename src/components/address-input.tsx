"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export function AddressInput() {
  const router = useRouter()
  const [address, setAddress] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const encodedAddress = encodeURIComponent(address.trim())
    router.push(encodedAddress ? `/quote?address=${encodedAddress}` : "/quote")
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
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
        </div>
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your business address..."
          className="h-14 pl-12 pr-4 text-lg rounded-full shadow-lg border-2 hover:border-primary hover:shadow-xl transition-all focus-visible:ring-primary"
        />
      </div>
    </form>
  )
}
