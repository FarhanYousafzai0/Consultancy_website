# DTM-0003 — Official Source Pipeline

Status: Approved

## Goal

Implement curated source registration, official retrieval, AI extraction, evidence validation, deduplication, and research upsert.

## Owned scope

New internship source registry/research/crawler modules, research script, and pipeline fixtures/tests.

## Contract

Use official HTTPS domains, evidence-backed fields, grounded application URLs, stable identities, safe stale handling, and per-source errors. Record the exact initial source IDs/URLs in the worker report.

## Verification

Dry-run at least one source with fixtures or a controlled live source; test evidence matching, unsupported URLs, unchanged content, failed refresh, and deduplication.

## Done criteria

One source can produce a verified candidate end-to-end; uncertain data is reviewable; no scholarship pipeline regression; worker report is complete.

## Worker report

- Added curated official registry, safe retrieval wrapper, evidence-backed AI extraction, URL grounding, stable identity/deduplication, source failure handling, stale retirement, and the research CLI.
- Added eight sources across international organization, government, university, company, and exchange categories:
  - `cern-internships`: `https://careers.cern/jobs/`
  - `esa-student-internships`: `https://www.esa.int/About_Us/Careers_at_ESA/Student_Internships2`
  - `oecd-internships`: `https://www.oecd.org/en/about/careers/internships.html`
  - `world-bank-internships`: `https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers`
  - `us-state-department-internships`: `https://careers.state.gov/interns-fellows/student-internship-program/`
  - `mit-urop`: `https://urop.mit.edu/`
  - `microsoft-university-internships`: `https://careers.microsoft.com/v2/global/en/universityinternship`
  - `iaeste-exchange-internships`: `https://iaeste.org/students`
- Changed: source registry, crawler/research modules and tests, internship DB helpers, research script, and package script.
- Internship focused tests: 27 passed.
- Scholarship regression tests: 41 passed.
- TypeScript, ESLint, and `git diff --check` passed.
- No packages added; live AI/Mongo write was not run.

## Engineering-manager review notes

- Source category coverage requirement was initially missed and was corrected before approval.
- Evidence and application URL grounding are enforced before a candidate can be considered verified.
- Initial source coverage is intentionally curated, not a claim of worldwide completeness.

## Approved by engineering manager

Status: Approved

Verification:

- Internship focused tests, scholarship regression tests, TypeScript, ESLint, and diff checks passed.

Remaining risks:

- Live source/AI/database execution and JavaScript-only source pages remain operational follow-ups.
