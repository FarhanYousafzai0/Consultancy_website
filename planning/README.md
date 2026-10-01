# Planning Hub — Germany Study & Scholarship Platform

Everything we decide before building lives here. When planning is done, this folder is the single source of truth for the build.

## How to use this folder

1. Read the strategy files (`00`–`07`) — this is what we already know.
2. Work through the planning phases in `phases/` one at a time, using a **grill-me session** for each phase to answer its open questions.
3. Every answer from a grill-me session goes into `decisions-log.md` and updates the relevant file.
4. When all phases show **Status: Done**, we start building from `07-build-roadmap.md`.

## Files

| File | What it contains |
|---|---|
| `00-vision-and-positioning.md` | Mission, target students, core principle, how we win |
| `01-competitor-analysis.md` | Competitors, what they do well, their gaps |
| `02-scope.md` | **In scope / out of scope / later** — the master feature list |
| `03-data-sources-and-filters.md` | Where university & scholarship data comes from, filters |
| `04-technical-approach.md` | AI system, APIs, costs, architecture notes |
| `05-user-journey.md` | Student journey from first visit to arrival in Germany |
| `06-risks-and-challenges.md` | What can go wrong and how we handle it |
| `07-build-roadmap.md` | Build order after planning is finished |
| `decisions-log.md` | Every decision we make, with date and reason |
| `phases/` | The 6 planning phases, each with open questions for grill-me |

## Planning phase status

| # | Phase | Grilled | Status | Done on |
|---|---|---|---|---|
| 1 | [Discovery & Research](phases/01-discovery-and-research.md) | [ ] | Not started | — |
| 2 | [Product Definition](phases/02-product-definition.md) | [ ] | Not started | — |
| 3 | [UX & Design](phases/03-ux-and-design.md) | [ ] | Not started | — |
| 4 | [Data & Technical Planning](phases/04-data-and-technical-planning.md) | [ ] | Not started | — |
| 5 | [Business & Legal](phases/05-business-and-legal.md) | [ ] | Not started | — |
| 6 | [Delivery Plan](phases/06-delivery-plan.md) | [ ] | Not started | — |

Status values: **Not started** → **Grilling** → **Done**

### Rule: when is a phase Done?
A phase can be marked **Done** (and we move to the next one) only when:
1. The grill-me session is finished and every open question in the phase file has an answer.
2. The answers are recorded in `decisions-log.md`.
3. All deliverables in the phase file are checked off.

Then: tick **Grilled**, set **Status: Done**, add the date — here and at the top of the phase file.

Estimated planning time: 8–10 weeks (phases 3–5 can overlap).
