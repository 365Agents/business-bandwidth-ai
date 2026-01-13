"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getBatchJobStatus, type BatchJobStatus } from "../actions"

export default function BatchProgressPage() {
  const params = useParams()
  const batchJobId = params.id as string

  const [batchJob, setBatchJob] = useState<BatchJobStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBatchJob = useCallback(async () => {
    try {
      const job = await getBatchJobStatus(batchJobId)
      if (job) {
        setBatchJob(job)
      } else {
        setError("Batch job not found")
      }
    } catch {
      setError("Failed to load batch job")
    } finally {
      setIsLoading(false)
    }
  }, [batchJobId])

  useEffect(() => {
    loadBatchJob()
  }, [loadBatchJob])

  // Auto-refresh while processing
  useEffect(() => {
    if (!batchJob || batchJob.status === "complete" || batchJob.status === "failed") {
      return
    }

    const interval = setInterval(loadBatchJob, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [batchJob, loadBatchJob])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-500/20 text-green-400">Complete</Badge>
      case "processing":
        return <Badge className="bg-blue-500/20 text-blue-400">Processing</Badge>
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-[#808090]">Loading batch job...</div>
      </div>
    )
  }

  if (error || !batchJob) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link
            href="/dashboard/bulk"
            className="inline-flex items-center gap-2 text-[#808090] hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bulk Upload
          </Link>
          <Card className="bg-[#0a0a0f] border-white/10">
            <CardContent className="py-8 text-center">
              <p className="text-red-400">{error || "Batch job not found"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const progressPercent = batchJob.totalCount > 0
    ? Math.round((batchJob.processedCount / batchJob.totalCount) * 100)
    : 0

  const isProcessing = batchJob.status === "processing" || batchJob.status === "pending"

  return (
    <div className="min-h-screen bg-[#050508]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/bulk"
            className="inline-flex items-center gap-2 text-[#808090] hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bulk Upload
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Batch Progress</h1>
            {getStatusBadge(batchJob.status)}
          </div>
          <p className="text-[#808090] mt-1">
            {batchJob.fileName || "Unnamed batch"} &middot; Started {formatDate(batchJob.createdAt)}
          </p>
        </div>

        {/* Progress Card */}
        <Card className="bg-[#0a0a0f] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Processing Progress</CardTitle>
            <CardDescription className="text-[#808090]">
              {isProcessing ? (
                <>Processing quote {batchJob.currentIndex} of {batchJob.totalCount}...</>
              ) : (
                <>Completed {batchJob.processedCount} of {batchJob.totalCount} quotes</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#808090]">Progress</span>
                <span className="text-white">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 rounded-lg bg-[#12121a]">
                <p className="text-2xl font-bold text-white">{batchJob.totalCount}</p>
                <p className="text-sm text-[#808090]">Total</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[#12121a]">
                <p className="text-2xl font-bold text-green-400">{batchJob.successCount}</p>
                <p className="text-sm text-[#808090]">Successful</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[#12121a]">
                <p className="text-2xl font-bold text-red-400">{batchJob.failedCount}</p>
                <p className="text-sm text-[#808090]">Failed</p>
              </div>
            </div>

            {isProcessing && (
              <p className="text-center text-sm text-[#808090] pt-2">
                Auto-refreshing every 5 seconds...
              </p>
            )}

            {batchJob.status === "complete" && (
              <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-green-400 font-semibold text-lg">Batch Complete!</p>
                <p className="text-[#808090] text-sm mt-1">
                  {batchJob.successCount} quotes ready, {batchJob.failedCount} failed
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="bg-[#0a0a0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quote Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-[#808090] w-16">Row</TableHead>
                    <TableHead className="text-[#808090]">Address</TableHead>
                    <TableHead className="text-[#808090]">City, State</TableHead>
                    <TableHead className="text-[#808090] w-24">Status</TableHead>
                    <TableHead className="text-[#808090] text-right">MRC</TableHead>
                    <TableHead className="text-[#808090]">Carrier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchJob.quotes.map((quote) => (
                    <TableRow key={quote.id} className="border-white/10">
                      <TableCell className="text-[#808090]">{quote.rowNumber}</TableCell>
                      <TableCell className="text-white">{quote.streetAddress}</TableCell>
                      <TableCell className="text-white">
                        {quote.city}, {quote.state} {quote.zipCode}
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="text-right">
                        {quote.status === "complete" && quote.quote ? (
                          <span className="text-green-400 font-medium">
                            {formatCurrency(quote.quote.mrc)}/mo
                          </span>
                        ) : quote.status === "failed" ? (
                          <span className="text-red-400 text-sm" title={quote.errorMessage || undefined}>
                            Error
                          </span>
                        ) : quote.status === "processing" ? (
                          <span className="text-blue-400 text-sm">Quoting...</span>
                        ) : (
                          <span className="text-[#808090]">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#808090]">
                        {quote.quote?.carrierName || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
