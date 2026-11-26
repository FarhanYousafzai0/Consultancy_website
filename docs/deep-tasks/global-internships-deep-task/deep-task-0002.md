# DTM-0002 — Normalization and Status

Status: Approved

## Goal

Implement internship normalization, validation helpers, and deterministic public availability.

## Owned scope

New `src/lib/internships/normalize.ts`, `status.ts`, `validation.ts`, and tests; shared helper edits only with characterization coverage.

## Contract

Normalize countries, fields, work modes, funding, duration, and official URLs. Support confirmed, rolling, not-published, and ambiguous deadlines. Never infer unknown values.

## Verification

Test aliases, invalid/reversed dates, date-only boundaries, rolling deadlines, and closing-soon behavior.

## Done criteria

Deterministic outputs, focused tests pass, scholarship behavior remains unchanged, and worker report is complete.

## Worker report

- Added internship-specific normalization for countries, work modes, funding, study fields, education levels, duration, and official URLs.
- Added date and deadline validation helpers for invalid/reversed periods and confirmed versus rolling/not-published/ambiguous deadlines.
- Added deterministic availability calculation for published records: open, closing_soon, closed, and unknown. Date-only deadlines remain valid through the UTC end of day.
- Reused the existing scholarship country and official URL helpers without modifying their implementation.
- Changed: `src/lib/internships/normalize.ts`, `src/lib/internships/normalize.test.ts`, `src/lib/internships/validation.ts`, `src/lib/internships/validation.test.ts`, `src/lib/internships/status.ts`, `src/lib/internships/status.test.ts`, and this task report.
- `npx tsx --test src/lib/internships/normalize.test.ts src/lib/internships/validation.test.ts src/lib/internships/status.test.ts`: 14 passed.
- `npx tsc --noEmit --pretty false`: passed.
- `npx tsx --test src/lib/scholarships/status.test.ts src/lib/scholarships/discovery.test.ts src/lib/scholarships/normalize.test.ts src/lib/scholarships/research.test.ts src/lib/scholarships/crawler.test.ts src/lib/scholarships/catalogues.test.ts`: 41 passed.
- `git diff --check`: passed.
- Targeted ESLint command was stopped after it exceeded the allowed wait window without output; lint remains unverified for this task.
- No packages added. No crawler, research pipeline, automation, admin, or public UI work added.

Remaining risk:

- The shared URL helper permits subdomains of an allowed domain by design; final source/application policy must apply the appropriate allowlist during pipeline validation.

## Engineering-manager review notes

- Independently reran all 14 internship tests, TypeScript, targeted ESLint, and diff checks successfully.
- Existing scholarship normalization/status behavior remains covered by the regression suite.
- The source/application allowlist concern is correctly deferred to the pipeline task.

## Approved by engineering manager

Status: Approved

Verification:

- Internship tests: 14 passed.
- Scholarship regression tests: 41 passed.
- TypeScript and targeted ESLint passed.
- `git diff --check` passed.

Remaining risks:

- Full repository lint and production build remain final verification tasks.
