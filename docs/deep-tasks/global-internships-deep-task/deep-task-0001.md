# DTM-0001 — Internship Data Foundation

Status: Approved

## Goal

Implement internship types, schema, validation, model, and database access without changing scholarship behavior.

## Owned scope

`src/lib/db/types.ts`, new internship schema/model/database/validation modules, and focused tests.

## Contract

Support the approved internship fields and statuses from `docs/internships-rd-architecture.md`. Research upsert must be idempotent and preserve prior verified values after failed refreshes.

## Verification

Run focused internship tests and the existing scholarship tests. Report exact commands and changed files.

## Done criteria

Valid records round-trip; invalid records fail; indexes and identity behavior exist; no unrelated files change.

## Worker report

- Added internship types, schema, model, CRUD, research upsert, identity handling, and tests.
- Changed: `src/lib/db/types.ts`, `src/lib/db/internship-schema.ts`, `src/lib/db/internship-model.ts`, `src/lib/db/internships.ts`, `src/lib/db/internships.test.ts`.
- `npx tsx --test src/lib/db/internships.test.ts`: 4 passed.
- Scholarship tests: 41 passed.
- `npx tsc --noEmit --pretty false`: passed.
- `git diff --check`: passed.
- No packages added; Mongo persistence smoke test was not completed because the memory-server setup attempted a large binary download.

## Engineering-manager review notes

- Scope is limited to the data foundation.
- Public listing defaults, source provenance, identity, and failed-refresh preservation are represented.
- No scholarship behavior or unrelated files were changed.

## Approved by engineering manager

Status: Approved

Verification:

- Focused internship tests, scholarship regression tests, TypeScript validation, and diff check passed.

Remaining risks:

- Live Mongo persistence requires a configured MongoDB environment or preinstalled test binary.
