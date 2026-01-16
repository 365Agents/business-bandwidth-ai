"use server"

const MOMENTUM_BASE_URL = "https://cypress.momentumtelecom.com/cypress_api"

interface MomentumAuthResponse {
  access_token: string
  [key: string]: unknown
}

interface MomentumQuoteRequest {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  speed: string // bandwidth in Mbps
  term: string // contract term in months
}

interface MomentumQuoteSubmitResponse {
  quote_request_id: string | number
  [key: string]: unknown
}

export interface MomentumCarrierQuote {
  quoteStatus: string
  mrc: number
  nrc: number
  carrierName?: string
  productName?: string
}

interface MomentumQuoteStatusResponse {
  quote_request_id: string | number
  street_address: string
  city: string
  state: string
  zip_code: string
  speed: string
  status?: string
  quotes: Array<{
    quote_status: string
    monthly_recurring_charge: number | string
    non_recurring_charge: number | string
    carrier_name?: string
    product_name?: string
    [key: string]: unknown
  }>
  [key: string]: unknown
}

export interface MomentumQuoteResult {
  quoteRequestId: string
  status: "processing" | "complete" | "failed"
  quotes: MomentumCarrierQuote[]
  bestQuote?: MomentumCarrierQuote
  error?: string
}

// Cache for auth token
let authToken: string | null = null
let tokenExpiry: number = 0

async function authenticate(): Promise<string> {
  // Return cached token if still valid (with 1 min buffer)
  if (authToken && Date.now() < tokenExpiry - 60000) {
    return authToken
  }

  const username = process.env.MOMENTUM_USERNAME
  const password = process.env.MOMENTUM_PASSWORD

  if (!username || !password) {
    throw new Error("Momentum credentials not configured")
  }

  console.log("[Momentum API] Authenticating...")

  const response = await fetch(`${MOMENTUM_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[Momentum API] Auth failed:", response.status, errorText)
    throw new Error(`Momentum authentication failed: ${response.status}`)
  }

  const data: MomentumAuthResponse = await response.json()
  console.log("[Momentum API] Auth successful")

  authToken = data.access_token

  if (!authToken) {
    console.error("[Momentum API] No access_token in response:", data)
    throw new Error("No access_token received from Momentum API")
  }

  // Set expiry to 5 minutes from now (re-authenticate before each poll)
  tokenExpiry = Date.now() + 300000

  return authToken
}

/**
 * Submit a quote request to Momentum.
 * Returns the quote_request_id for polling.
 * Quote processing is async and takes ~2-4 minutes.
 */
export async function submitQuoteToMomentum(
  quoteData: MomentumQuoteRequest
): Promise<MomentumQuoteResult> {
  const token = await authenticate()

  console.log("[Momentum API] Submitting quote request:", quoteData)

  const response = await fetch(`${MOMENTUM_BASE_URL}/quote_requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access_token": token,
    },
    body: JSON.stringify({
      term: quoteData.term,
      speed: quoteData.speed,
      street_address: quoteData.streetAddress,
      city: quoteData.city,
      state: quoteData.state,
      zip_code: quoteData.zipCode,
      postal_code: quoteData.zipCode,
      product_category_id: "INTERNET_DIA",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[Momentum API] Quote submission failed:", response.status, errorText)

    // Check for address validation error
    if (response.status === 400) {
      return {
        quoteRequestId: "",
        status: "failed",
        quotes: [],
        error: "Address validation failed. Please check the address and try again.",
      }
    }

    throw new Error(`Quote submission failed: ${response.status} - ${errorText}`)
  }

  const data: MomentumQuoteSubmitResponse = await response.json()
  console.log("[Momentum API] Quote submitted:", data.quote_request_id)

  return {
    quoteRequestId: String(data.quote_request_id),
    status: "processing",
    quotes: [],
  }
}

/**
 * Check the status of a quote request.
 * Returns all quotes found so far - carriers respond at different times.
 * Keep polling until all carriers have responded (status = COMPLETE on all quotes).
 *
 * @param quoteRequestId - The Momentum quote request ID
 * @param forceProcessing - If true, always return "processing" status (to keep searching)
 */
export async function checkQuoteStatus(
  quoteRequestId: string,
  forceProcessing: boolean = false
): Promise<MomentumQuoteResult> {
  // Get fresh token
  const token = await authenticate()

  console.log("[Momentum API] Checking quote status:", quoteRequestId)

  const response = await fetch(`${MOMENTUM_BASE_URL}/quote_requests/${quoteRequestId}`, {
    method: "GET",
    headers: {
      "access_token": token,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[Momentum API] Status check failed:", response.status, errorText)
    throw new Error(`Quote status check failed: ${response.status}`)
  }

  const data: MomentumQuoteStatusResponse = await response.json()
  console.log("[Momentum API] Quote status response:", JSON.stringify(data, null, 2))

  // Parse all quotes from response
  const quotes: MomentumCarrierQuote[] = []
  let allComplete = true
  let hasAnyQuote = false

  if (data.quotes && data.quotes.length > 0) {
    for (const q of data.quotes) {
      const mrc = typeof q.monthly_recurring_charge === "string"
        ? parseFloat(q.monthly_recurring_charge)
        : q.monthly_recurring_charge
      const nrc = typeof q.non_recurring_charge === "string"
        ? parseFloat(q.non_recurring_charge)
        : q.non_recurring_charge

      // Only include quotes with valid pricing
      if (mrc > 0) {
        hasAnyQuote = true
        quotes.push({
          quoteStatus: q.quote_status,
          mrc,
          nrc,
          carrierName: q.carrier_name,
          productName: q.product_name,
        })
      }

      // Check if this quote is still processing
      if (q.quote_status !== "COMPLETE") {
        allComplete = false
      }
    }
  } else {
    allComplete = false
  }

  // Sort quotes by MRC (lowest first)
  quotes.sort((a, b) => a.mrc - b.mrc)

  // Determine overall status
  // Consider complete if we have at least one quote and all are marked complete
  // BUT if forceProcessing is true, keep returning "processing" to continue searching
  const apiComplete = allComplete && hasAnyQuote
  const status = forceProcessing ? "processing" : (apiComplete ? "complete" : "processing")

  return {
    quoteRequestId: String(data.quote_request_id),
    status,
    quotes,
    bestQuote: quotes.length > 0 ? quotes[0] : undefined,
    // Include raw completion state so caller can decide when to truly complete
    _apiComplete: apiComplete,
  } as MomentumQuoteResult
}

// Test authentication - useful for debugging
export async function testMomentumConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await authenticate()
    return { success: true, message: "Connected to Momentum API successfully" }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
