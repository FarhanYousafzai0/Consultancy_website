import { Suspense } from "react";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ensureGuidesSeeded, getGuideBySlug } from "@/lib/db/guides";

export const metadata = {
  title: "How we verify",
  description:
    "How Parwaaz checks German program and scholarship facts against official sources for Pakistani students.",
};

export default function HowWeVerifyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Trust</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          How we verify
        </h1>
        <p className="mt-4 text-muted-foreground">
          Every factual claim about a program or scholarship on Parwaaz should
          point to an official source and a last-verified date. We advise —
          universities decide.
        </p>
      </div>

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
            Ask Parwaaz answers from tools over our published catalog and
            guides — not from the open web inventing universities.
          </p>
        </li>
      </ul>

      <Suspense
        fallback={
          <div className="mt-8 space-y-2" aria-busy="true">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        }
      >
        <VerifyExcerpt />
      </Suspense>

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

async function VerifyExcerpt() {
  await ensureGuidesSeeded();
  const guide = await getGuideBySlug("faq-how-we-verify");
  const excerpt = guide?.body.split(/\n\n+/).filter(Boolean)[0];
  if (!excerpt) return null;
  return <p className="mt-8 text-sm text-muted-foreground">{excerpt}</p>;
}
