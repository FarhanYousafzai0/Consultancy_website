export type PartnerCategory = "blocked_account" | "insurance";

export type PartnerOffer = {
  id: string;
  name: string;
  category: PartnerCategory;
  url: string;
  disclosure: string;
};

export const PARTNER_DISCLOSURE =
  "We may earn a commission if you sign up. This never changes program rankings.";

function envUrl(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v || fallback;
}

export const partnerOffers: PartnerOffer[] = [
  {
    id: "expatrio",
    name: "Expatrio",
    category: "blocked_account",
    url: envUrl(
      "NEXT_PUBLIC_PARTNER_EXPATRIO_URL",
      "https://www.expatrio.com/"
    ),
    disclosure: PARTNER_DISCLOSURE,
  },
  {
    id: "fintiba",
    name: "Fintiba",
    category: "blocked_account",
    url: envUrl(
      "NEXT_PUBLIC_PARTNER_FINTIBA_URL",
      "https://www.fintiba.com/"
    ),
    disclosure: PARTNER_DISCLOSURE,
  },
  {
    id: "coracle",
    name: "Coracle",
    category: "insurance",
    url: envUrl(
      "NEXT_PUBLIC_PARTNER_CORACLE_URL",
      "https://www.coracle.de/en/"
    ),
    disclosure: PARTNER_DISCLOSURE,
  },
];

export function partnersForCategory(
  category: PartnerCategory
): PartnerOffer[] {
  return partnerOffers.filter((p) => p.category === category);
}
