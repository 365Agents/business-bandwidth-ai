import { NextRequest, NextResponse } from "next/server"

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

interface TurnstileVerifyResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
  action?: string
  cdata?: string
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing token" },
        { status: 400 }
      )
    }

    if (!TURNSTILE_SECRET_KEY) {
      console.error("TURNSTILE_SECRET_KEY not configured")
      // In development, allow bypass
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json(
        { success: false, error: "Turnstile not configured" },
        { status: 500 }
      )
    }

    const formData = new FormData()
    formData.append("secret", TURNSTILE_SECRET_KEY)
    formData.append("response", token)

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    )

    const result: TurnstileVerifyResponse = await response.json()

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      console.error("Turnstile verification failed:", result["error-codes"])
      return NextResponse.json(
        { success: false, error: "Verification failed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
