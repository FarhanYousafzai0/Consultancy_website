# Scope — What We Add and What We Leave Out

This is the master feature list. Status values: **MVP** (first release), **Later** (planned after MVP), **Out** (we are not doing this). Final decisions are confirmed in the Phase 2 grill-me session and recorded in `decisions-log.md`.

## In scope

### A. University & Program Database
| Feature | Status |
|---|---|
| Verified program records (language, IELTS/TOEFL/Duolingo/MOI, German level, deadlines per year, fees, route, documents, source link, last verified date) | MVP |
| Germany-only results | MVP |
| Start narrow: English-taught Master's in CS, engineering, data, business (~a few hundred programs) | MVP |
| Bachelor's route incl. Studienkolleg + foundation year info | MVP |
| Public and private universities, clearly labeled | MVP |
| All fields / German-taught programs / PhD positions | Later |
| Curriculum and module comparison | Later |

### B. Search & Filters (student browses freely)
| Feature | Status |
|---|---|
| Filters: language test & score, German level, degree level, field, language of instruction, tuition, deadline open, intake, uni-assist/direct, city/state | MVP |
| "Show all" vs "Only what I qualify for" toggle | MVP |
| Compare 3–5 programs side by side | MVP |
| Plain-English AI search ("free CS master's in English, IELTS 6") | Later |

### C. Eligibility & Matching
| Feature | Status |
|---|---|
| Free eligibility check without sign-up (country, qualification, level, field, English score) | MVP |
| HZB rules per country (Studienkolleg needed?), APS requirement | MVP |
| German grade converter (modified Bavarian formula) | MVP |
| Rules-based matching, live and unlimited (no re-run quotas) | MVP |
| Reach / Match / Safety tiers with reasons (no fake %) | MVP |
| AI explanation per match ("why it fits / what blocks you / next step") | MVP |
| Calibrated acceptance likelihood from real outcome data | Later |

### D. Scholarships
| Feature | Status |
|---|---|
| Database: DAAD, 13 Begabtenförderungswerke, Deutschlandstipendium (per university), university awards, Erasmus+, home-country (e.g. HEC) | MVP |
| Structured eligibility (nationality, level, field, experience, age, enrolled-only) | MVP |
| Past cycles used to predict next opening | MVP |
| Honest odds + "Bachelor funding is rare" guidance | MVP |
| Scholarships linked to shortlisted universities | Later |

### E. Alerts
| Feature | Status |
|---|---|
| Deadline reminders for shortlisted programs and saved scholarships (email) | MVP |
| "New programs unlocked by your updated profile" alerts | Later |
| Page-watching agents (like AbroadDreaming's Study Agents) | Later |

### F. AI Advisor
| Feature | Status |
|---|---|
| Chat that answers only from our verified data, with source + date | Later (Build phase 3) |
| "I don't know" + hand off to human consultant | Later (Build phase 3) |
| Knowledge base: blocked account, APS, visa, uni-assist, anabin guides | Later (Build phase 3) |

### G. Documents
| Feature | Status |
|---|---|
| Per-program document checklist | MVP |
| Motivation letter / SOP review (paid) | Later |
| German-format / Europass CV builder | Later |
| Transcript upload + OCR auto-fill profile | Later |

### H. Application & After Admission
| Feature | Status |
|---|---|
| Application tracker (status + document checkboxes per program) | Later |
| Personal timeline tied to real deadlines | Later |
| After-admission steps: APS, blocked account, insurance, visa appointment, housing, Anmeldung | Later |
| Partner offers (Expatrio, Fintiba, Coracle, insurance) | Later |

### I. Ausbildung
| Feature | Status |
|---|---|
| Ausbildung listings via Bundesagentur für Arbeit Jobsuche API + BERUFENET | Later |

### J. Consultancy Layer
| Feature | Status |
|---|---|
| "Talk to a consultant" booking from any page | MVP |
| Paid consultant packages (like AbroBot Concierge) | Later |
| Consultant dashboard to see student profiles & shortlists | Later |

### K. Growth & Community
| Feature | Status |
|---|---|
| SEO landing pages generated from the database | Later |
| Students report admit/reject outcomes | Later |
| Webinars, success stories, Q&A community | Later |

### L. Internal / Admin
| Feature | Status |
|---|---|
| Admin panel to add, review and approve program & scholarship data | MVP |
| Weekly page re-check job + change review queue | MVP |
| GDPR basics: EU hosting, consent, account deletion | MVP |

## Out of scope (not doing)
- Countries other than Germany.
- AI-generated facts shown without verification.
- Fake acceptance percentages before we have outcome data.
- Bulk copying DAAD or other databases (EU database rights).
- Official verification of IELTS/TOEFL scores (universities do this).
- Booking visa appointments or submitting uni-assist applications automatically.
- Handling payments for tuition, blocked accounts or insurance (partners do this).
- Native mobile apps (responsive web first).
- Pay-to-rank listings that change match results.

## Open scope questions (for Phase 2 grill-me)
- Is Ausbildung MVP or Later? (current: Later)
- Do private universities appear in MVP matching? (current: yes, labeled)
- Is the AI chat needed at launch for marketing, even in a limited form?
- Which languages does the UI support at launch? (English only? Urdu?)
