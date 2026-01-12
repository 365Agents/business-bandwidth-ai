# Business Bandwidth AI

## What This Is

A lead-generation-first bandwidth quoting platform for business internet circuits. Users enter business addresses (verified via Google Maps), receive quotes from 200+ carriers via the Momentum Telecom API, and get professional templated quotes via email. Supports single quotes and bulk spreadsheet uploads with real-time progress tracking.

## Core Value

**Capture qualified leads** — every quote request becomes a sales opportunity with name, email, phone, and business context.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Google Maps address verification (business addresses only)
- [ ] Single-location quote form with required fields (speed, term, location)
- [ ] Lead capture (name, email, phone, company) before quote submission
- [ ] Momentum Telecom API integration (login, submit quote, poll for results)
- [ ] Real-time quote status with WebSocket updates (2-3 min wait)
- [ ] Professional templated quote email with pricing (MRC, NRC)
- [ ] Bulk spreadsheet upload for multiple addresses
- [ ] Queue processing system (1 request at a time, sequential)
- [ ] Live progress bar for bulk quotes OR email notification when complete
- [ ] Currency converter with daily exchange rates for international quotes
- [ ] Modern React/Next.js web app with dashboard
- [ ] Upsell mention in quote emails (5G backup, SDWAN via Juniper, etc.)
- [ ] Lead storage/management for follow-up

### Out of Scope

- Payment processing / online ordering — quotes only, sales handles transactions
- SDWAN/5G pricing API integration — mentioned as upsell only, priced in follow-up

## Context

**API Integration:**
- Momentum Telecom Cypress API (`cypress.momentumtelecom.com`)
- Endpoints: `/login`, `/quote_requests`, `/quote_requests/{id}`
- Auth: Basic auth + access_token header
- Quote fields: `term`, `speed`, `street_address`, `city`, `state`, `zip_code`, `product_category_id`
- Response: `quote_request_id`, `quote_status`, `monthly_recurring_charge`, `non_recurring_charge`
- API takes ~2-3 minutes per quote (polls 200+ carriers)
- Single request at a time limitation

**Competitor Reference:**
- connect.meter.com — similar quoting platform

**Existing Workflow:**
- n8n workflow exists with Gmail integration for quote emails
- Clerk.chat webhook integration for notifications

## Constraints

- **API**: Momentum API supports only 1 concurrent request — requires queue system for bulk
- **Latency**: 2-3 minute quote response time — UX must handle async gracefully

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lead capture before quote | Core value is lead generation, not just quoting | — Pending |
| Modern web app (React/Next.js) | Professional UX, real-time updates, dashboard | — Pending |
| Queue with both live + email options | Flexibility for users — watch or leave | — Pending |
| Add-ons as email upsells only | Simplifies v1, sales handles complex pricing | — Pending |
| Business address validation | Filter out residential, ensure B2B focus | — Pending |

---
*Last updated: 2026-01-11 after initialization*
