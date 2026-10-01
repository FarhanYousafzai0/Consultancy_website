# Data Sources & Filters

No API gives us "which German programs require IELTS 6.5". We build our own database from official sources, verify it, and let students filter it.

## Where the data comes from

| Source | What we use it for | Access |
|---|---|---|
| Official university program pages | **Main source** — language requirements, documents, deadlines, fees | Crawl + AI extraction + human check |
| [DAAD International Programmes](https://www2.daad.de/deutschland/studienangebote/international-programmes/en/) | Discover English-taught programs (~2,000) | Link to it; don't bulk copy |
| Hochschulkompass (HRK) | Full list of universities and programs | Open institution data; ask HRK about program data licensing |
| uni-assist member list | Which universities require uni-assist | Public list |
| anabin (KMK) | Whether a foreign certificate gives university entry (HZB) | Public database, manual rules |
| DAAD Scholarship Database + DAAD Pakistan | Scholarships for internationals | Manual curation |
| Begabtenförderungswerke websites (13 foundations) | Foundation scholarships | Manual curation |
| University Deutschlandstipendium pages | Per-university calls | Crawl + manual |
| Bundesagentur für Arbeit Jobsuche API / BERUFENET (bund.dev) | Ausbildung places and occupation info | Free API |
| Wikidata, ROR | University metadata (location, type, IDs) | Free |
| OpenAlex | Research profiles (PhD matching, later) | Free |

## Data pipeline
1. **Crawl** program pages (Firecrawl or own crawler), including PDFs.
2. **Extract** fields with a cheap AI model into a fixed schema (structured JSON output).
3. **Review** — a person checks each record against the page before it goes live.
4. **Re-check weekly** — re-download pages, compare content hash, changed pages go to a review queue.
5. **Show freshness** — every record shows `last_verified_at` and the source link.

## Example program record
```json
{
  "program": "M.Sc. Computer Science",
  "university": "Saarland University",
  "type": "public",
  "degree_level": "master",
  "language_of_instruction": "English",
  "ielts_min": 6.5,
  "toefl_ibt_min": 90,
  "duolingo_accepted": false,
  "moi_letter_accepted": true,
  "german_required": "none",
  "application_route": "direct",
  "intakes": [
    { "semester": "winter", "year": 2027, "deadline_non_eu": "2027-03-15", "status": "confirmed" }
  ],
  "tuition_per_semester_eur": 0,
  "semester_fee_eur": 300,
  "required_documents": ["transcript", "degree_certificate", "cv", "motivation_letter", "english_certificate", "aps_certificate"],
  "source_url": "https://...",
  "last_verified_at": "2026-09-12"
}
```
*(Values are illustrative — not verified.)*

## Example scholarship record (fields)
`name`, `provider`, `levels`, `nationalities`, `fields`, `min_grade`, `work_experience_years`, `max_years_since_degree`, `age_limit`, `must_be_enrolled`, `amount`, `coverage`, `cycles` (past open/close dates), `next_cycle_status` (confirmed / predicted), `source_url`, `last_verified_at`.

## Filters students can use
- Language test: no IELTS needed (MOI accepted), IELTS ≤ my score, TOEFL / Duolingo / PTE accepted
- German level required: none, B1, B2, C1
- Degree level: Bachelor's, Master's, PhD
- Field of study
- Language of instruction: English / German
- University type: public / private
- Tuition: free, under €1,500/semester, any
- Deadline: still open, closing in 30 days, next intake
- Intake: winter / summer
- Application route: uni-assist / direct / VPD
- City / state
- Eligible for my qualification (uses HZB rules + profile)
- Has university-specific scholarships

Toggle: **"Show all"** (browse) vs **"Only what I qualify for"** (applies profile automatically).

## Pilot plan (Phase 4)
Collect 50 programs end-to-end to measure real time and cost per program before committing to a number for launch.

## Open questions (for Phase 4 grill-me)
- How many programs at launch? Which fields first?
- Who does human verification — consultants, interns, or a hired data person?
- How often do we re-check pages (weekly vs. during application season only)?
- Do we approach HRK / DAAD for official data partnerships?
