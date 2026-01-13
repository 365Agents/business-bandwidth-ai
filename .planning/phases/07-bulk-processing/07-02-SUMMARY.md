---
phase: 07-bulk-processing
plan: 02
subsystem: bulk-upload
requires: [07-01]
provides: [file-upload, spreadsheet-parsing, address-preview]
affects: [quote-submission, batch-processing]
tags: [upload, csv, xlsx, parsing, validation]
tech-stack:
  patterns: [server-actions, xlsx-parsing, html5-drag-drop]
  libraries: [xlsx]
key-decisions:
  - Native HTML5 drag-drop (no react-dropzone dependency)
  - xlsx library for both CSV and Excel parsing
  - Max 100 rows per upload
  - Column name normalization for flexible input
key-files:
  - src/components/file-dropzone.tsx
  - src/app/dashboard/bulk/page.tsx
  - src/app/dashboard/bulk/actions.ts
  - src/lib/spreadsheet-parser.ts
  - src/app/api/auth/me/route.ts
---

# Phase 7 Plan 02: Spreadsheet Upload and Parsing

**Upload UI with CSV/XLSX parsing and address validation preview.**

## Accomplishments

- Installed xlsx library for spreadsheet parsing
- Created FileDropzone component with native HTML5 drag-drop
- Built /dashboard/bulk protected page with user info display
- Implemented spreadsheet parser handling both CSV and XLSX
- Added flexible column name recognition (multiple variations)
- Created address validation with row-by-row error reporting
- Built preview table with valid/invalid status badges
- Added /api/auth/me endpoint for fetching current user

## Files Created

- `src/components/file-dropzone.tsx` - Drag-drop file input component
- `src/app/dashboard/bulk/page.tsx` - Upload page with preview table
- `src/app/dashboard/bulk/actions.ts` - Server action for file parsing
- `src/lib/spreadsheet-parser.ts` - CSV/XLSX parser with validation
- `src/app/api/auth/me/route.ts` - API to get current user info

## FileDropzone Features

| Feature | Implementation |
|---------|---------------|
| Drag & drop | Native HTML5 drag-drop API |
| File selection | Click to browse fallback |
| File validation | Type (.csv, .xlsx) and size (5MB max) |
| Visual feedback | Drag state, selected file display |
| Error display | Inline error messages |

## Spreadsheet Parser

| Feature | Implementation |
|---------|---------------|
| Formats | CSV and XLSX via xlsx library |
| Column mapping | Flexible name recognition |
| Validation | Required fields, state/zip format |
| Limits | Max 100 rows per upload |
| Output | ParsedRow[] with isValid and errors |

## Column Name Recognition

| Field | Accepted Names |
|-------|---------------|
| Street Address | street_address, address, street, address1 |
| City | city, town, municipality |
| State | state, province, region, st |
| Zip Code | zip, zip_code, postal_code, postal |

## Validation Rules

- Street address: Required
- City: Required
- State: Required, must be 2-letter code
- Zip code: Required, must be 5 digits (or 5+4 format)

## Preview Table

| Column | Display |
|--------|---------|
| Row # | Original row number (2+) |
| Address | Street address |
| City | City name |
| State | 2-letter code |
| Zip | 5-digit code |
| Status | Valid (green) / Invalid (red with tooltip) |

## Technical Notes

- Protected route via middleware (redirects to /auth/login)
- User session fetched via /api/auth/me on page load
- Server action handles FormData file upload
- XLSX library used on server-side only
- Summary shows valid/invalid counts before submission

## Verification

- TypeScript compiles without errors (`npx tsc --noEmit`)
- FileDropzone handles drag-drop correctly
- Parser handles CSV and XLSX formats
- Validation catches missing/invalid fields
- Preview table displays all rows with status

## Next Steps

Ready for 07-03 (Sequential Queue Processor):
- "Submit Valid Addresses" button wired up
- Batch job creation from valid rows
- Queue processing for Momentum API calls
