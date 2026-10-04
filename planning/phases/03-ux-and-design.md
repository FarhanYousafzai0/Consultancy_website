# Phase 3 — UX & Design

**Status:** Grilling
**Duration:** 3 weeks
**Depends on:** Phase 2
**Grill-me session:** In progress (started 2026-10-04)

## Goal
Design the full journey before writing code.

## Activities
- [x] Sitemap → `../design/sitemap-and-flows.md`
- [x] User flows (6 flows: Master's, FSc → Bachelor's, Ausbildung, deadline alert, consultant handoff, admin verification) → `../design/sitemap-and-flows.md`
- [ ] Wireframes for key screens
- [x] Design system (colors, fonts, components) → `../design/design-system.md` + `../design/preview.html`
- [ ] High-fidelity designs
- [ ] Clickable prototype tested with 5 students

## Key screens
- Landing page + free eligibility check
- Eligibility result
- Program search & filters
- Program detail (requirements, deadlines, documents, source + last verified)
- Matches (Reach / Match / Safety)
- Compare
- Scholarships list + detail
- Dashboard / shortlist / checklist
- Consultant booking
- Admin: data review queue

## Deliverables
- [ ] Sitemap and user flows
- [ ] Wireframes
- [ ] Design system
- [ ] Prototype + test results

## Done when
Test students complete the main flow without help.

## Open questions for grill-me
1. Sign-up before or after showing first matches?
2. Consultant handoff: WhatsApp, call booking, or in-app chat?
3. What does the dashboard home show after login?
4. Mobile-first or desktop-first? (Most Pakistani students likely browse on phones.)
5. Brand: existing consultancy brand or a new product brand?
6. How do we show "unverified" or "predicted" deadlines visually?

## Answers
- **Q5 — Brand?** **Completely new standalone brand** (not the consultancy name). Name still to be decided. *(2026-10-04)*
- **Colors (direction):** **White base + green accent**, taken from a reference image the founder is sharing. Exact shades pending the image. *(2026-10-04)*
- **Q1 — Sign-up moment?** **After** the free eligibility result + first few matches. *(2026-10-04)*
- **Q2 — Consultant handoff?** **WhatsApp** button inside results and program pages + one small floating button. *(2026-10-04)*
- **Q3 — Dashboard home?** Eligibility status, shortlist with nearest deadlines, next steps, saved scholarships. *(2026-10-04)*
- **Q4 — Mobile or desktop first?** **Mobile-first.** *(2026-10-04)*
- **Q6 — Unverified / predicted data?** Badges: Verified = green check + date · Predicted = amber · Unverified = grey. *(2026-10-04)*
- **Visual & component decisions** (full detail in `../design/design-system.md`): trustworthy & calm feel · green + greys only (no second brand color) · Plus Jakarta Sans · **pill buttons, 20px cards** · **floating soft-shadow cards, no border** · no dark mode at launch · **Phosphor icons** · real German campus/city photos · bottom tab bar (mobile), top bar (desktop), sidebar only in dashboard · full program cards · Reach = amber, Match = green, Safety = blue-grey · plain friendly English · Tailwind + shadcn/ui · WCAG AA. *(2026-10-04)*

- **Palette (final):** lime `#D4F56A` primary with ink text · forest `#2F5D0A` for green text · ink `#0F1110` accents used sparingly · grey `#F0F1EE` flat cards · white item cards with soft shadow · mono uppercase section labels only. Preview: `../design/preview.html`. *(2026-10-04)*

### Still open
- Brand name + logo
