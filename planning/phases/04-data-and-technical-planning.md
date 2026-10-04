# Phase 4 — Data & Technical Planning

**Status:** Grilled — schema, matching spec and pilot remaining
**Duration:** 2–3 weeks (can overlap with Phase 3)
**Depends on:** Phase 2
**Grill-me session:** Done (2026-10-05)

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

## Answers (2026-10-04/05)
- **Q1 — Codebase:** new project from scratch.
- **Q2 — Stack:** see `../04-technical-approach.md` → "Tech stack (decided)". Next.js + React + Tailwind + shadcn/ui + Motion; Recharts, cmdk, Vaul, Sonner; Zustand, TanStack Query, TanStack Virtual, nuqs; React Hook Form + Zod; **MongoDB Atlas (Frankfurt) + Mongoose**; **Better Auth** (Google + email one-time code); **Vercel** (EU region).
- **Q3 — Who verifies data:** founder + 1 part-time intern / data assistant.
- **Q4 — Re-check frequency:** weekly all year (automatic; humans review only changed pages).
- **Q5 — Stack hosting region:** EU (Vercel EU region, Atlas Frankfurt).
- **Q6 — AI:** Google Gemini Flash for chat, extraction and match explanations; budget **up to $50/month** with a hard limit and alerts.
- **Q7 — DAAD / HRK partnerships:** after launch.
- **Q8 — Pre-sign-up answers:** kept in the browser until sign-up; only anonymous counts logged.
- **Crawler:** **own crawler** (Playwright + PDF parsing), run weekly on **GitHub Actions**.
- **Email + analytics:** Resend + PostHog (EU cloud).

## Grill-me result
All open questions answered. Remaining before **Done**: database schema, matching rules spec, and the 50-program pilot (measures real time per program).
