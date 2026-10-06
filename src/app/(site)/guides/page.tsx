import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ensureGuidesSeeded, listGuides } from "@/lib/db/guides";
import type { GuideTopic } from "@/lib/db/types";

export const metadata = {
  title: "Guides",
  description:
    "Plain-English guides for Pakistani students: APS, blocked account, visa, uni-assist, anabin, Studienkolleg, and FAQs.",
};

const topicLabel: Record<GuideTopic, string> = {
  aps: "APS",
  blocked_account: "Blocked account",
  visa: "Visa",
  uni_assist: "uni-assist",
  anabin: "anabin",
  studienkolleg: "Studienkolleg",
  faq: "FAQ",
  other: "Other",
};

export default async function GuidesPage() {
  await ensureGuidesSeeded();
  const guides = await listGuides({ status: "published" });

  const byTopic = guides.reduce<Record<string, typeof guides>>((acc, g) => {
    (acc[g.topic] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8 md:px-6 md:pb-16 md:pt-12">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
        Guides
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
        Verified answers, plain English
      </h1>
      <p className="mt-3 text-muted-foreground">
        Curated for Pakistani applicants. Every guide links to an official source —
        confirm there before you apply or pay.
      </p>

      <div className="mt-10 space-y-10">
        {Object.entries(byTopic).map(([topic, items]) => (
          <section key={topic}>
            <h2 className="text-lg font-bold">
              {topicLabel[topic as GuideTopic] ?? topic}
            </h2>
            <ul className="mt-3 space-y-2">
              {items.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-card transition-colors hover:bg-muted/40"
                  >
                    <span className="font-semibold text-foreground">
                      {guide.title}
                    </span>
                    {guide.lastVerifiedAt ? (
                      <Badge variant="verified" className="shrink-0">
                        {guide.lastVerifiedAt}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
