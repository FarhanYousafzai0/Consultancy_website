import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AusbildungListings } from "@/components/ausbildung/ausbildung-listings";
import { AusbildungPartnerSection } from "@/components/ausbildung/ausbildung-partner-section";
import { getAusbildungPartnerOffers } from "@/data/ausbildung-partner-offers";
import { getAusbildungDemandTotals } from "@/lib/ausbildung/demand";
import { isAusbildungPartnerUnlocked } from "@/lib/ausbildung/partner-gate";

export const metadata = {
  title: "Ausbildung in Germany",
  description:
    "Check if you are ready for Ausbildung and browse live vocational training listings from the German Jobsuche — self-serve for Pakistani students.",
};

type Props = {
  searchParams: Promise<{ field?: string; where?: string }>;
};

export default async function AusbildungPage({ searchParams }: Props) {
  const sp = await searchParams;
  const field = typeof sp.field === "string" ? sp.field : "";
  const where = typeof sp.where === "string" ? sp.where : "";

  let partnerUnlocked = false;
  try {
    const demand = await getAusbildungDemandTotals();
    partnerUnlocked = isAusbildungPartnerUnlocked(demand);
  } catch {
    partnerUnlocked = false;
  }
  const partnerOffers = getAusbildungPartnerOffers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <section className="rounded-[2rem] bg-gradient-to-br from-muted via-background to-primary/20 px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">Ausbildung</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            Paid vocational training in Germany
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Find out if your German level is ready, then browse live Ausbildung
            offers from the official Jobsuche. Self-serve — we do not place you
            with employers.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/check?goal=ausbildung">Check eligibility</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/guides/faq-ausbildung">Read the guide</Link>
          </Button>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <div>
          <p className="section-label">Live listings</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em]">
            Search Ausbildung places
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Results come from the Bundesagentur für Arbeit Jobsuche API. Always
            confirm details on the official listing before you apply.
          </p>
        </div>
        <AusbildungListings initialField={field} initialWhere={where} />
      </section>

      <AusbildungPartnerSection
        unlocked={partnerUnlocked}
        offers={partnerOffers}
      />
    </div>
  );
}
