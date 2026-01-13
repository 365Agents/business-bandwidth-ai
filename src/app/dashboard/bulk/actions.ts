"use server"

import { parseSpreadsheet, type ParsedRow } from "@/lib/spreadsheet-parser"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { processBatchJob } from "@/lib/batch-processor"

export type { ParsedRow }

interface ParseResult {
  rows: ParsedRow[]
  validCount: number
  invalidCount: number
  error?: string
}

export async function parseUploadedFile(formData: FormData): Promise<ParseResult> {
  const file = formData.get("file") as File | null

  if (!file) {
    return {
      rows: [],
      validCount: 0,
      invalidCount: 0,
      error: "No file provided",
    }
  }

  try {
    const buffer = await file.arrayBuffer()
    const rows = parseSpreadsheet(buffer)

    const validCount = rows.filter((r) => r.isValid).length
    const invalidCount = rows.filter((r) => !r.isValid).length

    return {
      rows,
      validCount,
      invalidCount,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse spreadsheet"
    return {
      rows: [],
      validCount: 0,
      invalidCount: 0,
      error: message,
    }
  }
}

interface SubmitBatchResult {
  batchJobId?: string
  error?: string
}

export async function submitBatchJob(
  validRows: ParsedRow[],
  fileName: string,
  notifyEmail: boolean = false
): Promise<SubmitBatchResult> {
  // Get current user from session
  const user = await getSession()

  if (!user) {
    return { error: "Not authenticated" }
  }

  if (validRows.length === 0) {
    return { error: "No valid rows to submit" }
  }

  try {
    // Create batch job
    const batchJob = await db.batchJob.create({
      data: {
        userId: user.id,
        status: "pending",
        totalCount: validRows.length,
        processedCount: 0,
        successCount: 0,
        failedCount: 0,
        currentIndex: 0,
        fileName,
        notifyEmail,
      },
    })

    // Create batch quote records for each valid row
    await db.batchQuote.createMany({
      data: validRows.map((row) => ({
        batchJobId: batchJob.id,
        rowNumber: row.rowNumber,
        streetAddress: row.streetAddress,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
        status: "pending",
      })),
    })

    // Fire and forget - kick off processing without waiting
    // Using setTimeout to ensure we return before processing starts
    setTimeout(() => {
      processBatchJob(batchJob.id).catch((error) => {
        console.error("[Batch Submission] Background processing error:", error)
      })
    }, 100)

    return { batchJobId: batchJob.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create batch job"
    console.error("[Batch Submission] Error:", message)
    return { error: message }
  }
}

export interface BatchJobStatus {
  id: string
  status: string
  totalCount: number
  processedCount: number
  successCount: number
  failedCount: number
  currentIndex: number
  fileName: string | null
  createdAt: Date
  quotes: Array<{
    id: string
    rowNumber: number
    streetAddress: string
    city: string
    state: string
    zipCode: string
    status: string
    errorMessage: string | null
    quote: {
      mrc: number | null
      nrc: number | null
      carrierName: string | null
    } | null
  }>
}

export async function getBatchJobStatus(batchJobId: string): Promise<BatchJobStatus | null> {
  const user = await getSession()

  if (!user) {
    return null
  }

  const batchJob = await db.batchJob.findUnique({
    where: { id: batchJobId, userId: user.id },
    include: {
      quotes: {
        orderBy: { rowNumber: "asc" },
        include: {
          quote: {
            select: {
              mrc: true,
              nrc: true,
              carrierName: true,
            },
          },
        },
      },
    },
  })

  if (!batchJob) {
    return null
  }

  return {
    id: batchJob.id,
    status: batchJob.status,
    totalCount: batchJob.totalCount,
    processedCount: batchJob.processedCount,
    successCount: batchJob.successCount,
    failedCount: batchJob.failedCount,
    currentIndex: batchJob.currentIndex,
    fileName: batchJob.fileName,
    createdAt: batchJob.createdAt,
    quotes: batchJob.quotes.map((q) => ({
      id: q.id,
      rowNumber: q.rowNumber,
      streetAddress: q.streetAddress,
      city: q.city,
      state: q.state,
      zipCode: q.zipCode,
      status: q.status,
      errorMessage: q.errorMessage,
      quote: q.quote,
    })),
  }
}

export async function getUserBatchJobs(): Promise<Array<{
  id: string
  status: string
  totalCount: number
  successCount: number
  failedCount: number
  fileName: string | null
  createdAt: Date
}>> {
  const user = await getSession()

  if (!user) {
    return []
  }

  const jobs = await db.batchJob.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      status: true,
      totalCount: true,
      successCount: true,
      failedCount: true,
      fileName: true,
      createdAt: true,
    },
  })

  return jobs
}
