"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getDashboardData, refreshProcessingQuotes, fetchExchangeRates, sendQuoteEmail, deleteQuote } from "./actions"
import {
  CURRENCIES,
  CURRENCY_INFO,
  formatCurrency,
  convertCurrency,
  formatRate,
  type Currency,
} from "@/lib/currency"

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
type Quote = DashboardData["recentQuotes"][number]

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-[#ff9900]/10 text-[#ff9900] border-[#ff9900]/20",
    processing: "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/20",
    complete: "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20",
    accepted: "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
    failed: "bg-[#ff4466]/10 text-[#ff4466] border-[#ff4466]/20",
  }
  const labels: Record<string, string> = {
    accepted: "Order Placed",
  }
  return (
    <Badge variant="outline" className={styles[status] || ""}>
      {status === "processing" && (
        <span className="w-2 h-2 bg-[#0066ff] rounded-full mr-2 animate-pulse" />
      )}
      {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function formatSpeed(speed: string) {
  const speedNum = parseInt(speed, 10)
  if (speedNum >= 1000) {
    return `${speedNum / 1000} Gbps`
  }
  return `${speedNum} Mbps`
}

// Currency selector dropdown
function CurrencySelector({
  value,
  onChange,
  rates,
}: {
  value: Currency
  onChange: (currency: Currency) => void
  rates: Record<Currency, number> | null
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-[#1a1a24] border border-white/10 hover:border-white/20 text-[#808090] hover:text-white transition-colors"
      >
        {value}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          />
          <div className="absolute right-0 mt-1 z-20 bg-[#12121a] border border-white/10 rounded-lg shadow-lg overflow-hidden min-w-[140px]">
            {CURRENCIES.map((currency) => (
              <button
                key={currency}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(currency)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a1a24] transition-colors flex items-center justify-between ${
                  value === currency ? "text-[#0066ff]" : "text-white"
                }`}
              >
                <span>{CURRENCY_INFO[currency].name}</span>
                <span className="text-[#808090] text-xs">{CURRENCY_INFO[currency].symbol}</span>
              </button>
            ))}
            {rates && value !== "USD" && (
              <div className="px-3 py-2 text-xs text-[#505060] border-t border-white/5">
                {formatRate("USD", value, rates)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [rates, setRates] = useState<Record<Currency, number> | null>(null)
  const [quoteCurrencies, setQuoteCurrencies] = useState<Record<string, Currency>>({})
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [result, exchangeRates] = await Promise.all([
      getDashboardData(),
      fetchExchangeRates(),
    ])
    setData(result)
    setRates(exchangeRates)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh processing quotes every 30 seconds
  useEffect(() => {
    if (!data) return

    const hasProcessing = data.recentQuotes.some(q => q.status === "processing")
    if (!hasProcessing) return

    const interval = setInterval(async () => {
      const updated = await refreshProcessingQuotes()
      if (updated) {
        loadData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [data, loadData])

  async function handleRefresh() {
    setIsRefreshing(true)
    await refreshProcessingQuotes()
    await loadData()
    setIsRefreshing(false)
  }

  function getQuoteCurrency(quoteId: string): Currency {
    return quoteCurrencies[quoteId] || "USD"
  }

  function setQuoteCurrency(quoteId: string, currency: Currency) {
    setQuoteCurrencies((prev) => ({ ...prev, [quoteId]: currency }))
  }

  function getDisplayPrice(quote: Quote): { amount: number; currency: Currency } | null {
    if (!quote.mrc) return null
    const currency = getQuoteCurrency(quote.id)
    if (currency === "USD" || !rates) {
      return { amount: quote.mrc, currency: "USD" }
    }
    return { amount: convertCurrency(quote.mrc, currency, rates), currency }
  }

  async function handleSendEmail(quoteId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSendingEmailId(quoteId)
    try {
      const result = await sendQuoteEmail(quoteId)
      if (result.success) {
        alert(result.isBatch ? "Batch quote email sent!" : "Quote email sent!")
      } else {
        alert(result.error || "Failed to send email")
      }
    } catch (error) {
      alert("Failed to send email")
    } finally {
      setSendingEmailId(null)
    }
  }

  async function handleDelete(quoteId: string, companyName: string, e: React.MouseEvent) {
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete the quote for "${companyName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(quoteId)
    try {
      const result = await deleteQuote(quoteId)
      if (result.success) {
        // Refresh the data to remove the deleted quote from the list
        await loadData()
      } else {
        alert(result.error || "Failed to delete quote")
      }
    } catch (error) {
      alert("Failed to delete quote")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#0066ff] border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  const { leadCount, quoteCount, processingCount, recentQuotes } = data

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
          <p className="text-[#808090]">Manage your leads and quotes</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-white/10"
          >
            {isRefreshing ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </Button>
          <Button asChild variant="outline" className="border-white/20 hover:border-white/30">
            <Link href="/dashboard/bulk">Bulk Upload</Link>
          </Button>
          <Button asChild className="bg-electric-gradient shadow-electric">
            <Link href="/quote">New Quote</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#808090]">Total Leads</CardDescription>
            <CardTitle className="font-display text-4xl text-white">{leadCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#505060]">Leads captured</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#808090]">Quotes Generated</CardDescription>
            <CardTitle className="font-display text-4xl text-white">{quoteCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#505060]">Total quote requests</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#808090]">Processing</CardDescription>
            <CardTitle className="font-display text-4xl text-[#0066ff]">{processingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#505060]">
              {processingCount > 0 ? "Searching carriers..." : "All complete"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quotes */}
      <Card className="bg-[#0a0a0f] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Quotes</CardTitle>
          <CardDescription className="text-[#808090]">Your latest quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          {recentQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-[#12121a] p-4 mb-4">
                <svg
                  className="h-8 w-8 text-[#505060]"
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
              </div>
              <h3 className="font-semibold text-white">No quotes yet</h3>
              <p className="text-sm text-[#808090] max-w-sm mt-1">
                When you request quotes, they will appear here.
              </p>
              <Button asChild className="mt-4 bg-electric-gradient shadow-electric">
                <Link href="/quote">Request Your First Quote</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#808090]">Company</TableHead>
                  <TableHead className="text-[#808090]">Location</TableHead>
                  <TableHead className="text-[#808090]">Speed</TableHead>
                  <TableHead className="text-[#808090]">Price</TableHead>
                  <TableHead className="text-[#808090]">Status</TableHead>
                  <TableHead className="text-[#808090]">Date</TableHead>
                  <TableHead className="text-[#808090]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.map((quote) => {
                  const price = getDisplayPrice(quote)
                  const currency = getQuoteCurrency(quote.id)

                  return (
                    <TableRow
                      key={quote.id}
                      className="border-white/5 hover:bg-[#12121a] cursor-pointer"
                      onClick={() => window.location.href = `/dashboard/quotes/${quote.id}`}
                    >
                      <TableCell className="font-medium text-white">
                        {quote.lead.company}
                      </TableCell>
                      <TableCell className="text-[#b0b0c0]">
                        {quote.city}, {quote.state}
                      </TableCell>
                      <TableCell className="text-[#b0b0c0]">{formatSpeed(quote.speed)}</TableCell>
                      <TableCell>
                        {price ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[#00ff88] font-medium">
                              {formatCurrency(price.amount, price.currency, { decimals: 0 })}/mo
                            </span>
                            <CurrencySelector
                              value={currency}
                              onChange={(c) => setQuoteCurrency(quote.id, c)}
                              rates={rates}
                            />
                          </div>
                        ) : quote.status === "processing" ? (
                          <span className="text-[#0066ff] text-sm">Searching...</span>
                        ) : (
                          <span className="text-[#505060]">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="text-[#808090]">{formatDate(quote.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#0066ff] hover:text-[#0066ff] hover:bg-[#0066ff]/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `/dashboard/quotes/${quote.id}`
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#00d4ff] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `/dashboard/quotes/${quote.id}/edit`
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#ff4466] hover:text-[#ff4466] hover:bg-[#ff4466]/10"
                            onClick={(e) => handleDelete(quote.id, quote.lead.company, e)}
                            disabled={deletingId === quote.id || quote.status === "accepted"}
                          >
                            {deletingId === quote.id ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#ff9900] hover:text-[#ff9900] hover:bg-[#ff9900]/10"
                            onClick={(e) => handleSendEmail(quote.id, e)}
                            disabled={sendingEmailId === quote.id || (quote.status !== "complete" && !quote.batchQuotes?.length)}
                          >
                            {sendingEmailId === quote.id ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              "Email"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
