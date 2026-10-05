import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  profileToAnswers,
} from "@/lib/db/student-profile";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import { matchPrograms } from "@/lib/matching/match";
import { isProfileComplete } from "@/lib/eligibility";

export const metadata = { title: "Matches" };

export default async function DashboardMatchesPage() {
  const session = await getSession();
  if (!session) return null;

  const profile = await getStudentProfile(session.userId);
  const answers = profileToAnswers(profile);

  if (!isProfileComplete(answers)) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="section-label">Matches</p>
        <h1 className="mt-3 text-2xl font-extrabold">Complete your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We need your eligibility answers to rank programs into Reach, Match and
          Safety.
        </p>
        <Button asChild className="mt-4">
          <Link href="/check">Eligibility check</Link>
        </Button>
      </div>
    );
  }

  if (answers.goal === "ausbildung") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="section-label">Matches</p>
        <h1 className="mt-3 text-2xl font-extrabold">Ausbildung listings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          University Reach/Match/Safety does not apply. Live Ausbildung listings
          come in a later build.
        </p>
      </div>
    );
  }

  await ensureSeeded();
  const programs = await listPrograms({ status: "published" });
  const { matches, totalQualified } = matchPrograms(answers, programs);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Matches</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          {totalQualified} programs you qualify for
        </h1>
        <p className="mt-1 text-muted-foreground">
          Grouped as Reach, Match and Safety from your saved profile.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            No published matches yet. Browse all programs or update your field.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/programs">Browse programs</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {matches.map((m) => (
            <li key={m.program.id}>
              <Link
                href={`/programs/${m.program.id}`}
                className="block rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      m.tier === "match"
                        ? "match"
                        : m.tier === "reach"
                          ? "reach"
                          : "safety"
                    }
                  >
                    {m.tier}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {m.program.universityType} · {m.program.city}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-bold">{m.program.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {m.program.university}
                </p>
                <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                  {m.reasons.slice(0, 2).map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
