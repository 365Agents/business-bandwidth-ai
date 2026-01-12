# Roadmap: Business Bandwidth AI

## Overview

Build a lead-generation-first bandwidth quoting platform. Starting with project foundation and lead capture, progressively adding address verification, Momentum API integration, real-time status updates, email delivery with currency conversion, and finally bulk spreadsheet processing. Each phase delivers standalone value while building toward the complete platform.

## Domain Expertise

None

## Current Milestone: v1.0 MVP

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project setup, Next.js app, database, UI framework
- [ ] **Phase 2: Lead Capture** - Customer info forms, validation, lead storage
- [ ] **Phase 3: Address Verification** - Google Maps integration, business-only filtering
- [ ] **Phase 4: Momentum API** - Authentication, quote submission, result polling
- [ ] **Phase 5: Real-time Status** - WebSocket updates during quote processing
- [ ] **Phase 6: Quote Delivery** - Email templates, currency converter, upsell mentions
- [ ] **Phase 7: Bulk Processing** - Spreadsheet upload, queue system, batch progress

## Phase Details

### Phase 1: Foundation
**Goal**: Working Next.js app with database, authentication structure, and base UI components
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established patterns)
**Plans**: TBD

Plans:
- [x] 01-01: Project scaffolding and database setup
- [x] 01-02: Base UI components and layout

### Phase 2: Lead Capture
**Goal**: Complete lead capture flow - name, email, phone, company collected and stored
**Depends on**: Phase 1
**Research**: Unlikely (standard forms and validation)
**Plans**: TBD

Plans:
- [ ] 02-01: Lead capture form and validation
- [ ] 02-02: Lead storage and basic management

### Phase 3: Address Verification
**Goal**: Google Maps address autocomplete with business-only filtering
**Depends on**: Phase 2
**Research**: Likely (Google Maps Places API)
**Research topics**: Google Places API setup, address autocomplete, place types filtering (business vs residential)
**Plans**: TBD

Plans:
- [ ] 03-01: Google Maps integration and address autocomplete
- [ ] 03-02: Business address validation and filtering

### Phase 4: Momentum API
**Goal**: Complete quote request flow - submit address, poll for results, display pricing
**Depends on**: Phase 3
**Research**: Likely (Momentum Cypress API specifics)
**Research topics**: API authentication flow, quote_request lifecycle, error handling, rate limits
**Plans**: TBD

Plans:
- [ ] 04-01: Momentum API authentication and token management
- [ ] 04-02: Quote submission and result polling
- [ ] 04-03: Quote display with MRC/NRC pricing

### Phase 5: Real-time Status
**Goal**: Live progress updates during 2-3 minute quote processing
**Depends on**: Phase 4
**Research**: Likely (WebSocket implementation)
**Research topics**: Next.js WebSocket patterns, Socket.io vs native WS, progress state management
**Plans**: TBD

Plans:
- [ ] 05-01: WebSocket server and client setup
- [ ] 05-02: Real-time quote status updates and progress UI

### Phase 6: Quote Delivery
**Goal**: Professional quote emails with currency conversion and upsell mentions
**Depends on**: Phase 5
**Research**: Likely (email service, currency API)
**Research topics**: Email service (Resend/SendGrid), email templates, exchange rate API
**Plans**: TBD

Plans:
- [ ] 06-01: Email service integration and quote templates
- [ ] 06-02: Currency converter with daily exchange rates
- [ ] 06-03: Upsell content (5G, SDWAN mentions)

### Phase 7: Bulk Processing
**Goal**: Spreadsheet upload with sequential queue processing and batch progress tracking
**Depends on**: Phase 6
**Research**: Unlikely (builds on established patterns)
**Plans**: TBD

Plans:
- [ ] 07-01: Spreadsheet upload and parsing
- [ ] 07-02: Sequential queue processor
- [ ] 07-03: Batch progress tracking (live + email notification option)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-12 |
| 2. Lead Capture | 0/2 | Not started | - |
| 3. Address Verification | 0/2 | Not started | - |
| 4. Momentum API | 0/3 | Not started | - |
| 5. Real-time Status | 0/2 | Not started | - |
| 6. Quote Delivery | 0/3 | Not started | - |
| 7. Bulk Processing | 0/3 | Not started | - |
