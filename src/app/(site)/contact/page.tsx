import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { site, whatsappLink } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: `Message ${site.name} on WhatsApp. Chat for basic questions is free. The first consultation is paid.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Contact</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          Talk to a consultant
        </h1>
        <p className="mt-4 text-muted-foreground">
          WhatsApp is how we reach you. Send a short message with your degree,
          goal, and any shortlist you already have.
        </p>
      </div>

      <section className="mt-10 rounded-[20px] bg-white p-6 shadow-card">
        <h2 className="text-lg font-extrabold">WhatsApp</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Free:</span>{" "}
            basic questions about eligibility, programs, and next steps.
          </li>
          <li>
            <span className="font-semibold text-foreground">Paid:</span>{" "}
            the first consultation, then packages for shortlisting, applications,
            documents, or scholarships.
          </li>
          <li>
            <span className="font-semibold text-foreground">Ausbildung:</span>{" "}
            self-serve tools and guides — no placement handoff.
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="whatsapp">
            <a
              href={whatsappLink(
                "Hi! I'm contacting Parwaaz from the Contact page."
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="size-[18px]" />
              Open WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/services">View services</Link>
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-[20px] bg-muted p-6">
        <h2 className="text-lg font-extrabold">Before you message</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Run the free eligibility check and save a shortlist if you can. That
          context makes the first reply useful. You can also read{" "}
          <Link href="/how-we-verify" className="font-medium text-forest hover:underline">
            how we verify
          </Link>{" "}
          and our{" "}
          <Link href="/disclaimer" className="font-medium text-forest hover:underline">
            disclaimer
          </Link>
          .
        </p>
        <Button asChild className="mt-5">
          <Link href="/check">Start eligibility check</Link>
        </Button>
      </section>
    </div>
  );
}
