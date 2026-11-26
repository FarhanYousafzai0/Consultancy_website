# Global Internship Opportunities — R&D and Architecture Draft

Status: Draft for approval

This document defines the research and architecture direction for adding international internship opportunities. It is intentionally limited to product, data, and system design. It does not authorize production implementation yet.

## 1. Product outcome

Provide a trustworthy directory of international internships for students, including short-term, seasonal, remote, hybrid, on-site, and up-to-one-year opportunities. Every published listing must link to an official source and clearly show what was verified and when.

The platform is a discovery and referral service. Students apply on the official organization website; the platform does not submit applications on their behalf.

## 2. Existing repository facts

- The app uses Next.js 16 App Router, TypeScript, MongoDB/Mongoose, Zod, and the AI SDK.
- Scholarships already have database types, Mongoose models, source registries, crawler/PDF retrieval, AI extraction, normalization, status calculation, API filtering, and a scheduled GitHub Actions research job.
- Research source and research run records already track fetch outcomes and provider usage.
- Existing scholarship research has demonstrated that official-source evidence, deadline years, domain allowlists, duplicate handling, and failed retrievals must be first-class concerns.

## 3. Recommended domain model

Create a shared opportunity concept in the architecture, but keep scholarship and internship records separate in the first implementation. This avoids a risky migration while allowing shared pipeline utilities and future cross-opportunity search.

### Internship record

- `title`
- `slug`
- `organizationName`
- `organizationLogoUrl` or a safe fallback; do not scrape arbitrary images by default
- `summary`
- `description`
- `countryCode`
- `city`
- `locationLabel`
- `workMode`: `remote`, `hybrid`, `on_site`, `unknown`
- `durationValue` and `durationUnit`: `weeks`, `months`, `year`, `unknown`
- `startDate`, `endDate`, and/or `durationText`
- `deadline`
- `deadlineStatus`: `confirmed`, `rolling`, `not_published`, `ambiguous`
- `eligibilityCriteria`
- `eligibleNationalities`
- `studyFields`
- `educationLevels`
- `experienceRequirements`
- `fundingStatus`: `paid`, `unpaid`, `fully_funded`, `partially_funded`, `unknown`
- `stipendSummary`
- `benefits`
- `applicationUrl`
- `sourceUrl`
- `sourceDomain`
- `sourceOrganizationType`
- `lastVerifiedAt`, `lastCheckedAt`, and `lastSuccessfulFetchAt`
- `sourceContentHash`
- `verificationStatus`: `verified`, `needs_review`, `rejected`
- `publicationStatus`: `draft`, `published`, `expired`, `archived`
- `researchProvider`, `researchModel`, and `researchError`
- `evidence`
- `notes`

The public application status (`open`, `closing_soon`, `closed`, `unknown`) should be calculated from the verified deadline and publication state, not stored as an independently editable value.

## 4. Evidence and publishing rules

An AI extraction is not sufficient evidence by itself.

- A listing must have an official source URL and an official application URL.
- The application domain must be allowlisted or explicitly approved by an administrator.
- A confirmed deadline must include an exact source quote containing the date and year.
- Missing facts remain unknown; the pipeline must not infer stipend amounts, eligibility, or dates.
- “Paid,” “fully funded,” and “stipend” must remain distinct states.
- Aggregator pages may be discovery inputs, but cannot be the publication source unless manually approved.
- A failed refresh must not immediately erase a previously verified listing; it should create a review state and preserve the last successful evidence.
- Expiry requires either a verified past deadline or repeated source evidence that the opportunity is no longer available.

## 5. Pipeline architecture

```text
Source registry
  -> discover official pages, feeds, sitemaps, and linked PDFs
  -> retrieve with domain allowlists, size limits, redirect controls, and hashes
  -> extract structured internship candidates with AI
  -> validate URLs, dates, enums, and evidence quotes
  -> normalize countries, fields, work modes, duration, and funding
  -> deduplicate by canonical application/source identity
  -> compare with existing records
  -> publish verified records or send uncertain records to admin review
  -> recalculate status and record the research run
```

The first version should reuse the current crawler, source tracking, research-run tracking, URL normalization, and AI provider fallback patterns. Internship-specific extraction and validation should be separate modules so scholarship behavior remains stable.

## 6. Source strategy for the first release

Start with a small, curated set rather than claiming complete worldwide coverage. Candidate source categories:

- Government and embassy internship programs
- United Nations and other international organizations
- University research internships
- Recognized research institutes and laboratories
- Established company student/research internship portals
- Official exchange and fellowship programs that explicitly include internships

Each source should have a registry entry containing its domain, seed URLs, allowed linked domains, retrieval method, maximum pages, and review notes. Sources should be added only after checking their structure and public access terms.

## 7. Public UI proposal

Route: `/internships`

MVP experience:

- Search and responsive opportunity cards
- Country/region, field, work mode, duration, funding, and status filters
- Cards showing title, organization, country/city, duration, deadline, funding, work mode, and verification date
- Clear labels for “Deadline not published,” “Rolling,” and “Closing soon”
- Detail view or expanded card with eligibility, benefits, evidence date, and official application CTA
- Notice that applications are completed on the official website

The visual language should reuse the scholarship browser and existing site layout patterns while giving internships their own iconography and labels.

## 8. Admin workflow

Admin users need to see:

- New candidates awaiting review
- Changed fields since the previous fetch
- Source and application URLs
- Extracted evidence quotes
- Last successful fetch and last error
- Duplicate candidates
- Listings approaching expiry
- Manual actions: approve, edit, reject, archive, and force recheck

The first release should not automatically publish low-confidence or ambiguous records.

## 9. Delivery phases

### Phase 1 — R&D and architecture

Approve this domain model, source policy, evidence rules, MVP filters, and initial source categories. Produce the final implementation plan and test matrix.

### Phase 2 — Data and pipeline MVP

Add internship types/schema/model, source registry, extraction and validation modules, deduplication, status logic, research-run integration, and a small set of verified sources.

### Phase 3 — Admin review

Add the review queue, evidence display, manual publishing controls, and source/run monitoring.

### Phase 4 — Public directory

Add the public page, API filters, cards, detail presentation, SEO metadata, and official-application referral flow.

### Phase 5 — Automation hardening

Add daily scheduling, retries, alerting, stale-source reporting, change detection, and operational metrics.

### Phase 6 — Enhancements

Consider saved internships, email/WhatsApp alerts, student matching, personalized recommendations, and broader source coverage only after listing quality is proven.

## 10. Decisions requiring approval

1. Keep internships in a separate collection initially, with shared utilities rather than immediately migrating scholarships into a universal collection.
2. Require official source and application URLs for publication.
3. Use admin review for uncertain or low-confidence records.
4. Treat unknown deadlines and funding as explicit values, never as inferred values.
5. Launch with a curated source set and expand coverage gradually.
6. Build the public directory only after the pipeline can produce verifiable records.

## 11. Approval gate

Once these decisions are approved, the next artifact will be a detailed implementation plan with exact files/modules, API contracts, schema validation rules, test cases, migration strategy, and manual verification steps. Production code should begin only after that plan is approved.
