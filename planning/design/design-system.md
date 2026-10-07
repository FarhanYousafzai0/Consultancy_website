# Design System v0.2

**Status:** Decisions locked except brand name/logo.
**Decided:** 2026-10-04 (decisions #19–24 in `../decisions-log.md`)

## 1. Brand feel
**Trustworthy and calm, with green as the hopeful touch.** Like a good bank or health app: clear, organized, honest. Students are making a big, expensive decision — the UI must feel safe, never flashy.

Brand: **Parwaaz Consultancy** — winged "P" logo in ink + lime.
- `logo.png` — full logo on light backgrounds (header: 44px tall mobile, 48px desktop)
- `logo-light.png` — full logo with white text for dark backgrounds (footer)
- `logo-mark.png` — winged "P" only (small spaces); browser/phone icons generated from it

## 2. Colors
Based on the founder's reference (Aeline-style template): **white + lime green + light grey + black accents**. Inspiration for the lime + dark-green pairing: Wise.

| Role | Token | Value | Use |
|---|---|---|---|
| Background | `--background` | `#FFFFFF` | Page background |
| **Lime (primary)** | `--primary` | `#D4F56A` | Main buttons, Match tag, highlight card, active tab |
| Lime hover | `--primary-hover` | `#C2E84A` | Hover / pressed |
| Lime soft | `--primary-soft` | `#EEFBC9` | Secondary buttons, Verified badge, tints |
| Lime 200 | `--primary-200` | `#E2F79E` | Secondary button hover |
| **Forest (green text)** | `--forest` | `#2F5D0A` | Links, checks and green text on white (~7.8:1 contrast) |
| **Ink** | `--foreground` | `#0F1110` | Text on white **and on lime**, black accent cards, arrow circle |
| Grey text | `--muted-foreground` | `#5F635F` | Secondary text |
| Grey border | `--border` | `#E4E5E2` | Outline buttons, dividers |
| Grey surface | `--muted` | `#F0F1EE` | Flat section cards, inputs, neutral chips |
| Amber | `--amber` / bg `#FEF3D7` / text `#7A4F00` | `#F5A524` | Predicted data, Reach tag, warnings |
| Slate | bg `#E7EDF3` / text `#3B5166` | — | Safety tag |
| Red | `--destructive` / bg `#FDECEC` | `#DC2626` | Errors only — never for tiers |
| WhatsApp dark | `--whatsapp-dark` / hover `#0B6941` | `#0E7A4F` | Inline "Ask a consultant" button, white text (~5.4:1) |
| WhatsApp bright | `--whatsapp` | `#25D366` | Floating WhatsApp button only, white logo |

Rules:
- **Text on lime is always Ink (near-black)** — never white (black on lime ≈ 17:1 contrast).
- **Lime is never used for text on white** (unreadable). Green text = Forest `#2F5D0A`.
- **Black (Ink) as accent, sparingly:** hero/next-step highlight card, arrow circle inside the primary button, footer.
- No second brand color beyond lime; amber/slate/red are status colors.
- No dark mode at launch.

## 3. Typography
**Font:** Plus Jakarta Sans (all text). Headings use tight letter-spacing (−0.02 to −0.03em).
**Labels:** JetBrains Mono, 12px, UPPERCASE, wide letter-spacing, with a small square dot before it — **for small section labels only** (e.g. "■ YOUR MATCHES"). Buttons and navigation use normal Plus Jakarta Sans.

| Style | Size (mobile / desktop) | Weight |
|---|---|---|
| Display (hero) | 36 / 56px | 800 |
| H1 | 28 / 40px | 700 |
| H2 | 22 / 30px | 700 |
| H3 | 18 / 22px | 600 |
| Body | 16px | 400 |
| Small | 14px | 400–500 |
| Caption / badge | 12px | 600 |

Line height: 1.5 for body, 1.2 for headings.

## 4. Shape & depth
- **Buttons, chips, badges, inputs:** pill-shaped (fully rounded).
- **Cards, modals, sheets:** 20px corner radius.
- **Two card types:**
  - **Item cards** (programs, scholarships, results): white, **no border**, soft floating shadow `0 4px 24px rgba(15,17,16,0.06)`; on hover `0 10px 32px rgba(15,17,16,0.10)` + 2px lift.
  - **Section cards** (stats, highlights, marketing): **flat, no shadow** — grey `#F0F1EE`, lime `#D4F56A`, or ink `#0F1110` (white text).

## 5. Buttons
| Variant | Look | Use |
|---|---|---|
| Primary | Lime, ink text, pill, **black arrow circle on the right** | One main action per screen ("Check my eligibility") |
| Secondary | Lime soft, forest text | Second actions ("Add to shortlist") |
| Outline | White, thin grey outline | Neutral actions ("Filters", "Browse programs") |
| Dark | Ink background, white text | Strong action inside light areas ("Check", "Continue") |
| Ghost | Text only | Low-priority actions ("Skip for now") |
| WhatsApp | Dark WhatsApp green `#0E7A4F`, **white text + white logo**; floating button = bright `#25D366` with white logo | "Ask a consultant" only |

Sizes: small (36px), default (44px — minimum touch target on mobile), large (52px, hero CTAs). Always visible focus ring.

## 6. Icons & imagery
- **Icons:** Phosphor (regular weight; fill weight for active states).
- **Imagery:** real photos of German campuses and cities on marketing pages. No stock "smiling students", no cartoons. App screens are mostly photo-free.

## 7. Key components

### Program card
Shows: university + program name · Public/Private · city · language · IELTS needed · next deadline · cost per semester · **Reach / Match / Safety** tag · **"Verified [date]"** badge · Save + Compare actions.

### Badges
| Badge | Look |
|---|---|
| Verified | Green check + "Verified 12 Sep 2026" |
| Predicted | Amber + "Predicted from last year" |
| Unverified | Grey + "Not yet verified" |
| Reach | Amber pill |
| Match | Green pill |
| Safety | Blue-grey pill |
| Public / Private | Neutral grey pill |

### Other components (shadcn/ui based)
Input, select, slider, checkbox, tabs, filter sheet (bottom sheet on mobile), dialog, toast, progress bar (profile completion), empty states, skeleton loaders.

## 8. Layout & navigation
- **Mobile-first.**
- **Mobile:** bottom tab bar — Home, Search, Matches, Scholarships, Profile.
- **Desktop:** top navigation bar on public pages; **left sidebar only in the logged-in dashboard**.
- **Consultant:** WhatsApp button inline in results and program pages + one small floating button (never covering content).
- **Sign-up:** after the free eligibility result and first few matches.
- **Dashboard home:** eligibility status · shortlist with nearest deadlines · next steps · saved scholarships.

## 9. Writing style
Plain, friendly English. Short sentences. No jargon. German terms always explained on first use, e.g. *"Studienkolleg (a one-year foundation course)"*. Honest even when the answer is "not yet".

## 10. Build
- Tailwind CSS + shadcn/ui, themed with the tokens above.
- Accessibility: **WCAG AA** — contrast, keyboard navigation, visible focus, labels on all inputs, 44px touch targets.

## Preview
- Live preview: `preview.html` (open in a browser)
- Screenshots: `design-preview-desktop.png`, `design-preview-cards.png`, `design-preview-stats.png`

## Pending
- [x] Exact green palette from reference image
- [x] Inspiration review (reference template + Wise; Mobbin needs a paid plan)
- [x] Visual preview page (colors, buttons, cards)
- [x] Brand name + logo (Parwaaz Consultancy)
