import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `${site.name} helps Pakistani students find German programs they can actually get into — with verified data and a real consultant when they need one.`,
};

const points = [
  {
    title: "Pakistan only at launch",
    text: "Eligibility rules are built for Pakistani qualifications (FSc/HSSC, A-levels, BS/BSc, APS). More countries can be added later as separate rule sets.",
  },
  {
    title: "Germany only",
    text: "We go deep on one destination: public and private universities, Studienkolleg, scholarships, and Ausbildung — not fifty shallow countries.",
  },
  {
    title: "Code decides, data proves, AI explains",
    text: "Matching uses rules over verified facts. Every deadline and requirement has a source and a last-verified date. AI explains results; it does not invent them.",
  },
  {
    title: "Free software, paid consultancy",
    text: "The platform grows the consultancy. Tools stay free; revenue comes from shortlisting, applications, documents, and scholarship help when you ask for it.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">About</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          {site.name}
        </h1>
        <p className="mt-4 text-muted-foreground">
          Find the German programs you can actually get into — verified, honest,
          and with a real consultant when you need one.
        </p>
      </div>

      <p className="mt-10 text-sm leading-relaxed text-foreground/85">
        We are a consultancy that uses free software to attract students.
        Pakistani students check eligibility in under a minute, browse programs
        and scholarships with verified facts, then message a consultant on
        WhatsApp when they want human help. We advise. Universities and German
        authorities decide.
      </p>

      <ul className="mt-8 space-y-4">
        {points.map((point) => (
          <li key={point.title} className="rounded-[20px] bg-white p-5 shadow-card">
            <p className="font-semibold">{point.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{point.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="pr-2">
          <Link href="/services">
            Services & pricing
            <span className="grid size-6 place-items-center rounded-full bg-ink text-primary">
              <ArrowUpRight weight="bold" className="size-3.5" />
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/how-we-verify">How we verify</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact</Link>
        </Button>
      </div>
    </div>
  );
}
