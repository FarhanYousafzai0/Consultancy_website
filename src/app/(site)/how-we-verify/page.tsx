import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { ensureGuidesSeeded, getGuideBySlug } from "@/lib/db/guides";

export const metadata = {
  title: "How we verify",
  description:
    "How Parwaz checks German program and scholarship facts against official sources for Pakistani students.",
};

export default async function HowWeVerifyPage() {
  await ensureGuidesSeeded();
  const guide = await getGuideBySlug("faq-how-we-verify");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <p className="section-label">Trust</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
        How we verify
      </h1>
      <p className="mt-4 text-muted-foreground">
        Every factual claim about a program or scholarship on Parwaz should
        point to an official source and a last-verified date. We advise —
        universities decide.
      </p>

      <ul className="mt-8 space-y-4 text-sm leading-relaxed">
        <li className="rounded-2xl bg-white p-5 shadow-card">
          <p className="font-semibold">Official sources only</p>
          <p className="mt-1 text-muted-foreground">
            Deadlines, fees, and language minimums come from university or
            scholarship pages we can link. We do not invent acceptance rates.
          </p>
        </li>
        <li className="rounded-2xl bg-white p-5 shadow-card">
          <p className="font-semibold">Last verified dates</p>
          <p className="mt-1 text-muted-foreground">
            Cards show when we last checked the fact. Always re-check the
            source before you apply or pay.
          </p>
        </li>
        <li className="rounded-2xl bg-white p-5 shadow-card">
          <p className="font-semibold">AI stays on our data</p>
          <p className="mt-1 text-muted-foreground">
            Ask Parwaz answers from tools over our published catalog and
            guides — not from the open web inventing universities.
          </p>
        </li>
      </ul>

      {guide ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {guide.body.split(/\n\n+/)[0]}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/guides/faq-how-we-verify">Read the full guide</Link>
        </Button>
        <Button asChild variant="outline">
          <a
            href="https://www.parwaazconsultancy.com/contact"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report an error
            <ArrowSquareOut className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
