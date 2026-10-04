# PRD v1 — Germany Study Platform (MVP)

**Status:** Draft v1 (2026-10-04) — confirm against Phase 1 interview results
**Owner:** Founder
**Sources:** `../decisions-log.md` (#1–18), `../02-scope.md`

## 1. Promise
*"In 60 seconds, a Pakistani student learns honestly whether they can study in Germany and which programs they can actually get into — with verified data and a real consultant one click away."*

## 2. Business goal
Grow the consultancy (currently fewer than 20 clients/year). The platform is free; revenue comes from consultant services: shortlisting, full application handling, documents (SOP/LOM/CV), scholarship applications.

## 3. Users (MVP)
| Persona | Depth | Consultant handoff |
|---|---|---|
| Pakistani BS/BSc graduate → Master's | Full | Yes |
| Pakistani FSc/HSSC / A-level student → Bachelor's | Medium | Yes |
| Pakistani Ausbildung seeker | Medium, self-serve | No (track demand) |

Country: Pakistan only. Language: English only.

## 4. MVP features
1. **Free eligibility check (no sign-up)** — Pakistan rules: FSc/HSSC, A-levels, 4-year BS vs. 2-year BA/BSc, APS. Result: direct entry / Studienkolleg / foundation year / private route / not yet eligible, with next steps.
2. **Verified program database** — 150–200 Master's (CS/IT, data/AI, EE/ME, business), all public Studienkollegs, 30–50 English Bachelor's. Every fact has a source link + last verified date.
3. **Search & filters** — language test/score, German level, degree level, field, public/private, tuition, deadline open, intake, uni-assist/direct, city/state. "Show all" vs. "Only what I qualify for".
4. **Rules-based matching** — live, unlimited, Reach / Match / Safety with reasons; AI writes the explanation. Public shown first when eligible; never ranked by payment.
5. **Program detail + document checklist** — requirements, deadlines, route, cost, documents.
6. **Compare** — 3–5 programs side by side.
7. **Scholarships** — DAAD, 13 foundations, Deutschlandstipendium, university awards, Erasmus+, HEC; structured eligibility; honest odds; past cycles.
8. **Grade converter** (modified Bavarian formula) + cost plan (tuition, semester fee, blocked account).
9. **Ausbildung** — eligibility check + live listings (Bundesagentur für Arbeit API) + guides.
10. **Limited AI chat** — answers only from our guides + top 20 questions; otherwise "I don't have verified information" + WhatsApp handoff.
11. **Consultant handoff** — WhatsApp / booking button on Master's and Bachelor's pages and results.
12. **Email deadline alerts** — shortlisted programs and saved scholarships.
13. **Guides** — APS, blocked account, visa, uni-assist, anabin, Studienkolleg.
14. **Admin** — add/review/approve data, weekly re-check queue.
15. **GDPR basics** — EU hosting, consent, account deletion.

Out of scope: see `../02-scope.md` → "Out of scope".

## 5. User stories (v1)

**Master's student**
- As a BS graduate, I want to know in under a minute whether my degree qualifies for a German Master's, so I don't waste months on the wrong path.
- As a student with IELTS 6.0, I want to see only programs that accept my score, so I don't apply where I'll be rejected.
- As a student, I want to see deadlines with a "last verified" date, so I can trust them.
- As a student, I want my matches grouped into Reach / Match / Safety with reasons, so I can build a balanced shortlist.
- As a student, I want scholarships I actually qualify for with honest odds, so I can plan my money.
- As a student, I want email reminders before deadlines on my shortlist, so I don't miss them.
- As a student, I want one tap to message a consultant, so I can get help with applications and documents.

**Bachelor's student**
- As an FSc student, I want to know whether I need Studienkolleg, a foundation year, or a private university, so I understand my real options.
- As an FSc student, I want to see public and private options with total costs side by side, so I can choose honestly.

**Ausbildung seeker**
- As an Ausbildung seeker, I want to know what German level and documents I need, and see real open places, so I can decide if it's right for me.

**Consultant / admin**
- As the founder, I want to review AI-extracted program data before it goes live, so students only see verified facts.
- As the founder, I want to see which pages changed this week, so I can update deadlines and requirements.
- As the founder, I want every consultant handoff to include the student's profile and shortlist, so the first conversation is useful.

## 6. Success metrics (first 3 months)
| Step | Target |
|---|---|
| Free eligibility checks | 1,000 |
| Accounts created | 300 |
| Consultant handoffs (WhatsApp / chat) | 100 |
| Consultations booked | 30 |
| **New paying clients** | **5–10** |

Quality guards: data accuracy (target set in Phase 6), chat "I don't know" rate, error reports per week.

## 7. Open items for later phases
- Sign-up moment, dashboard, mobile-first → Phase 3
- Stack, who verifies data, re-check frequency, AI budget → Phase 4
- Consultant package pricing → Phase 5
- Launch date and team → Phase 6
