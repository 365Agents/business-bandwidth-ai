"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SignStepProps {
  quoteId: string
  signerEmail: string
  signerName: string
  onComplete: () => void
}

type SigningStatus = "loading" | "ready" | "signing" | "completed" | "error"

export function OrderStepSign({
  quoteId,
  signerEmail,
  signerName,
  onComplete,
}: SignStepProps) {
  const [status, setStatus] = useState<SigningStatus>("loading")
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle DocuSeal completion messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // DocuSeal sends messages when signing is complete
      if (event.data && typeof event.data === "object") {
        if (
          event.data.type === "docuseal:completed" ||
          event.data.event === "completed" ||
          event.data.status === "completed"
        ) {
          setStatus("completed")
          // Small delay to show success state before proceeding
          setTimeout(() => {
            onComplete()
          }, 1500)
        }
      }
    },
    [onComplete]
  )

  useEffect(() => {
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [handleMessage])

  useEffect(() => {
    const initiateSigning = async () => {
      try {
        const response = await fetch("/api/docuseal/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteId,
            signerEmail,
            signerName,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to initiate signing")
        }

        if (data.embedUrl) {
          setEmbedUrl(data.embedUrl)
          setStatus("ready")
        } else {
          throw new Error("No embed URL received")
        }
      } catch (err) {
        console.error("DocuSeal initiation error:", err)
        setError(
          err instanceof Error ? err.message : "Failed to prepare documents"
        )
        setStatus("error")
      }
    }

    initiateSigning()
  }, [quoteId, signerEmail, signerName])

  // Loading state
  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Preparing Documents
          </h3>
          <p className="text-sm text-[#808090]">
            Setting up your Service Order and Master Services Agreement for
            signing...
          </p>
        </div>

        <Card className="bg-[#12121a] border-white/10">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066ff] mb-4" />
            <p className="text-[#808090]">Generating documents...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (status === "error") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Document Preparation Failed
          </h3>
          <p className="text-sm text-[#808090]">
            We encountered an issue preparing your documents.
          </p>
        </div>

        <Card className="bg-[#ff4466]/10 border-[#ff4466]/30">
          <CardContent className="py-8 text-center">
            <svg
              className="w-12 h-12 text-[#ff4466] mx-auto mb-4"
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
            <p className="text-[#ff4466] mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-[#ff4466]/30 text-[#ff4466] hover:bg-[#ff4466]/10"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Completed state
  if (status === "completed") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Documents Signed Successfully
          </h3>
          <p className="text-sm text-[#808090]">
            Thank you! Your order is being processed.
          </p>
        </div>

        <Card className="bg-[#00ff88]/10 border-[#00ff88]/30">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#00ff88] flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-[#00ff88] font-medium">
              Signature Complete
            </p>
            <p className="text-[#808090] text-sm mt-2">
              Redirecting to your order details...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ready/Signing state - show embedded DocuSeal
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">
          Sign Your Documents
        </h3>
        <p className="text-sm text-[#808090]">
          Review and sign your Service Order and Master Services Agreement
          below.
        </p>
      </div>

      {/* Documents being signed info */}
      <div className="flex gap-4">
        <div className="flex-1 bg-[#0066ff]/10 border border-[#0066ff]/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-[#0066ff] font-medium">
              Service Order
            </span>
          </div>
        </div>
        <div className="flex-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#00d4ff]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm text-[#00d4ff] font-medium">
              Master Services Agreement
            </span>
          </div>
        </div>
      </div>

      {/* DocuSeal Embed */}
      <Card className="bg-[#12121a] border-white/10 overflow-hidden">
        <CardContent className="p-0">
          {embedUrl && (
            <iframe
              src={embedUrl}
              className="w-full h-[500px] border-0"
              title="DocuSeal Signing"
              allow="camera"
            />
          )}
        </CardContent>
      </Card>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#606070]">
        <svg
          className="w-4 h-4"
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
        <span>Secured by DocuSeal - Your signature is legally binding</span>
      </div>
    </div>
  )
}
