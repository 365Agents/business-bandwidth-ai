---
phase: 02-lead-capture
plan: 01
subsystem: forms
requires: [01-02]
provides: [quote-form, quote-validation, quote-submission, address-flow]
affects: [dashboard-quotes, api-integration]
tags: [forms, validation, server-actions, lead-capture]
tech-stack:
  patterns: [server-actions, zod-validation, react-hook-form]
key-decisions:
  - Single-page form (not multi-step wizard) for simplicity
  - Server-side validation with zod schema
  - Address passed via query params from landing page
key-files:
  - src/lib/validations/quote.ts
  - src/app/quote/page.tsx
  - src/app/quote/actions.ts
  - src/components/address-input.tsx
commits:
  - a2c6b58: "feat(02-01): create quote request form with zod validation"
  - 3136ee4: "feat(02-01): create server action for quote submission"
  - f3a328e: "feat(02-01): connect landing page address to quote form"
  - 4f1283b: "docs(02-01): complete lead capture form plan"
---

# Phase 2 Plan 01: Lead Capture Form

**Functional quote request form with validation and database persistence.**

## Accomplishments

- Created zod validation schema for quote form fields
- Built complete quote request form with react-hook-form integration
- Implemented server action to create Lead and Quote records in database
- Connected landing page address input to quote form via query params
- Added loading states and toast notifications for user feedback
- Form pre-fills street address from homepage input

## Files Created/Modified

- `src/lib/validations/quote.ts` — Zod schema for form validation
- `src/app/quote/page.tsx` — Full quote request form with all fields
- `src/app/quote/actions.ts` — Server action for Lead + Quote creation
- `src/components/address-input.tsx` — Landing page address input with redirect

## Form Fields Implemented

| Section | Fields |
|---------|--------|
| Contact | name, email, phone, company |
| Location | streetAddress, city, state, zipCode |
| Service | speed (dropdown), term (dropdown) |

## Speed Options

- 100 Mbps, 250 Mbps, 500 Mbps, 1 Gbps, 10 Gbps

## Term Options

- 12 months, 24 months, 36 months, 60 months

## User Flow

1. User enters address on landing page
2. Pressing Enter redirects to `/quote?address={encoded-address}`
3. Quote form pre-fills street address from query param
4. User completes remaining fields
5. On submit, Lead and Quote records created in database
6. Success toast shown, user redirected to dashboard

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Single-page form | Simpler UX, fewer friction points than multi-step wizard |
| Server-side validation | Security — never trust client-only validation |
| Query param for address | Enables Google-style flow from landing page |

## Technical Notes

- Form uses shadcn/ui Form, FormField, Input, Select components
- Server action uses Prisma to create Lead first, then Quote with leadId
- revalidatePath("/dashboard") called after successful submission
- TypeScript types inferred from zod schema

## Verification

- TypeScript compiles without errors (`npx tsc --noEmit`)
- ESLint passes (`npm run lint`)
- Development server runs successfully (`npm run dev`)
- Note: `npm run build` encounters Windows-specific path issue (not code-related)

## Next Phase Readiness

**Plan 01 Complete!** Ready for Phase 2 Plan 02:
- Quote form captures all lead information
- Database records created on submission
- Ready for dashboard quote display and API integration
