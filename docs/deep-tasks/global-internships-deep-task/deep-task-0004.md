# DTM-0004 — Automation and Monitoring

Status: Approved

## Goal

Make internship research runnable manually and daily with metrics and safe concurrency.

## Owned scope

Internship research script/workflow, package scripts, and setup documentation.

## Contract

Support `--dry-run`, `--force`, `--sources`, bounded concurrency, required secrets, run/source metrics, and independent source failure handling.

## Verification

Test dry-run no-write behavior, unknown source errors, missing-secret errors, manual source execution, and workflow configuration.

## Done criteria

Commands and workflow are documented, metrics are visible, and worker report is complete.

## Worker report

Implemented the internship automation and monitoring slice:

- Added `.github/workflows/internship-research.yml` with daily scheduling, manual dispatch inputs, a 90-minute timeout, read-only checkout permissions, and non-overlapping `internship-research` concurrency.
- Extended the research CLI with exported argument parsing, bounded concurrency, explicit environment validation, structured per-source errors, extracted/upserted/needs-review/skipped/provider/active metrics, and JSON summaries.
- Preserved the shared `ResearchRun` contract and scholarship workflow behavior; internship-specific metrics remain in CI logs while compatible totals are stored in the shared run record.
- Added CLI behavior tests and documented credentials, commands, flags, dry-run semantics, metrics, and workflow operation in `docs/ENV_SETUP.md`.
- No packages added. No admin or public UI changes made.

Verification:

- `npx tsx --test scripts/research-internships.test.ts src/lib/internships/research.test.ts src/lib/internships/crawler.test.ts` — 14 passed.
- `npx tsc --noEmit --pretty false` — passed.
- `npx eslint scripts/research-internships.ts scripts/research-internships.test.ts src/lib/internships/research.ts src/lib/internships/crawler.ts` — passed.
- `git diff --check` — passed.

Manual checks completed:

- Argument parsing covers `--dry-run`, `--force`, `--sources`, and concurrency clamping.
- Missing credentials fail with an explicit environment error.
- Dry-run validation does not require `MONGODB_URI`.
- Existing Agent 3 fixture dry-run and unchanged-content behavior remain passing.

Risks:

- A live GitHub Actions run and live Mongo/AI write were not performed because they require deployment credentials and external network access.
- Workflow YAML was reviewed locally but not executed by GitHub Actions in this checkout.

## Engineering-manager review notes

## Engineering-manager review notes

- Independently reran automation, crawler, and research tests: 14 passed.
- TypeScript, targeted ESLint, and `git diff --check` passed.
- Workflow uses daily scheduling, manual inputs, non-overlapping concurrency, and read-only contents permissions.
- Dry-run environment validation correctly avoids requiring MongoDB.

## Approved by engineering manager

Status: Approved

Verification:

- Automation and pipeline tests: 14 passed.
- TypeScript and targeted ESLint passed.
- `git diff --check` passed.

Remaining risks:

- GitHub Actions and live credential/database execution remain deployment-time verification tasks.
