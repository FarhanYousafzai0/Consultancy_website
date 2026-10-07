import Link from "next/link";
import { UniversityTypeBadge } from "@/components/programs/university-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AusbildungListings } from "@/components/ausbildung/ausbildung-listings";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  profileToAnswers,
} from "@/lib/db/student-profile";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import {
  ensureScholarshipsSeeded,
  listScholarships,
} from "@/lib/db/scholarships";
import { isInternationalProgramme, relatedScholarships } from "@/lib/daad/catalog";
import { qualifyPrograms } from "@/lib/matching/match";
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
    const field =
      typeof answers.field === "string" && answers.field
        ? `?field=${encodeURIComponent(answers.field)}`
        : "";
    return (
      <div className="space-y-6">
        <div>
          <p className="section-label">Matches</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
            Ausbildung listings
          </h1>
          <p className="mt-1 text-muted-foreground">
            University Reach/Match/Safety does not apply. Browse live offers
            from the Jobsuche.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <AusbildungListings
            compact
            initialField={
              typeof answers.field === "string" ? answers.field : ""
            }
          />
          <Button asChild className="mt-4" variant="outline">
            <Link href={`/ausbildung${field}`}>Open full listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  await ensureSeeded();
  await ensureScholarshipsSeeded();
  const [programs, scholarships] = await Promise.all([
    listPrograms({ status: "published" }),
    listScholarships({ status: "published" }),
  ]);
  const qualified = qualifyPrograms(answers, programs);
  const matches = qualified;
  const totalQualified = qualified.length;
  const publicCount = qualified.filter((m) => m.program.universityType === "public").length;
  const privateCount = qualified.filter((m) => m.program.universityType === "private").length;
  const internationalCount = qualified.filter((m) =>
    isInternationalProgramme(m.program.languageOfInstruction)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Matches</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          {totalQualified} programs you qualify for
        </h1>
        <p className="mt-1 text-muted-foreground">
          Grouped as Reach, Match and Safety. Each university is marked public
          or private, and whether it is an international programme.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="safety">{publicCount} public</Badge>
          <Badge variant="predicted">{privateCount} private</Badge>
          <Badge variant="verified">{internationalCount} international</Badge>
        </div>
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
          {matches.map((m) => {
            const funding = relatedScholarships(
              m.program.degreeLevel,
              m.program.field,
              scholarships,
              2
            );
            return (
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
                  <UniversityTypeBadge type={m.program.universityType} />
                  {isInternationalProgramme(m.program.languageOfInstruction) ? (
                    <Badge variant="verified">International programme</Badge>
                  ) : (
                    <Badge variant="neutral">German-taught</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {m.program.city}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-bold">{m.program.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {m.program.university}
                </p>
                {funding.length > 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Scholarships for Germany:{" "}
                    {funding.map((item) => item.name).join(" · ")}
                  </p>
                ) : null}
                <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                  {m.reasons.slice(0, 2).map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
