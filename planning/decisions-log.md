# Decisions Log

Every decision from planning and grill-me sessions goes here. Newest at the top.

| # | Date | Phase | Decision | Reason | Affects file(s) |
|---|---|---|---|---|---|
| 34 | 2026-10-05 | Build | Brand name: **Parwaz Consultancy** — winged "P" logo in ink + lime (matches palette). Files: `web/public/logo.png` (header), `logo-light.png` (dark backgrounds), `logo-mark.png` (icon only), `src/app/icon.png` + `apple-icon.png` (browser/phone icons) | Founder's logo | design/design-system.md |
| 33 | 2026-10-05 | Build | Exactly three roles: Visitor, Student, Admin — no extra roles | Founder's decision; keep it simple | design/sitemap-and-flows.md |
| 32 | 2026-10-05 | Phase 6 | Solo developer + AI assistant, ~10 h/week, target December 2026, 5 beta testers, ≥98% data accuracy, 1-week sprints. Planning closed — start building, core features first (eligibility check, programs, matching, WhatsApp, guides, admin), then scholarships, alerts, AI chat, Ausbildung, crawler | Founder wants to start building now | 07 |
| 31 | 2026-10-05 | Phase 5 | First consultation is paid; WhatsApp chat is free; Phase 1 interviewees keep a free session as research thank-you | Founder's choice; risk to consultation target noted in 06 | phases/05, design/sitemap-and-flows.md, 06 |
| 30 | 2026-10-05 | Phase 5 | Revenue: consultant packages (current prices, "from PKR X") + disclosed affiliates; AI tools later as one-time credits; no private-uni commissions at launch; company in Pakistan; legal docs via generator | Matches current business; keeps ranking neutral | phases/05 |
| 29 | 2026-10-05 | Phase 4 | Data ops: founder + 1 part-time intern verify data; weekly automatic re-checks all year; own crawler (Playwright + PDF) on GitHub Actions; DAAD/HRK partnerships after launch | Low cost; humans review only changed pages | 03, 04 |
| 28 | 2026-10-05 | Phase 4 | AI = Gemini Flash, ≤ $50/month hard limit; pre-sign-up answers stay in browser; Resend + PostHog EU | Cheap, GDPR-friendly | 04 |
| 27 | 2026-10-05 | Phase 4 | New codebase. Stack: Next.js, React, Tailwind, shadcn/ui, Motion, Recharts, cmdk, Vaul, Sonner, Zustand, TanStack Query/Virtual, nuqs, RHF + Zod, MongoDB Atlas Frankfurt + Mongoose, Better Auth, Vercel EU | Founder's chosen stack; EU hosting for GDPR | 04 |
| 26 | 2026-10-04 | Phase 3 | Sitemap v1 approved. Login = Google + email one-time code; WhatsApp message = summary + private profile/shortlist link; "How we verify" in main nav + linked from Verified badges; result page shows top 3 matches + total count before free sign-up | Low friction, trust visible everywhere, consultant gets context instantly | design/sitemap-and-flows.md |
| 25 | 2026-10-04 | Phase 3 | WhatsApp buttons use white text/icons: inline button on dark green #0E7A4F, floating button on bright #25D366 | Founder wants white; dark green keeps text readable (WCAG AA ~5.4:1) | design/design-system.md, design/preview.html |
| 24 | 2026-10-04 | Phase 3 | Final palette from reference: lime #D4F56A (primary, ink text on it), forest #2F5D0A (green text on white), ink #0F1110 (text + sparing black accents), grey surface #F0F1EE; mixed cards (white shadow for items, flat grey/lime/ink for sections); JetBrains Mono uppercase for small section labels only | Founder's reference image; lime can't carry white text or be used as text on white (contrast) | design/design-system.md, design/preview.html |
| 23 | 2026-10-04 | Phase 3 | UX: mobile-first; bottom tab bar (mobile), top bar (desktop), sidebar only in dashboard; sign-up after eligibility result + first matches; WhatsApp inline + small floating button; dashboard = eligibility, shortlist + deadlines, next steps, saved scholarships | Reduce friction; most students on phones; consultant handoff is the conversion | design/design-system.md, 05 |
| 22 | 2026-10-04 | Phase 3 | Components: pill buttons, 20px cards with soft floating shadow (no border), Phosphor icons, full program cards, Verified/Predicted/Unverified badges, Reach amber / Match green / Safety blue-grey | Founder's choices; trust signals visible on every card | design/design-system.md |
| 21 | 2026-10-04 | Phase 3 | Visual: trustworthy & calm; green + greys only; Plus Jakarta Sans; no dark mode at launch; real German photos; plain English; Tailwind + shadcn/ui; WCAG AA | Calm, honest feel for a high-stakes decision | design/design-system.md |
| 20 | 2026-10-04 | Phase 3 | Color direction: white base + green accent (exact shades from founder's reference image) | Founder's preference; also distinct from competitors' generic blue | phases/03, design system |
| 19 | 2026-10-04 | Phase 3 | New standalone brand (name TBD) | Founder's choice | 00, phases/03 |
| 18 | 2026-10-04 | Phase 2 | 3-month targets: 1,000 checks → 300 accounts → 100 handoffs → 30 consultations → 5–10 paying clients; main metric = new paying clients | Growth goal; adds 25–50% to yearly clients in one quarter | phases/02 (prd), phases/06 |
| 17 | 2026-10-04 | Phase 2 | Launch data: 150–200 Master's (CS/IT, data/AI, EE/ME, business) + all public Studienkollegs + 30–50 English Bachelor's | Enough for 10+ good matches for typical CS/engineering graduates; ~50–65 hrs checking | 02, 03, phases/04 |
| 16 | 2026-10-04 | Phase 2 | English only at launch (website, chat, content) | Keep content work small; target students apply in English | 02, phases/03 |
| 15 | 2026-10-04 | Phase 2 | Public + private universities both shown, labeled with total cost, ranked by fit/cost never payment, public first when eligible; disclose any future commission | Honesty promise; private is the realistic route for many FSc students | 02, 04, phases/05 |
| 14 | 2026-10-04 | Phase 2 | MVP includes a limited AI chat: answers only from our guides + top 20 questions, otherwise hands off to WhatsApp consultant | Students expect AI; limiting it to curated content keeps answers honest | 02, 04, 07 |
| 13 | 2026-10-04 | Phase 2 | Core promise: honest Pakistan-specific eligibility in 60 seconds + programs you can actually get into + consultant one click away | Only differentiator no competitor combines; directly converts visitors into consultancy leads | 00, phases/03 |
| 12 | 2026-10-04 | Phase 1 | Six pain points to solve at launch: eligibility, language, money, deadlines, wrong program choice, documents — each mapped to an MVP feature | Founder's client experience; to be ranked by interviews | 02, phases/02 |
| 11 | 2026-10-04 | Phase 1 | Founder runs 13–15 interviews (30 min), recruited from FB/WhatsApp groups, LinkedIn, clients, university societies; thank-you = free mini-counselling | Direct insight; doubles as first lead generation | phases/01 |
| 10 | 2026-10-04 | Phase 1 | Platform's primary goal is growth (lead generation for the consultancy) | Fewer than 20 clients/year today | 00, phases/02 (metrics) |
| 9 | 2026-10-04 | Phase 1 | Ausbildung is free self-serve at launch, no consultant handoff; APS and visa covered by free guides only | Consultancy doesn't sell these services today; avoid promising what we can't deliver | 02, 05 |
| 8 | 2026-10-04 | Phase 1 | Paid services the platform should lead to: shortlisting, full application handling, documents (SOP/LOM/CV), scholarship applications | These are what clients already pay for | 02 (consultancy layer), phases/05 |
| 7 | 2026-10-04 | Phase 1 | Launch country: Pakistan only, with eligibility rules built as per-country rule sets so others can be added later | Home market; each country needs its own verified rules | 00, 03, 04 |
| 6 | 2026-10-04 | Phase 1 | Launch depth: Master's full; Bachelor's and Ausbildung medium (eligibility check + curated list / API listings + consultant handoff) | Keeps heavy data work focused on one group while every group gets an honest answer on day one | 02, 03, 07 |
| 5 | 2026-10-04 | Phase 1 | Target students at launch: Master's (BS/BSc), Bachelor's (FSc/HSSC incl. Studienkolleg/private), and Ausbildung | Consultancy serves all three groups today | 00, 02, 03 |
| 4 | 2026-10-04 | Phase 1 | Business model: consultancy-led — free software attracts students, revenue mainly from consultant services | Existing consultants and clients; student subscriptions alone rarely work in the Germany market (no university commissions) | 00, 02, phases/05 |
| 3 | 2026-10-02 | Pre-planning | Matching is rules-based and free/unlimited; AI only explains | Avoid wrong AI facts (seen in AbroadDreaming); matching costs almost nothing to run | 02, 04 |
| 2 | 2026-10-02 | Pre-planning | Every fact must have a source link and "last verified" date | Trust is the main differentiator | 03 |
| 1 | 2026-10-02 | Pre-planning | Germany only | Depth over breadth; competitors are shallow on Germany | 00, 02 |

## Template
```
| # | YYYY-MM-DD | Phase X | <decision> | <why> | <files> |
```
