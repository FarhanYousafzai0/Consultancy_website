# Global Internship Opportunities — Implementation Plan

Status: Approved R&D architecture; implementation plan for review
Source architecture: `docs/internships-rd-architecture.md`

## 1. Scope

Implement a verified internship directory using a separate `Internship` collection and internship-specific pipeline modules. Reuse stable scholarship infrastructure where behavior is generic, while leaving existing scholarship records, routes, tests, and research behavior unchanged.

Out of scope for the MVP:

- Automatic student applications
- User alerts or saved internships
- Cross-type opportunity search
- Broad uncontrolled web search
- Automatic publication of ambiguous records
- A logo/image scraping service

## 2. Implementation slices

### Slice A — Shared contracts and internship data layer

Owned files/modules:

- `src/lib/db/types.ts`
- `src/lib/db/internship-schema.ts` (new)
- `src/lib/db/internship-model.ts` (new)
- `src/lib/db/internships.ts` (new)
- `src/lib/db/internship-evidence-model.ts` (new, if evidence is stored separately)
- Internship-specific Zod schema and normalization modules

Behavior:

- Define TypeScript unions for work mode, duration unit, funding status, deadline status, verification status, and publication status.
- Define a Mongoose schema with indexes for publication status, country, deadline, source domain, organization, and canonical identity.
- Convert documents to stable records with explicit null/unknown defaults.
- Implement create, update, list, get-by-id, get-by-slug, research upsert, stale/expiry transitions, and source-content lookup.
- Preserve the last successful evidence when a refresh fails.

Tests:

- Schema accepts valid records and rejects invalid enums, URLs, slugs, and malformed dates.
- Record conversion preserves nulls and does not manufacture values.
- Research upsert is idempotent.
- Duplicate identity does not create a second record.

### Slice B — Internship normalization, validation, and status

Owned files/modules:

- `src/lib/internships/normalize.ts` (new)
- `src/lib/internships/status.ts` (new)
- `src/lib/internships/validation.ts` (new)
- Shared generic URL/date helpers only where extraction does not change scholarship behavior

Behavior:

- Normalize country names to ISO codes, work modes, duration units, fields, education levels, and funding labels.
- Normalize official URLs and remove tracking parameters.
- Calculate `open`, `closing_soon`, `closed`, or `unknown` from a verified deadline.
- Treat rolling and not-published deadlines as explicit non-date states.
- Reject reversed, invalid, or unsupported dates.
- Never convert an unknown funding value into paid, unpaid, or funded.

Tests:

- Country aliases and human-readable country names normalize consistently.
- Date-only deadlines remain valid through the full deadline day.
- Rolling and missing deadlines remain distinguishable.
- Invalid/reversed cycles become `unknown`.
- Closing-soon threshold is deterministic.

### Slice C — Source registry and extraction pipeline

Owned files/modules:

- `src/data/internship-sources.ts` (new)
- `src/lib/internships/research.ts` (new)
- `src/lib/internships/crawler.ts` (new wrapper or shared generic extraction)
- `scripts/research-internships.ts` (new)
- `src/lib/db/research-sources.ts` and `src/lib/db/research-runs.ts` only if generic fields need a safe extension

Behavior:

- Add a small curated registry of approved official sources.
- Fetch pages/PDFs with HTTPS/domain allowlists, redirect limits, body limits, and source hashes.
- Extract internship candidates with evidence for deadline, eligibility, duration, funding, and application URLs.
- Validate that source and application URLs are grounded in fetched official content or explicitly approved.
- Generate stable identity from source ID, organization, title, location, and relevant program attributes.
- Upsert verified candidates, route uncertain candidates to `needs_review`, and retire stale records safely.
- Continue processing independent sources when one source fails; record per-source errors.

Tests:

- Source URL allowlist and redirect behavior.
- PDF and HTML text extraction.
- Evidence quote must exist in source text for a confirmed deadline.
- Unsupported application URLs are rejected or safely replaced with the official source page according to policy.
- Same source/content run is skipped unless forced.
- Failed source refresh does not erase the last successful record.
- Stale records are expired/archived only according to the approved policy.

### Slice D — Research scheduling and operational reporting

Owned files/modules:

- `.github/workflows/internship-research.yml` (new)
- `package.json`
- `README.md` or `docs/ENV_SETUP.md` for required secrets and commands

Behavior:

- Add a daily scheduled run plus manual dispatch.
- Support `--dry-run`, `--force`, `--sources=id,id`, and controlled concurrency.
- Require the existing cron secret and configured AI/database credentials.
- Print source success/failure counts, extracted records, active records, provider usage, and error summaries.
- Do not claim complete worldwide coverage in logs or UI.

