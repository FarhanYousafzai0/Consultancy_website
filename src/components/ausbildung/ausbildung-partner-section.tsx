import { PARTNER_DISCLOSURE } from "@/data/partner-offers";
import type { AusbildungPartnerOffer } from "@/data/ausbildung-partner-offers";

export function AusbildungPartnerSection({
  unlocked,
  offers,
}: {
  unlocked: boolean;
  offers: AusbildungPartnerOffer[];
}) {
  if (!unlocked || offers.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 shadow-card">
      <p className="section-label">Partner help</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em]">
        Paid Ausbildung placement
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Jobsuche stays free and self-serve. These partners help with placement
        if you want paid support — demand unlocked this section.
      </p>
      <ul className="mt-6 space-y-4">
        {offers.map((offer) => (
          <li key={offer.id} className="rounded-2xl bg-muted/60 p-4">
            <p className="font-extrabold">{offer.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{offer.blurb}</p>
            <a
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-3 inline-block text-sm font-semibold text-forest underline-offset-2 hover:underline"
            >
              Visit partner site
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              {offer.disclosure || PARTNER_DISCLOSURE}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
