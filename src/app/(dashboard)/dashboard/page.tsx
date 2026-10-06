import Link from "next/link";
import {
  evaluateEligibility,
  isProfileComplete,
  labelForEnglish,
  labelForField,
  labelForGerman,
  labelForGoal,
} from "@/lib/eligibility";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  profileToAnswers,
} from "@/lib/db/student-profile";
import {
  listShortlist,
  resolveDeadline,
} from "@/lib/db/shortlist";
import { applicationStatusLabel } from "@/lib/applications/progress";
import { listSavedScholarships } from "@/lib/db/saved-scholarships";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import { matchPrograms } from "@/lib/matching/match";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { AfterAdmissionChecklist } from "@/components/dashboard/after-admission-checklist";
import { whatsappLink } from "@/lib/site";

export const metadata = { title: "Dashboard" };

export default async function DashboardHomePage() {
  const session = await getSession();
  if (!session) return null;

  const profile = await getStudentProfile(session.userId);
  const answers = profileToAnswers(profile);
  const complete = isProfileComplete(answers);
  const result = complete ? evaluateEligibility(answers) : null;

  const shortlist = await listShortlist(session.userId);
  const savedScholarships = await listSavedScholarships(session.userId);
  let matchCount = 0;
  let topMatches: {
    id: string;
    name: string;
    university: string;
    tier: string;
  }[] = [];

  if (complete && answers.goal !== "ausbildung") {
    await ensureSeeded();
    const programs = await listPrograms({ status: "published" });
    const matched = matchPrograms(answers, programs);
    matchCount = matched.totalQualified;
    topMatches = matched.matches.slice(0, 3).map((m) => ({
      id: m.program.id,
      name: m.program.name,
      university: m.program.university,
      tier: m.tier,
    }));
  }

  const profileUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard/profile`;
  const waMessage = result
    ? `Hi! I'm ${session.name}. ${result.headline} Profile: ${profileUrl}`
    : `Hi! I'm ${session.name}. I'd like help applying to Germany. Profile: ${profileUrl}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Dashboard</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          Hello, {session.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your eligibility, matches and applications in one place.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <p className="section-label">Eligibility</p>
        {complete && result ? (
          <>
            <h2 className="mt-3 text-xl font-bold">{result.headline}</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {result.nextSteps.slice(0, 3).map((step) => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {answers.goal ? (
                <div>
                  <dt className="text-muted-foreground">Goal</dt>
                  <dd className="font-semibold">{labelForGoal(answers.goal)}</dd>
                </div>
              ) : null}
              {answers.goal && answers.field ? (
                <div>
                  <dt className="text-muted-foreground">Field</dt>
                  <dd className="font-semibold">
                    {labelForField(answers.goal, answers.field)}
                  </dd>
                </div>
              ) : null}
              {answers.englishTest ? (
                <div>
                  <dt className="text-muted-foreground">English</dt>
                  <dd className="font-semibold">
                    {labelForEnglish(answers.englishTest, answers.englishScore)}
                  </dd>
                </div>
              ) : null}
              {answers.germanLevel ? (
                <div>
                  <dt className="text-muted-foreground">German</dt>
                  <dd className="font-semibold">
                    {labelForGerman(answers.germanLevel)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-xl font-bold">Finish your profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete the eligibility check so we can show honest matches.
            </p>
            <Button asChild className="mt-4">
              <Link href="/check">Start eligibility check</Link>
            </Button>
          </>
        )}
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/profile">Edit profile</Link>
        </Button>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="section-label">Matches</p>
            {matchCount > 0 ? (
              <Badge variant="neutral">{matchCount} qualify</Badge>
            ) : null}
          </div>
          {topMatches.length ? (
            <ul className="mt-4 space-y-3">
              {topMatches.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/programs/${m.id}`}
                    className="block rounded-xl bg-muted/50 px-3 py-2.5 hover:bg-muted"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {m.tier}
                    </span>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.university}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {complete
                ? "No university matches yet — try another field or check Ausbildung guides."
                : "Complete your profile to unlock matches."}
            </p>
          )}
          <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
            <Link href="/dashboard/matches">View all matches →</Link>
          </Button>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-card">
          <p className="section-label">Applications</p>
          {shortlist.length ? (
            <ul className="mt-4 space-y-3">
              {shortlist.slice(0, 4).map((item) => {
                const deadline = resolveDeadline(item);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/programs/${item.programId}`}
                      className="block rounded-xl bg-muted/50 px-3 py-2.5 hover:bg-muted"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">
                          {item.program?.name ?? "Program"}
                        </p>
                        <Badge variant="neutral">
                          {applicationStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.program?.university}
                        {deadline ? ` · deadline ${deadline}` : null}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Save programs while browsing to start tracking applications.
            </p>
          )}
          <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
            <Link href="/dashboard/shortlist">Manage applications →</Link>
          </Button>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <AfterAdmissionChecklist
          compact
          initialCompleted={profile?.afterAdmissionCompleted ?? []}
        />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <p className="section-label">Saved scholarships</p>
        {savedScholarships.length ? (
          <ul className="mt-4 space-y-3">
            {savedScholarships.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/scholarships/${item.scholarshipId}`}
                  className="block rounded-xl bg-muted/50 px-3 py-2.5 hover:bg-muted"
                >
                  <p className="font-semibold">
                    {item.scholarship?.name ?? "Scholarship"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.scholarship?.provider}
                    {item.scholarship?.cycles?.[0]?.closeAt
                      ? ` · deadline ${item.scholarship.cycles[0].closeAt}`
                      : null}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Save scholarships while browsing to track deadlines here.
          </p>
        )}
        <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
          <Link href="/dashboard/scholarships">
            {savedScholarships.length
              ? "Manage saved scholarships →"
              : "Browse scholarships →"}
          </Link>
        </Button>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-ink p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">Need a human?</h2>
          <p className="mt-1 text-sm text-white/70">
            Share your profile with a consultant on WhatsApp.
          </p>
        </div>
        <Button asChild size="lg" variant="whatsapp">
          <a
            href={whatsappLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="text-white" />
            Let&apos;s have a chat!
          </a>
        </Button>
      </section>
    </div>
  );
}
