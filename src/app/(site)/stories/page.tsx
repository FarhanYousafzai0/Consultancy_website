import Link from "next/link";
import { Button } from "@/components/ui/button";
import { successStories } from "@/data/success-stories";

export const metadata = {
  title: "Student stories",
  description:
    "Short stories from Pakistani students planning study or Ausbildung in Germany — curated by Parwaz, not a public forum.",
};

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <p className="section-label">Stories</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
        Students who used Parwaz
      </h1>
      <p className="mt-4 text-muted-foreground">
        Short, founder-curated notes — not admission guarantees. Names are
        initials only.
      </p>

      <ul className="mt-10 space-y-4">
        {successStories.map((story) => (
          <li key={story.id} className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-extrabold">{story.initials}</p>
              {story.field ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {story.field}
                </p>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-semibold text-forest">
              {story.path}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {story.body}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/check">Start your check</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/programs">Browse programs</Link>
        </Button>
      </div>
    </div>
  );
}
