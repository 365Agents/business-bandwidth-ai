"use server"

import { db } from "./db"
import { submitQuoteToMomentum, checkQuoteStatus } from "./momentum-api"
import { sendBatchCompleteEmail } from "./email"

const POLL_INTERVAL_MS = 15000 // 15 seconds between polls
const MAX_POLL_TIME_MS = 300000 // 5 minutes max per quote
const DEFAULT_SPEED = "1000" // 1 Gbps default
const DEFAULT_TERM = "36" // 36 months default

/**
 * Process a batch job sequentially.
 * Called in fire-and-forget mode - does not block the request.
 */
export async function processBatchJob(batchJobId: string): Promise<void> {
  console.log(`[Batch Processor] Starting batch job: ${batchJobId}`)

  try {
    // Get batch job with user info
    const batchJob = await db.batchJob.findUnique({
      where: { id: batchJobId },
      include: {
        user: true,
        quotes: {
          where: { status: "pending" },
          orderBy: { rowNumber: "asc" },
        },
      },
    })

    if (!batchJob) {
      console.error(`[Batch Processor] Batch job not found: ${batchJobId}`)
      return
    }

    // Update batch job to processing
    await db.batchJob.update({
      where: { id: batchJobId },
      data: { status: "processing" },
    })

    const pendingQuotes = batchJob.quotes
    console.log(`[Batch Processor] Processing ${pendingQuotes.length} quotes for batch ${batchJobId}`)

    // Process each quote sequentially
    for (let i = 0; i < pendingQuotes.length; i++) {
      const batchQuote = pendingQuotes[i]
      console.log(`[Batch Processor] Processing quote ${i + 1}/${pendingQuotes.length}: Row ${batchQuote.rowNumber}`)

      try {
        // Update batch quote to processing
        await db.batchQuote.update({
          where: { id: batchQuote.id },
          data: { status: "processing" },
        })

        // Update batch job current index
        await db.batchJob.update({
          where: { id: batchJobId },
          data: { currentIndex: i + 1 },
        })

        // Create Lead record using user's info
        const lead = await db.lead.create({
          data: {
            name: batchJob.user.name,
            email: batchJob.user.email,
            phone: batchJob.user.phone || "",
            company: batchJob.user.company,
          },
        })

        // Create Quote record
        const quote = await db.quote.create({
          data: {
            leadId: lead.id,
            streetAddress: batchQuote.streetAddress,
            city: batchQuote.city,
            state: batchQuote.state,
            zipCode: batchQuote.zipCode,
            speed: DEFAULT_SPEED,
            term: DEFAULT_TERM,
            status: "processing",
          },
        })

        // Link batch quote to quote
        await db.batchQuote.update({
          where: { id: batchQuote.id },
          data: { quoteId: quote.id },
        })

        // Submit to Momentum API
        const submitResult = await submitQuoteToMomentum({
          streetAddress: batchQuote.streetAddress,
          city: batchQuote.city,
          state: batchQuote.state,
          zipCode: batchQuote.zipCode,
          speed: DEFAULT_SPEED,
          term: DEFAULT_TERM,
        })

        if (submitResult.status === "failed" || !submitResult.quoteRequestId) {
          // Submission failed
          await db.quote.update({
            where: { id: quote.id },
            data: {
              status: "failed",
              errorMessage: submitResult.error || "Failed to submit quote",
            },
          })

          await db.batchQuote.update({
            where: { id: batchQuote.id },
            data: {
              status: "failed",
              errorMessage: submitResult.error || "Failed to submit quote",
            },
          })

          await db.batchJob.update({
            where: { id: batchJobId },
            data: {
              processedCount: { increment: 1 },
              failedCount: { increment: 1 },
            },
          })

          continue
        }

        // Update quote with Momentum request ID
        await db.quote.update({
          where: { id: quote.id },
          data: { quoteRequestId: submitResult.quoteRequestId },
        })

        // Poll for completion
        const startTime = Date.now()
        let pollResult = submitResult

        while (pollResult.status === "processing" && Date.now() - startTime < MAX_POLL_TIME_MS) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
          pollResult = await checkQuoteStatus(submitResult.quoteRequestId)
        }

        // Update with final result
        if (pollResult.status === "complete" && pollResult.bestQuote) {
          await db.quote.update({
            where: { id: quote.id },
            data: {
              status: "complete",
              mrc: pollResult.bestQuote.mrc,
              nrc: pollResult.bestQuote.nrc,
              carrierName: pollResult.bestQuote.carrierName,
            },
          })

          await db.batchQuote.update({
            where: { id: batchQuote.id },
            data: { status: "complete" },
          })

          await db.batchJob.update({
            where: { id: batchJobId },
            data: {
              processedCount: { increment: 1 },
              successCount: { increment: 1 },
            },
          })

          console.log(`[Batch Processor] Quote complete: Row ${batchQuote.rowNumber} - $${pollResult.bestQuote.mrc}/mo`)
        } else {
          // Timed out or failed
          const errorMessage = pollResult.status === "processing" ? "Quote timed out" : pollResult.error || "Quote failed"

          await db.quote.update({
            where: { id: quote.id },
            data: {
              status: "failed",
              errorMessage,
            },
          })

          await db.batchQuote.update({
            where: { id: batchQuote.id },
            data: {
              status: "failed",
              errorMessage,
            },
          })

          await db.batchJob.update({
            where: { id: batchJobId },
            data: {
              processedCount: { increment: 1 },
              failedCount: { increment: 1 },
            },
          })

          console.log(`[Batch Processor] Quote failed: Row ${batchQuote.rowNumber} - ${errorMessage}`)
        }
      } catch (error) {
        // Individual quote error - continue with next
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error(`[Batch Processor] Error processing row ${batchQuote.rowNumber}:`, errorMessage)

        await db.batchQuote.update({
          where: { id: batchQuote.id },
          data: {
            status: "failed",
            errorMessage,
          },
        })

        await db.batchJob.update({
          where: { id: batchJobId },
          data: {
            processedCount: { increment: 1 },
            failedCount: { increment: 1 },
          },
        })
      }
    }

    // Mark batch job as complete
    await db.batchJob.update({
      where: { id: batchJobId },
      data: { status: "complete" },
    })

    console.log(`[Batch Processor] Batch job complete: ${batchJobId}`)

    // Send completion email if notifyEmail is true
    if (batchJob.notifyEmail) {
      try {
        // Fetch updated batch job with all quotes
        const completedBatch = await db.batchJob.findUnique({
          where: { id: batchJobId },
          include: {
            user: true,
            quotes: {
              orderBy: { rowNumber: "asc" },
              include: {
                quote: {
                  select: {
                    mrc: true,
                    carrierName: true,
                  },
                },
              },
            },
          },
        })

        if (completedBatch) {
          await sendBatchCompleteEmail({
            to: completedBatch.user.email,
            customerName: completedBatch.user.name,
            company: completedBatch.user.company,
            batchJobId: completedBatch.id,
            totalCount: completedBatch.totalCount,
            successCount: completedBatch.successCount,
            failedCount: completedBatch.failedCount,
            quotes: completedBatch.quotes.map((q) => ({
              streetAddress: q.streetAddress,
              city: q.city,
              state: q.state,
              mrc: q.quote?.mrc ?? null,
              status: q.status,
              carrierName: q.quote?.carrierName ?? null,
            })),
          })
        }
      } catch (emailError) {
        // Don't fail the batch if email fails
        console.error(`[Batch Processor] Failed to send completion email:`, emailError)
      }
    }
  } catch (error) {
    console.error(`[Batch Processor] Fatal error for batch ${batchJobId}:`, error)

    // Mark batch as failed
    await db.batchJob.update({
      where: { id: batchJobId },
      data: { status: "failed" },
    })
  }
}
