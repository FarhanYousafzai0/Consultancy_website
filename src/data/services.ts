/**
 * Consultancy packages shown on /services and the home pricing band.
 * Set `priceAmount` (e.g. "25,000") when founder supplies PKR prices.
 * Until then the UI shows a quote CTA instead of inventing numbers.
 */

export type ServicePackage = {
  id: string;
  title: string;
  summary: string;
  includes: string[];
  /** Digits only display amount, e.g. "25,000" — leave empty until real prices exist. */
  priceAmount?: string;
  /** Shown before amount, default "from PKR". */
  pricePrefix?: string;
  /** Shown after amount, e.g. "/ package". */
  priceSuffix?: string;
  /** Lime pill badge, e.g. "Most chosen". */
  badge?: string;
  whatsappMessage: string;
};

export const servicePackages: ServicePackage[] = [
  {
    id: "shortlisting",
    title: "University shortlisting",
    summary:
      "A balanced Reach / Match / Safety shortlist built from your profile, grades, and language scores — with reasons for each pick.",
    includes: [
      "Review of your eligibility and language scores",
      "Curated shortlist of programs that fit published requirements",
      "Public and private options labeled with cost context",
      "Written next steps for each program on your list",
    ],
    whatsappMessage:
      "Hi! I'm interested in the University shortlisting package on Parwaaz.",
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
    id: "documents",
    title: "Documents (SOP / CV)",
    summary:
      "Motivation letter and CV writing or review in a format German universities expect.",
    includes: [
      "SOP / motivation letter drafting or paid review",
      "German-format / Europass-style CV support",
      "Feedback aligned to your shortlisted programs",
      "Revision rounds agreed before work starts",
    ],
    whatsappMessage:
      "Hi! I'm interested in the Documents package (SOP / motivation letter / CV) on Parwaaz.",
  },
  {
    id: "scholarships",
    title: "Scholarship applications",
    summary:
      "Help applying to scholarships you actually fit — with honest odds and deadline tracking.",
    includes: [
      "Shortlist of scholarships matched to your profile",
      "Honest odds guidance (Bachelor funding is rare)",
      "Application support for selected calls",
      "Deadline reminders for your saved list",
    ],
    whatsappMessage:
      "Hi! I'm interested in the Scholarship applications package on Parwaaz.",
  },
];

/** First three packages as pricing cards; last becomes the bottom bar (like Pure CMS). */
export const featuredPackages = servicePackages.slice(0, 3);
export const highlightPackage = servicePackages[3]!;

export const freeTools = [
  "Eligibility check (no sign-up)",
  "Program search and matching",
  "Scholarship search with honest odds",
  "Guides and tools (grade converter, cost calculator)",
  "WhatsApp questions — chat is free",
];

export const notSold = [
  "APS certificate filing",
  "Visa filing or appointment booking",
  "Language classes",
  "Ausbildung placement",
  "Private-university commissions that change match rankings",
];

export const pricingNote =
  "First consultation is paid. WhatsApp chat for basic questions stays free. Message us for the current package price.";

export function packagePriceLabel(pkg: ServicePackage) {
  if (pkg.priceAmount) {
    return {
      amount: pkg.priceAmount,
      prefix: pkg.pricePrefix ?? "from PKR",
      suffix: pkg.priceSuffix ?? "/ package",
      isQuote: false as const,
    };
  }
  return {
    amount: "Quote",
    prefix: "Get a",
    suffix: "on WhatsApp",
    isQuote: true as const,
  };
}
