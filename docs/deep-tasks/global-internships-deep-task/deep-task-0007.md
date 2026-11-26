# DTM-0007 — Quality and Release Verification

Status: Approved

## Goal

Complete regression tests and release verification for the feature.

## Owned scope

Internship tests and verification-only changes required to make the suite reliable; no unrelated refactors.

## Contract

Verify schema, normalization, crawler/evidence, API, admin authorization, workflow, scholarship regression, lint, TypeScript, build, and manual flows.

## Verification

Run exact commands and record final results, including production build completion and `git diff --check`.

## Done criteria

All acceptance criteria pass; remaining risks are documented; worker report is complete.

## Verification report

Completed the final feature-focused quality and release verification pass.

### Fixes applied

- Removed the duplicate `canonicalIdentity` Mongoose index declaration. The field remains uniquely indexed through the explicit schema index, eliminating the build-time duplicate-index warning.
- Documented the intentional dynamic remote-logo `<img>` lint suppression in `src/components/internships/internship-card.tsx`; `next/image` cannot safely support arbitrary source-provided hosts without an open-ended remote allowlist.
- Added all internship data, pipeline, admin, public, and automation tests to the standard `npm test` script so the full-suite command covers the feature.

### Exact commands and results

- `npm test` — passed, **145 tests**.
- `npx tsx --test src/lib/internships/*.test.ts src/lib/db/internships.test.ts scripts/research-internships.test.ts` — passed, **39 tests**.
- `npx tsc --noEmit --pretty false` — passed.
- `npx eslint src/lib/internships src/lib/db/internship-model.ts src/lib/db/internship-schema.ts src/lib/db/internships.ts src/components/internships scripts/research-internships.ts` — passed with no warnings or errors.
- `npx eslint .` — failed on **6 pre-existing errors outside the internship feature**: `src/components/advisor/advisor-chat.tsx` (3), `src/components/ausbildung/ausbildung-listings.tsx` (1), `src/components/dashboard/alerts-settings.tsx` (1), and `src/components/programs/programs-browser.tsx` (1). It also reported unrelated warnings in admin account menu, advisor message parts, and Ausbildung demand. No internship error remains.
- `npx next build` — passed. TypeScript completed, 35 static pages generated, and the build listed `/internships`, `/api/internships`, `/admin/internships`, and `/admin/internships/[id]`.
- `git diff --check` — passed; Git reported existing LF/CRLF conversion warnings only.

### Integration and workflow checks

- Internship tests cover schema/indexes, normalization, deadline status, crawler limits/redirects, evidence grounding, deduplication, research dry-run, admin authorization/transitions, public filtering/projection, and CLI validation.
- Workflow configuration was inspected and contains daily scheduling, manual dispatch, bounded concurrency, a 90-minute timeout, read-only repository permissions, and required database/AI secrets.
- The duplicate `canonicalIdentity` warning did not recur during the final production build.

### Unavailable verification

- Browser verification against a populated public directory was not run because no populated MongoDB credentials/data were available in this checkout.
- Live MongoDB writes, live AI extraction, and a GitHub Actions execution were not run because deployment credentials and external runtime access were unavailable. Deterministic fixtures and dry-run behavior passed.

### Remaining risks

- Full-repository ESLint remains blocked by the six unrelated pre-existing errors listed above.
- The production build emits the existing `metadataBase` warning and falls back to `http://localhost:3000` for social metadata; this is outside the internship feature scope.
- Initial internship coverage is limited to the curated official source registry; JavaScript-only source pages and live source availability require deployment-time monitoring.

## Engineering-manager review request

The internship feature is ready for final review. No unrelated refactors or packages were added during this verification pass.

## Engineering-manager review notes

- Independently reran `npm test`: 145 tests passed.
- Independently reran TypeScript validation and `npx next build`: both passed; internship and admin routes generated.
- The duplicate canonical identity index warning is resolved.
- Internship-focused ESLint passes. Full-repository ESLint still reports six unrelated pre-existing errors outside this feature.
- Browser/live Mongo/AI/GitHub Actions execution remains unavailable without credentials and populated data.

## Approved by engineering manager

Status: Approved

Verification:

- Full test suite: 145 passed.
- TypeScript: passed.
- Production build: passed.
- Internship-focused ESLint: passed.
- `git diff --check`: passed.

Remaining risks:

- Six pre-existing full-repository ESLint errors remain outside internship files.
- Live data, browser rendering, database writes, AI extraction, and GitHub Actions execution require deployment credentials/runtime access.
- Source coverage is curated and intentionally not comprehensive worldwide coverage.
