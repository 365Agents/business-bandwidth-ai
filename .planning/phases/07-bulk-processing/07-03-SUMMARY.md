---
phase: 07-bulk-processing
plan: 03
subsystem: batch-processing
requires: [07-01, 07-02]
provides: [batch-submission, queue-processor, progress-tracking]
affects: [momentum-api, quote-creation, lead-creation]
tags: [queue, sequential, batch, polling, background-processing]
tech-stack:
  patterns: [fire-and-forget, sequential-queue, polling]
key-decisions:
  - Sequential processing (one quote at a time per Momentum API constraint)
  - Fire-and-forget batch submission (non-blocking)
  - 5-minute timeout per quote
  - Auto-refresh progress page every 5 seconds
key-files:
  - src/lib/batch-processor.ts
  - src/app/dashboard/bulk/actions.ts
  - src/app/dashboard/bulk/page.tsx
  - src/app/dashboard/bulk/[id]/page.tsx
---

# Phase 7 Plan 03: Sequential Queue Processor

**Batch job tracking and sequential queue processor for bulk quote requests.**

## Accomplishments

- Created batch processor with sequential quote processing
- Updated bulk actions with submitBatchJob and getBatchJobStatus
- Wired up submit button on bulk upload page
- Created batch progress page with auto-refresh
- Added recent jobs list to bulk upload page
- Implemented fire-and-forget pattern for background processing

## Files Created/Modified

- `src/lib/batch-processor.ts` - Sequential queue processor
- `src/app/dashboard/bulk/actions.ts` - Batch submission and status actions
- `src/app/dashboard/bulk/page.tsx` - Updated with submit functionality
- `src/app/dashboard/bulk/[id]/page.tsx` - Batch progress page

## Batch Processor Features

| Feature | Implementation |
|---------|---------------|
| Sequential processing | One quote at a time (Momentum API constraint) |
| Per-quote timeout | 5 minutes max per quote |
| Error isolation | Individual failures don't stop batch |
| Status tracking | BatchJob and BatchQuote status updates |
| Lead/Quote creation | Auto-creates records for Momentum submission |

## Processing Flow

1. User submits valid addresses from preview
2. BatchJob created with status "pending"
3. BatchQuote records created for each address
4. Background processor started (fire-and-forget)
5. Each quote processed sequentially:
   - BatchQuote → "processing"
   - Create Lead record (user info)
   - Create Quote record (address)
   - Submit to Momentum API
   - Poll for completion (15s intervals, 5min max)
   - Update Quote with MRC/NRC/carrier
   - BatchQuote → "complete" or "failed"
   - Update BatchJob counters
6. BatchJob → "complete"

## Bulk Upload Page Updates

| Feature | Implementation |
|---------|---------------|
| Submit button | Calls submitBatchJob with valid rows |
| Recent jobs list | Shows last 10 batch jobs |
| Job status badges | Color-coded status indicators |
| Redirect on submit | Navigates to progress page |

## Progress Page Features

| Feature | Implementation |
|---------|---------------|
| Progress bar | Visual percentage complete |
| Stats cards | Total, successful, failed counts |
| Results table | Address, status, MRC, carrier |
| Auto-refresh | Every 5 seconds while processing |

## Server Actions

| Action | Purpose |
|--------|---------|
| submitBatchJob | Create BatchJob + BatchQuotes, kick off processing |
| getBatchJobStatus | Get job with all quotes for progress page |
| getUserBatchJobs | List recent jobs for bulk upload page |

## Technical Notes

- setTimeout used for fire-and-forget to ensure immediate response
- Prisma increment used for atomic counter updates
- Default speed: 1 Gbps, default term: 36 months
- Poll interval: 15 seconds
- Progress page polls status API, not WebSocket

## Verification

- TypeScript compiles without errors (`npx tsc --noEmit`)
- Prisma schema already had BatchJob/BatchQuote models
- Submit button wired up and functional
- Progress page displays batch status and quotes

## Next Steps

Ready for 07-04 (Batch Progress Tracking):
- Email notification when batch completes
- Export results to CSV
- Cancel in-progress batch
