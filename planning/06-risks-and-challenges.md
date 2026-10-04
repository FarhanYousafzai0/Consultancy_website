# Risks & Challenges

| Risk | Impact | How we handle it |
|---|---|---|
| Data becomes outdated or wrong | Students miss deadlines, lose trust | Review pipeline, weekly re-checks, "last verified" badges, deadlines stored per cycle, "report an error" button |
| AI invents facts | Same as above, plus legal risk | AI answers only via tools over verified data, cites sources, refuses when data is missing, tested on a fixed Q&A set |
| Promising admission | Angry students, reputation damage | Tiers instead of percentages; clear "we advise, universities decide" disclaimer |
| Data collection takes longer than planned | Delayed launch | Start narrow (few hundred programs); 50-program pilot to measure effort first |
| GDPR (passports, transcripts, minors) | Fines, trust | EU hosting, explicit consent, account deletion, document retention limits |
| EU AI Act | Compliance | AI that decides admission is high-risk; we only advise — keep humans in the loop, be transparent |
| EU database rights | Legal | Build from primary university sources; link to DAAD, don't bulk copy |
| Scholarships for Bachelor's are rare | Disappointed users | Say it honestly; redirect to cost strategy (tuition-free states, working-student jobs, Deutschlandstipendium after enrolling) |
| Sources are in German | Extraction errors | German-first extraction, human check, translation for UI |
| No agent commissions from public universities | Revenue | Revenue from consultant services, AI document credits, affiliates, possibly private universities / featured listings |
| Paid first consultation lowers lead-to-consultation rate | Fewer than 30 consultations in 3 months | Free WhatsApp chat answers basics; watch the funnel in PostHog; revisit a free call if consultations stay low |
| Legal docs from a generator only, company in Pakistan, data in EU | Policies may not fit the setup | Choose a generator that covers GDPR + non-EU company; revisit lawyer review if EU users grow |
| Strong free competitors (MyGermanUniversity, Deutics) | Hard to stand out | Win on eligibility rules for our countries, honesty, human consultant layer |

## Open questions (for Phase 5 grill-me)
- Who owns data accuracy day to day?
- What disclaimer wording do we use?
- Do we accept money from private universities, and how do we keep rankings neutral?
