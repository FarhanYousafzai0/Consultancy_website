# Phase 4 — Data & Technical Planning

**Status:** Not started
**Duration:** 2–3 weeks (can overlap with Phase 3)
**Depends on:** Phase 2
**Grill-me session:** Not done

## Goal
Decide where the data comes from and how the system works. Base: `../03-data-sources-and-filters.md`, `../04-technical-approach.md`.

## Activities
- [ ] Database schema (programs, requirements, intakes/deadlines, scholarships, eligibility rules, users, shortlists)
- [ ] Data source list + crawling plan
- [ ] Matching rules written in plain language (HZB per country, APS, language, grade)
- [ ] AI Advisor design (tools, knowledge base, cost limits)
- [ ] Tech stack and EU hosting choice
- [ ] **Pilot: collect 50 programs** (crawl + AI extract + human check) and measure time/cost per program

## Deliverables
- [ ] Architecture diagram
- [ ] Database schema
- [ ] Matching rules spec
- [ ] Data operations process (who verifies, how often)
- [ ] API list with costs
- [ ] Pilot results (time and cost per program)

## Done when
The 50-program pilot is finished and we know the real effort per program.

## Open questions for grill-me
1. Build from scratch or reuse existing code? (Current workspace has no code.)
2. Stack: e.g. Next.js + Supabase (EU region) — agreed?
3. Who verifies data: consultants, interns, or a dedicated data person?
4. Re-check frequency: weekly all year, or weekly only in application season?
5. How many programs at launch, and which fields first?
6. Monthly AI budget at launch?
7. Do we contact HRK / DAAD about data partnerships now or later?
8. Store pre-sign-up answers on our server or only in the browser?

## Answers
_Filled in during the grill-me session._
