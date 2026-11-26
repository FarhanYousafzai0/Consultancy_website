# DTM-0005 — Admin Review

Status: Approved

## Goal

Provide authorized admin review and publishing controls for internship records.

## Owned scope

New admin internship routes/pages/components, navigation integration, and authorization/action tests.

## Contract

Display evidence, provenance, errors, and fetch history. Support edit, approve, reject, archive, expire, and force-recheck while separating verification from publication.

## Verification

Test non-admin denial, approval validation, provenance preservation, and public hiding of non-published records.

## Done criteria

Admin workflow is usable and protected; worker report is complete.

## Worker report

Implemented the internship admin review workflow:

- Added `/admin/internships` list and `/admin/internships/[id]` review pages.
- Added admin-only API handlers for list, detail, edit, approve, reject, archive, expire, and force-recheck actions.
- Kept verification status separate from publication status; edits cannot change either status.
- Approval requires verified status, official source/application URLs, and captured evidence.
- Approval now requires an HTTPS application URL on the source domain or an explicitly allowlisted matching curated-source domain; arbitrary syntactically valid URLs are rejected.
- The admin route now resolves the matching curated source before approval and passes its primary plus explicitly allowlisted domains into the approval validator; force-recheck retains its existing source-ID fallback.
- Added provenance, source/application links, canonical identity, timestamps, content hashes, source state, research errors, and evidence quotes with capture dates.
- Added an editable review form for core internship details, eligibility, benefits, funding, deadline, location, and notes.
- Added desktop admin navigation integration.
- Added pure authorization/action transition tests.
- No public internship page or new packages were added.

Changed files:

- `src/app/(admin)/admin/internships/page.tsx`
- `src/app/(admin)/admin/internships/[id]/page.tsx`
- `src/app/api/admin/internships/route.ts`
- `src/app/api/admin/internships/[id]/route.ts`
- `src/components/admin/internship-review-form.tsx`
- `src/components/admin/admin-nav.tsx`
- `src/lib/internships/admin.ts`
- `src/lib/internships/admin.test.ts`
- `src/lib/db/internships.ts`

Verification:

- `npx tsx --test src/lib/internships/admin.test.ts` — 4 passed.
- `npx tsx --test src/lib/internships/*.test.ts src/lib/db/internships.test.ts scripts/research-internships.test.ts` — 35 passed.
- `npm test` — 106 passed.
- `npx tsc --noEmit --pretty false` — passed.
- Targeted `npx eslint` on Agent 5 files — passed.
- `git diff --check` — passed with existing line-ending warnings only.

Known limitation:

- Fetch history currently displays the persisted source checkpoints and content hashes available from the existing data model; a full append-only per-fetch event log remains outside this agent's scope.

## Engineering-manager review notes

- Approval validation now requires verified status, evidence, HTTPS, and a source-domain or curated allowlisted application host.
- The admin route passes the matching source allowlist into approval validation, including legitimate external application portals.
- Independently verified admin tests, full project tests, TypeScript, ESLint, and diff checks.

## Approved by engineering manager

Status: Approved

Verification:

- Admin tests: 4 passed.
- Full project tests: 106 passed.
- TypeScript and ESLint passed.
- `git diff --check` passed with existing line-ending warnings only.

Remaining risks:

- Fetch history is checkpoint-based rather than append-only.
