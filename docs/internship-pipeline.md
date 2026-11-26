# Internship discovery and publication pipeline

## Purpose and current state

Discover international internships from approved sources, verify each opportunity against its own official page, and show approved records in the public directory. Coverage is limited to the configured sources; the pipeline cannot claim to find every opportunity worldwide.

As observed on 26 November 2026, a CERN run retrieved six pages and created four candidates, all requiring review. The model returned reconstructed duration quotes and omitted required eligibility evidence. All candidates are drafts, and the public API returns only published records. One CERN listing was subsequently verified and published manually. IAESTE exposes individual listings and pagination, but its current seed is a general student page and the crawler caps the entire source at eight pages.

## Flow

1. Register source ownership, discovery URLs, crawl domains, and separately approved application-portal domains. Review terms and robots guidance and use conservative per-host limits.
2. Discover listing pages, follow pagination, and identify individual opportunity URLs. A bounded or failed crawl must be reported as incomplete, never interpreted as a complete inventory.
3. Fetch each detail page with timeouts, HTTPS/domain checks on every redirect, content-type and size limits. Do not crawl external application portals just because they are linked.
4. Extract candidates per detail page, treating retrieved content as untrusted data. Save the source URL, exact field evidence, retrieval time, content hash, and provider metadata. Missing facts stay unknown.
5. Validate evidence against the specific fetched page and the stated value. Verify application links are explicitly linked from the source and use a configured official domain. Validate dates, timezones and eligibility restrictions. Unsupported fields or ambiguous candidates require review.
6. Deduplicate using stable source-specific vacancy identity. Do not use mutable details such as duration or application tracking parameters as the sole identity. Keep human edits and publication decisions safe from automated refreshes.
7. Save candidates as drafts; administrators review the source, evidence, changes, and eligibility, then explicitly approve publication. The public API serves published records and computes availability from supported deadlines. Unknown or rolling deadlines must not be described as confirmed open.
8. Recheck published detail pages independently. A failed or partial crawl must not erase or expire records. An explicit past verified deadline can close a record; source disappearance requires further verification. Keep check time separate from last successful verification time.

## Known gaps to resolve

- IAESTE's current robots.txt disallows automated internship detail retrieval. The IAESTE adapter remains disconnected and scheduled IAESTE scraping is disabled pending an authorized access method. Do not bypass this by changing user agents or using another retrieval service.

- Whole-source extraction mixes pages and loses source-specific evidence; long text is truncated.
- The crawler limits all sources to eight pages and does not reliably traverse IAESTE pagination or prioritize internship details.
- Evidence field names are unconstrained; model output such as `stipendSummary` does not match the validator's `stipend` field.
- CERN numeric dates and timezones require explicit source-aware parsing; ambiguous dates must remain unknown.
- Publication and verification are separate, but admin review cannot currently turn an uncertain record into verified with a documented human decision.
- Identity includes mutable duration and URL; refresh may create duplicates. Published refreshes are currently preserved unchanged and therefore can become stale.
- Scheduled runs require GitHub secrets, successful execution and monitoring; a workflow file alone does not populate the directory.
- The UI defaults to confirmed-open records and retains URL filters; provide a clear empty state and access to undated opportunities without representing them as open.

## Acceptance and verification

Test source discovery and pagination with realistic fixtures; enforce page-specific evidence, deadline correctness, safe redirects, idempotency and preservation of reviewed records. Run a dry run against a real source and inspect the specific candidates and errors. Before writing, identify the target database and existing records; after writing, verify admin records, public API results, filters, and the browser. Record counts, source failures, actual timestamps and limitations. Do not publish fabricated test records.

## CERN adapter progress

The CERN adapter checks robots.txt, discovers vacancy links, retrieves each detail page separately and uses the CERN reference as identity. A live run on 27 November 2026 retrieved 19 detail pages, parsed 19 opportunities and added 15 new drafts; four existing records were preserved. One previously published record was returned by the public API. All new records require human review. This is not a complete release verification: authenticated admin/browser review has not been exercised; ambiguous dates require a reviewer; refresh of existing edited records and reliable source-specific change detection remain to be implemented. Listing limits and retrieval failures must be surfaced as incomplete runs.
