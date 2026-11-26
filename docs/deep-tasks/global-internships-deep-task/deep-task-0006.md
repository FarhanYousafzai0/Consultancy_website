# DTM-0006 — Public Directory

Status: Approved

## Goal

Expose published internships through a searchable, filterable public directory.

## Owned scope

New internship API/page/components plus required navigation, metadata, and sitemap integration.

## Contract

Implement `/api/internships` with the approved filters, pagination, facets, server-calculated status, and official application links. Exclude all non-published records.

## Verification

Test filters, totals, pagination, empty/loading/error states, and desktop/mobile rendering.

## Done criteria

Public directory works against verified records; worker report is complete.

## Worker report

Implemented the public internship directory without changing admin or scholarship behavior.

- Added `GET /api/internships` with published-only filtering, server-calculated availability, search, country/region/field/work-mode/duration/funding/status filters, facets, sorting, pagination, and a public projection that excludes research errors, evidence, provider/model fields, notes, and canonical identity.
- Added `/internships` with responsive cards, explicit unknown/rolling/unpublished labels, eligibility and benefits disclosure, verification date, official application/source links, loading, empty, and error states.
- Added internship navigation and sitemap inclusion.
- Added focused public projection/filter tests.

Verification:

- `npx tsx --test src/lib/internships/public.test.ts` — 3 passed.
- `npm test` — 106 passed.
- `npx tsc --noEmit --pretty false` — passed.
- Focused ESLint — passed with one non-blocking `@next/next/no-img-element` warning for the remote organization logo.
- `npx next build` — passed; routes include `/api/internships` and `/internships`.
- `git diff --check` — passed with existing LF/CRLF warnings only.
- Browser/manual live-data check — not run; MongoDB credentials/data were not available for a populated public directory check.

Changed files owned by this task:

- `src/app/api/internships/route.ts`
- `src/app/(site)/internships/page.tsx`
- `src/components/internships/internships-browser.tsx`
- `src/components/internships/internship-card.tsx`
- `src/lib/internships/public.ts`
- `src/lib/internships/public.test.ts`
- `src/components/layout/nav-links.ts`
- `src/app/sitemap.ts`

## Engineering-manager review notes

- Public projection excludes evidence, research errors, provider/model fields, notes, and canonical identity.
- API is published-only with server-calculated status and approved filters.
- Independently reviewed the public tests, API shape, navigation, and sitemap integration.
- Production build passed and exposed the expected `/api/internships` and `/internships` routes.

## Approved by engineering manager

Status: Approved

Verification:

- Public tests: 3 passed.
- Full project tests: 106 passed.
- TypeScript and production build passed.
- Focused ESLint passed with a non-blocking remote-logo `<img>` warning.
- `git diff --check` passed with existing line-ending warnings only.

Remaining risks:

- Populated live-data browser verification remains pending.
- Duplicate `canonicalIdentity` index warning should be resolved during final quality review.
