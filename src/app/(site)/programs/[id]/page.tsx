import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowSquareOut,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { ShortlistToggle } from "@/components/programs/shortlist-toggle";
import { getSession } from "@/lib/auth/session";
import { isOnShortlist } from "@/lib/db/shortlist";
import { ensureSeeded, getProgram } from "@/lib/db/programs";
import {
  ensureScholarshipsSeeded,
  listScholarships,
} from "@/lib/db/scholarships";
import { isInternationalProgramme, relatedScholarships } from "@/lib/daad/catalog";
import { whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  await ensureSeeded();
  const { id } = await params;
  const program = await getProgram(id);
  if (!program) return { title: "Program" };
  return {
    title: `${program.name} · ${program.university}`,
    description: `${program.degreeLevel} at ${program.university} in ${program.city}.`,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  await ensureSeeded();
  const { id } = await params;
  const program = await getProgram(id);
  if (!program || program.status !== "published") notFound();

  await ensureScholarshipsSeeded();
  const scholarships = relatedScholarships(
    program.degreeLevel,
    program.field,
    await listScholarships({ status: "published" })
  );
  const international = isInternationalProgramme(program.languageOfInstruction);

  const session = await getSession();
  const saved = session
    ? await isOnShortlist(session.userId, program.id)
    : false;

  const profileHint = session
    ? `\nProfile: ${(process.env.BETTER_AUTH_URL || "http://localhost:3000")}/dashboard/profile`
    : "";
  const message = [
    "Hi! I'd like help with this program:",
    `• ${program.name}`,
    `• ${program.university} (${program.city})`,
    `• Source: ${program.sourceUrl}`,
    profileHint,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/programs">
          <ArrowLeft />
          All programs
        </Link>
      </Button>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">
          {program.universityType === "public" ? "Public" : "Private"} university
        </Badge>
        {international ? (
          <Badge variant="verified">International programme</Badge>
        ) : (
          <Badge variant="neutral">German-taught</Badge>
        )}
        <Badge variant="neutral" className="capitalize">
          {program.degreeLevel}
        </Badge>
        <Badge variant="verified">
          {program.lastVerifiedAt
            ? `Verified · ${program.lastVerifiedAt}`
            : "Published"}
        </Badge>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
        {program.name}
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        {program.university} · {program.city}, {program.state}
      </p>
      {scholarships.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-muted p-4">
          <p className="text-sm font-semibold">Scholarships for Germany</p>
          <ul className="mt-2 space-y-1 text-sm">
            {scholarships.map((scholarship) => (
              <li key={scholarship.id}>
                <Link
                  href={`/scholarships/${scholarship.id}`}
                  className="font-semibold text-forest hover:underline"
                >
                  {scholarship.name}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  · {scholarship.daad ? "DAAD" : scholarship.provider}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className="mt-8 grid gap-4 rounded-2xl bg-white p-6 shadow-card sm:grid-cols-2">
        <Item label="Language" value={program.languageOfInstruction} />
        <Item
          label="Application route"
          value={program.applicationRoute.replace("_", "-")}
        />
        <Item
          label="IELTS minimum"
          value={
            program.ieltsMin != null ? String(program.ieltsMin) : "Not listed"
          }
        />
        <Item
          label="TOEFL minimum"
          value={
            program.toeflMin != null ? String(program.toeflMin) : "Not listed"
          }
        />
        <Item
          label="German required"
          value={
            program.germanRequired === "none"
              ? "None"
              : program.germanRequired.toUpperCase()
          }
        />
        <Item
          label="Typical German grade band"
          value={
            program.typicalGermanGradeMax != null
              ? `<= ${program.typicalGermanGradeMax}`
              : "Not listed"
          }
        />
        <Item
          label="Tuition / semester"
          value={`EUR ${program.tuitionPerSemesterEur}`}
        />
        <Item label="Semester fee" value={`EUR ${program.semesterFeeEur}`} />
      </dl>

      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold">Intakes</h2>
        {program.intakes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No intake dates listed yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {program.intakes.map((intake) => (
              <li key={`${intake.semester}-${intake.year}`}>
                <span className="font-semibold capitalize">
                  {intake.semester} {intake.year}
                </span>
                {" · "}
                Non-EU deadline:{" "}
                {intake.deadlineNonEu ?? "rolling / confirm on source"}
                {" · "}
                <Badge
                  variant={
                    intake.status === "confirmed" ? "verified" : "predicted"
                  }
                  className="align-middle"
                >
                  {intake.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold">Document checklist</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {program.requiredDocuments.map((doc) => (
            <li key={doc} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
              <span className="capitalize">{doc.replaceAll("_", " ")}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <ShortlistToggle
          programId={program.id}
          initiallySaved={saved}
          signedIn={Boolean(session)}
        />
        <Button asChild size="lg" variant="outline">
          <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer">
            Official source
            <ArrowSquareOut />
          </a>
        </Button>
        {program.degreeLevel === "master" ||
        program.degreeLevel === "bachelor" ? (
          <Button asChild size="lg" variant="whatsapp">
            <Link
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="text-white" />
              Let&apos;s have a chat!
            </Link>
          </Button>
        ) : null}
      </div>

      {program.notes ? (
        <p className="mt-6 text-sm text-muted-foreground">{program.notes}</p>
      ) : null}
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-semibold capitalize">{value}</dd>
    </div>
  );
}