Tests/manual checks:

- Dry run performs no writes.
- Source selection rejects unknown IDs.
- Manual dispatch can target one source.
- Missing secrets fail clearly.
- Workflow timeout and concurrency prevent overlapping destructive updates.

### Slice E — Public API and page

Owned files/modules:

- `src/app/api/internships/route.ts` (new)
- `src/app/(site)/internships/page.tsx` (new)
- `src/components/internships/internships-browser.tsx` (new)
- `src/components/internships/internship-card.tsx` (new)
- `src/components/internships/internship-detail.tsx` (new, if detail route is selected)
- `src/components/layout/nav-links.ts` and sitemap/metadata files as needed

API contract:

`GET /api/internships`

Query parameters:

- `q`
- `country`
- `region`
- `field`
- `workMode`
- `duration`
- `funding`
- `status` with default `open`
- `sort` with `open_first`, `deadline`, `verified`, or `newest`
- `page`
- `pageSize`, capped at 50

Response shape:

```json
{
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "hasMore": false,
  "facets": { "countries": [], "fields": [], "workModes": [], "funding": [] },
  "internships": []
}
```

Public behavior:

- Query only published records.
- Calculate display status server-side.
- Hide internal AI/provider errors and unpublished evidence details from public responses.
- Show last verified date and explicit unknown labels.
- Link students to the official application URL in a new tab with safe external-link behavior.

Tests/manual checks:

- Filters and pagination return stable totals.
- Country names and ISO codes behave consistently.
- Default results exclude closed records.
- No draft, rejected, or needs-review record appears publicly.
- Empty, loading, error, and mobile states render correctly.

### Slice F — Admin review workflow

Owned files/modules:

- `src/app/(admin)/admin/internships/page.tsx` (new)
- `src/app/(admin)/admin/internships/[id]/page.tsx` (new)
- `src/components/admin/internship-form.tsx` (new)
- `src/components/admin/internship-review.tsx` (new)
- Admin navigation and server-side authorization files

Behavior:

- List drafts, needs-review, published, expired, and archived records.
- Show source/application URLs, evidence quotes, last fetch state, content changes, and research errors.
- Allow authorized admin users to edit, approve, reject, archive, and force recheck.
- Keep publication status separate from verification status.

Tests/manual checks:

- Unauthenticated and non-admin users are denied.
- Approving a record requires valid source/application URLs and required evidence policy.
- Rejected and draft records remain hidden from the public API.
- Manual edits do not accidentally clear source provenance.

## 3. Migration strategy

No migration of existing scholarship documents is required for the MVP. Add a new collection and indexes. Existing scholarship routes and jobs remain unchanged until internship tests and a live dry run pass.

If shared helpers are extracted, first add characterization tests around scholarship behavior, then refactor the helper without changing outputs. Shared research-run fields should be extended only backward-compatibly; if separate run types are needed, add a `kind` field with a default of `scholarship`.

## 4. Package policy

No new package is approved for the MVP. Existing `ai`, `zod`, `mongoose`, `pdf-parse`, Next.js, and UI dependencies are sufficient. Any proposed scraper/browser package requires a separate review because it affects deployment cost, runtime limits, and source terms.

## 5. Verification matrix

### Automated

- TypeScript and ESLint
- Existing scholarship test suite
- Internship normalization/status/schema tests
- Crawler and evidence tests with fixtures
- API contract tests using mocked database records
- Admin authorization tests
- `git diff --check`
- Production build with final result recorded

### Manual

- Run one approved source in dry-run mode.
- Inspect extracted evidence and URLs.
- Run one source with writes in a controlled environment.
- Confirm the admin review record and public API result.
- Confirm a closed/unknown/rolling listing is labeled correctly.
- Open the public page at desktop and mobile widths.
- Click an official application link and verify it leaves the platform.
- Trigger a source failure and verify the previous verified record remains intact.

## 6. Acceptance criteria

Implementation is ready for release only when:

- At least one source produces a verified internship record end-to-end.
- The public page displays only approved/published records.
- Every displayed listing has official source and application links.
- Deadline, funding, duration, and work mode are never fabricated when absent.
- Source errors and stale data are visible to administrators.
- Existing scholarship tests and behavior remain passing.
- The daily workflow is configured and manually tested.

## 7. Next approval gate

Before coding begins, approve:

1. The separate `Internship` collection for MVP.
2. The API contract and filter set above.
3. The admin review requirement for uncertain records.
4. The no-new-package policy.
5. The initial source registry scope.

After this plan is approved, implementation can begin with Slice A.
