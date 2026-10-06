import { PARTNER_DISCLOSURE } from "@/data/partner-offers";

export type AusbildungPartnerOffer = {
  id: string;
  name: string;
  blurb: string;
  url: string;
  disclosure: string;
};

/**
 * Paid Ausbildung placement partners — only rendered when demand gate unlocks
 * and at least one affiliate/landing URL is configured.
 */
export function getAusbildungPartnerOffers(): AusbildungPartnerOffer[] {
  const url = process.env.NEXT_PUBLIC_PARTNER_AUSBILDUNG_URL?.trim();
  if (!url) return [];
  return [
    {
      id: "ausbildung_placement",
      name:
        process.env.NEXT_PUBLIC_PARTNER_AUSBILDUNG_NAME?.trim() ||
        "Ausbildung placement partner",
      blurb:
        process.env.NEXT_PUBLIC_PARTNER_AUSBILDUNG_BLURB?.trim() ||
        "Paid help finding and applying to Ausbildung places. Confirm terms with the partner before you pay.",
      url,
      disclosure: PARTNER_DISCLOSURE,
    },
  ];
}
