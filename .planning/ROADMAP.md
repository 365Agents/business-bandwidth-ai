# Roadmap: Business Bandwidth AI

## Overview

Build a lead-generation-first bandwidth quoting platform. Starting with project foundation and lead capture, progressively adding address verification, Momentum API integration, real-time status updates, email delivery with currency conversion, and finally bulk spreadsheet processing. Each phase delivers standalone value while building toward the complete platform.

## Domain Expertise

None

## Milestones

- ✅ **v1.0 MVP** - Phases 1-7 (shipped 2026-01-13)
- 🚧 **v1.1 Platform Expansion** - Phases 8-11 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

<details>
<summary>✅ v1.0 MVP (Phases 1-7) - SHIPPED 2026-01-13</summary>

### Phase 1: Foundation
**Goal**: Working Next.js app with database, authentication structure, and base UI components
**Depends on**: Nothing (first phase)
**Plans**: 2 plans

Plans:
- [x] 01-01: Project scaffolding and database setup
- [x] 01-02: Base UI components and layout

### Phase 2: Lead Capture
**Goal**: Complete lead capture flow - name, email, phone, company collected and stored
**Depends on**: Phase 1
**Plans**: 2 plans

Plans:
- [x] 02-01: Lead capture form and validation
- [x] 02-02: Lead storage and basic management

### Phase 3: Address Verification
**Goal**: Google Maps address autocomplete with business-only filtering
**Depends on**: Phase 2
**Plans**: 2 plans

Plans:
- [x] 03-01: Google Maps integration and address autocomplete
- [x] 03-02: Business address validation and filtering

### Phase 4: Momentum API
**Goal**: Complete quote request flow - submit address, poll for results, display pricing
**Depends on**: Phase 3
**Plans**: 3 plans

Plans:
- [x] 04-01: Momentum API authentication and token management
- [x] 04-02: Quote submission and result polling
- [x] 04-03: Quote display with MRC/NRC pricing

### Phase 5: Real-time Status
**Goal**: Live progress updates during 2-3 minute quote processing
**Depends on**: Phase 4
**Status**: Skipped (using polling instead of WebSocket)

### Phase 6: Quote Delivery
**Goal**: Professional quote emails with currency conversion and upsell mentions
**Depends on**: Phase 5
**Plans**: 3 plans

Plans:
- [x] 06-01: Email service integration and quote templates (Gmail)
- [x] 06-02: Currency converter with daily exchange rates
- [x] 06-03: Upsell content (5G, SDWAN mentions)

### Phase 7: Bulk Processing
**Goal**: Spreadsheet upload with sequential queue processing and batch progress tracking
**Depends on**: Phase 6
**Plans**: 4 plans

Plans:
- [x] 07-01: Auth system (signup, login, JWT cookies)
- [x] 07-02: Spreadsheet upload and parsing
- [x] 07-03: Sequential queue processor
- [x] 07-04: Batch progress tracking

</details>

### 🚧 v1.1 Platform Expansion (In Progress)

**Milestone Goal:** Complete the quote-to-contract flow, add admin capabilities, multi-user authentication, and white-label support for resellers.

#### Phase 8: Quote Flow Refinement
**Goal**: Remove order buttons, add "Request Contract" button to trigger DocuSeal, enforce quote-first workflow
**Depends on**: v1.0 complete
**Research**: Unlikely (DocuSeal already integrated)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD (run /gsd:plan-phase 8 to break down)

#### Phase 9: Admin Dashboard
**Goal**: Super user panel for quote/lead management and user administration
**Depends on**: Phase 8
**Research**: Unlikely (internal CRUD patterns)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

#### Phase 10: Multi-user Auth
**Goal**: Google OAuth first, Microsoft OAuth second, multi-tenant user support
**Depends on**: Phase 9
**Research**: Likely (NextAuth.js / OAuth integration)
**Research topics**: NextAuth.js setup, Google OAuth credentials, Microsoft OAuth, multi-tenant patterns
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

#### Phase 11: White-label
**Goal**: Branding customization script and embeddable code snippet for reseller clients
**Depends on**: Phase 10
**Research**: Unlikely (CSS/JS embedding patterns)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-01-12 |
| 2. Lead Capture | v1.0 | 2/2 | Complete | 2026-01-12 |
| 3. Address Verification | v1.0 | 2/2 | Complete | 2026-01-12 |
| 4. Momentum API | v1.0 | 3/3 | Complete | 2026-01-12 |
| 5. Real-time Status | v1.0 | - | Skipped | 2026-01-12 |
| 6. Quote Delivery | v1.0 | 3/3 | Complete | 2026-01-13 |
| 7. Bulk Processing | v1.0 | 4/4 | Complete | 2026-01-13 |
| 8. Quote Flow Refinement | v1.1 | 0/? | Not started | - |
| 9. Admin Dashboard | v1.1 | 0/? | Not started | - |
| 10. Multi-user Auth | v1.1 | 0/? | Not started | - |
| 11. White-label | v1.1 | 0/? | Not started | - |
