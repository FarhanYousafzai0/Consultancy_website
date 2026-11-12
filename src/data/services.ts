/**
 * Consultancy packages shown on /services and the home packages band.
 * No prices on the site: students start with the free profile evaluation.
 */

export type ServicePackage = {
  id: string;
  title: string;
  summary: string;
  includes: string[];
  /** Lime pill badge, e.g. "Most chosen". */
  badge?: string;
  /** Internal page for "Get started". When unset, the button opens WhatsApp. */
  href?: string;
  whatsappMessage: string;
};

export const servicePackages: ServicePackage[] = [
  {
    id: "profile-evaluation",
    title: "Get free profile evaluation",
    summary:
      "Share your degree, grades, and language scores. A consultant tells you honestly where you stand for a master's in Germany.",
    includes: [
      "Review of your eligibility and language scores",
      "Honest Reach / Match / Safety read on your profile",
      "Programmes that fit published requirements",
      "Written next steps you can act on",
    ],
    href: "/consultation",
    whatsappMessage:
      "Hi! I'd like a free profile evaluation on Parwaaz.",
  },
  {
    id: "applications",
    title: "Full application handling",
    summary:
      "We manage your uni-assist or direct applications end to end so deadlines and portals do not slip.",
    includes: [
      "Application plan tied to real intake deadlines",
      "Portal guidance (uni-assist / direct / VPD where needed)",
      "Document checklist tracked per program",
      "Status updates until you submit",
    ],
    badge: "Most chosen",
    whatsappMessage:
      "Hi! I'm interested in the Full application handling package on Parwaaz.",
  },
  {
    id: "lom-cv-call",
    title: "1-1 call for LOM and CV review",
    summary:
      "A one-to-one call with a consultant to review your letter of motivation and CV the way German universities expect.",
    includes: [
      "1-1 call with a consultant",
      "Line-by-line feedback on your letter of motivation",
      "German-format / Europass-style CV review",
      "Written action points after the call",
    ],
    whatsappMessage:
      "Hi! I'd like to book a 1-1 call for LOM and CV review on Parwaaz.",
  },
];

export const freeTools = [
  "Eligibility check (no sign-up)",
  "Profile evaluation with a consultant",
  "Program search and matching",
  "Scholarship search with honest odds",
  "Guides and tools (grade converter, cost calculator)",
  "WhatsApp questions — chat is free",
];

export const notSold = [
  "Visa filing or appointment booking",
  "Language classes",
  "Ausbildung placement",
  "Private-university commissions that change match rankings",
];

export const pricingNote =
  "Start with a free profile evaluation. WhatsApp chat for basic questions stays free, and you decide what happens next.";
