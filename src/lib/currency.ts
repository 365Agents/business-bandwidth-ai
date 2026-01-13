// Supported currencies
export const CURRENCIES = ["USD", "CAD", "GBP", "EUR"] as const
export type Currency = (typeof CURRENCIES)[number]

// Currency display info
export const CURRENCY_INFO: Record<Currency, { symbol: string; name: string; locale: string }> = {
  USD: { symbol: "$", name: "US Dollar", locale: "en-US" },
  CAD: { symbol: "$", name: "Canadian Dollar", locale: "en-CA" },
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB" },
  EUR: { symbol: "€", name: "Euro", locale: "de-DE" },
}

// Exchange rates cache
interface RatesCache {
  rates: Record<string, number>
  timestamp: number
}

let ratesCache: RatesCache | null = null
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Fallback rates (approximate) if API fails
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  CAD: 1.36,
  GBP: 0.79,
  EUR: 0.92,
}

/**
 * Fetch exchange rates from Open Exchange Rates API
 * Free tier: 1000 requests/month, hourly updates
 */
async function fetchRates(): Promise<Record<string, number>> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY

  if (!apiKey) {
    console.warn("[Currency] No API key configured, using fallback rates")
    return FALLBACK_RATES
  }

  try {
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=CAD,GBP,EUR`,
      { next: { revalidate: 3600 } } // Cache for 1 hour in Next.js
    )

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    return {
      USD: 1,
      CAD: data.rates.CAD,
      GBP: data.rates.GBP,
      EUR: data.rates.EUR,
    }
  } catch (error) {
    console.error("[Currency] Failed to fetch rates:", error)
    return FALLBACK_RATES
  }
}

/**
 * Get current exchange rates (cached for 24 hours)
 */
export async function getExchangeRates(): Promise<Record<Currency, number>> {
  const now = Date.now()

  // Return cached rates if still valid
  if (ratesCache && now - ratesCache.timestamp < CACHE_TTL_MS) {
    return ratesCache.rates as Record<Currency, number>
  }

  // Fetch fresh rates
  const rates = await fetchRates()
  ratesCache = { rates, timestamp: now }

  return rates as Record<Currency, number>
}

/**
 * Convert amount from USD to target currency
 */
export function convertCurrency(
  amountUSD: number,
  targetCurrency: Currency,
  rates: Record<Currency, number>
): number {
  if (targetCurrency === "USD") return amountUSD
  const rate = rates[targetCurrency] || 1
  return amountUSD * rate
}

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number | null,
  currency: Currency = "USD",
  options?: { decimals?: number }
): string {
  if (amount === null || amount === undefined) return "—"

  const { locale } = CURRENCY_INFO[currency]
  const decimals = options?.decimals ?? 2

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Format rate for display (e.g., "1 USD = 1.36 CAD")
 */
export function formatRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): string {
  if (fromCurrency === toCurrency) return ""
  const rate = rates[toCurrency]
  return `1 ${fromCurrency} = ${rate.toFixed(2)} ${toCurrency}`
}
