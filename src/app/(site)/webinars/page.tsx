import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/components/ui/coming-soon";
import { webinars } from "@/data/webinars";
import { safeHttpsUrl } from "@/lib/site";

export const metadata = {
  title: "Webinars",
  description:
    "Free Parwaaz webinars for Pakistani students on Germany Master's and Ausbildung — register via WhatsApp when dates are set.",
};

export default function WebinarsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Webinars</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          Live sessions with consultants
        </h1>
        <p className="mt-4 text-muted-foreground">
          Short, practical topics — no paid booking portal. Dates are announced
          here and in the community group.
        </p>
      </div>

      <ul className="mt-10 space-y-4">
        {webinars.map((w) => (
          <li key={w.id} className="rounded-2xl bg-white p-6 shadow-card">
            <p className="text-lg font-extrabold">{w.title}</p>
            <p className="mt-1 text-sm font-semibold text-forest">
              {w.dateLabel}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {w.blurb}
            </p>
            {safeHttpsUrl(w.registerUrl) ? (
              <div className="mt-4">
                <Button asChild size="sm" variant="outline">
                  <a href={safeHttpsUrl(w.registerUrl)!} target="_blank" rel="noopener noreferrer">
                    Register
                  </a>
                </Button>
              </div>
            ) : (
              <ComingSoon
                className="mt-4 p-4 text-left"
                title="Registration coming soon"
                description="The session date and registration link will appear here once they are confirmed."
              />
            )}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/community">Join community</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/check">Start eligibility check</Link>
        </Button>
      </div>
    </div>
  );
}
