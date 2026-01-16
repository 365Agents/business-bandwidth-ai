"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const COOKIE_CONSENT_KEY = "networkgpt-cookie-consent"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "1.0"
    }))
    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
  }

  const declineCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      version: "1.0"
    }))
    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
  }

  if (!showBanner) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <div className="max-w-4xl mx-auto bg-[#0a0a12]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_-10px_60px_rgba(0,102,255,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-[#0066ff]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-white font-semibold text-sm">Cookie Notice</h3>
            </div>
            <p className="text-[#a0a0b0] text-sm leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze site traffic,
              and for security purposes. By continuing to use our services, you consent to our use of
              cookies in accordance with our{" "}
              <a href="/privacy" className="text-[#0066ff] hover:underline">
                Privacy Policy
              </a>
              . We do not sell your personal information. You can manage your preferences or withdraw
              consent at any time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={declineCookies}
              className="text-[#a0a0b0] hover:text-white hover:bg-white/5"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="bg-[#0066ff] hover:bg-[#0052cc] text-white px-6"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
