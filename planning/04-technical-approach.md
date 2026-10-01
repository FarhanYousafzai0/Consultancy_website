# Technical Approach

Final stack decisions happen in Phase 4. This file captures the direction agreed so far.

## Matching engine (no AI needed to decide)
1. **Hard filters (code):** HZB eligibility for the student's country & qualification, degree level, language requirement met (or met by planned test date), deadline still reachable, prerequisite credits for Master's.
2. **Soft score (code):** field fit, German-converted grade vs. program's typical intake, cost, city/state preference, English-taught, career outcomes.
3. **AI layer:** writes plain-language explanations only. Never invents facts.

**Tiers:** Reach / Match / Safety with visible reasons. No acceptance % until we collect real outcome data.

**Grade conversion — modified Bavarian formula:**
German grade = 1 + 3 × (Nmax − Nd) / (Nmax − Nmin)
(Nmax = best possible grade, Nmin = minimum pass grade, Nd = student's grade)

Matching is cheap code, so it runs **live and unlimited** whenever the profile changes.

## AI Advisor design
- Answers through **tools** that query our database: `search_programs`, `check_eligibility(profile, program)`, `get_deadlines`, `list_scholarships`, `get_document_checklist`.
- **Retrieval** (pgvector) over a curated knowledge base: APS, blocked account, visa, uni-assist, anabin, Studienkolleg guides.
- Every factual answer cites source + last verified date.
- Missing data → "I don't have verified information" + offer a human consultant.
- Test set of known questions/answers to measure accuracy before release.

## Cost control
- Small fast model (Gemini Flash / GPT mini class) for chat and extraction.
- Stronger model only for paid features (SOP/motivation letter review).
- Cache common answers; generate match explanations once per profile + program.
- Web search APIs (Tavily, Exa) used **at data-ingestion time**, not during chat.
- Matching and alerts = plain code, ~zero AI cost.

## APIs & services

| Need | Option | Cost |
|---|---|---|
| Ausbildung places, occupations | Bundesagentur für Arbeit Jobsuche + BERUFENET (bund.dev) | Free |
| University metadata | Wikidata SPARQL, ROR, HRK open data | Free |
| Research profiles (PhD, later) | OpenAlex | Free |
| Translation | DeepL API | Free tier, then paid |
| Document OCR | Gemini Flash vision, or Azure Document Intelligence / AWS Textract | Low per page |
| Page crawling & change detection | Firecrawl / own crawler | Low |
| Email & alerts | Resend + scheduled jobs | Free tier |
| Partners | Blocked account & insurance affiliate links/APIs | Revenue |

**No public API:** DAAD, anabin, uni-assist, most scholarship databases → own curation + partnership talks.
**No third-party score verification:** IELTS/ETS verify for universities only → OCR + manual check on our side.

## Architecture direction (to confirm)
- Web app (responsive), EU-hosted backend and database (GDPR).
- Postgres (e.g. Supabase) with pgvector for search and retrieval.
- Scheduled jobs for crawling, re-checks, and alerts.
- Admin panel for data review.

## Open questions (for Phase 4 grill-me)
- Do we rebuild from scratch or reuse an existing codebase? (Workspace currently empty.)
- Which framework and hosting? (e.g. Next.js + Supabase EU region)
- Monthly AI budget limit at launch?
- Do students' answers stay in the browser before sign-up (like Deutics), or do we store them?
