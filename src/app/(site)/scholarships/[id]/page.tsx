import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScholarshipSaveToggle } from "@/components/scholarships/scholarship-save-toggle";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { getSession } from "@/lib/auth/session";
import { isScholarshipSaved } from "@/lib/db/saved-scholarships";
import {
  ensureScholarshipsSeeded,
  getScholarship,
} from "@/lib/db/scholarships";
import { whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  await ensureScholarshipsSeeded();
  const { id } = await params;
  const s = await getScholarship(id);
  if (!s) return { title: "Scholarship" };
  return {
    title: `${s.name} · ${s.provider}`,
    description: s.amountSummary,
  };
}

export default async function ScholarshipDetailPage({ params }: Props) {
  await ensureScholarshipsSeeded();
  const { id } = await params;
  const scholarship = await getScholarship(id);
  if (!scholarship || scholarship.status !== "published") notFound();

  const session = await getSession();
  const saved = session
    ? await isScholarshipSaved(session.userId, scholarship.id)
    : false;

  const message = [
    "Hi! I'd like help with this scholarship:",
    `• ${scholarship.name}`,
    `• ${scholarship.provider}`,
    `• Source: ${scholarship.sourceUrl}`,
  ].join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/scholarships">
          <ArrowLeft />
          All scholarships
        </Link>
      </Button>

      <div className="flex flex-wrap gap-2">
        {scholarship.levels.map((l) => (
          <Badge key={l} variant="neutral" className="capitalize">
            {l}
          </Badge>
        ))}
        <Badge variant="verified">
          {scholarship.lastVerifiedAt
            ? `Verified · ${scholarship.lastVerifiedAt}`
            : "Published"}
        </Badge>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
        {scholarship.name}
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        {scholarship.provider}
      </p>

      {scholarship.bachelorFundingRareNote ? (
        <p className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm text-amber-ink">
          Bachelor funding for non-EU students is rare. Read eligibility carefully.
        </p>
      ) : null}

      <dl className="mt-8 grid gap-4 rounded-2xl bg-white p-6 shadow-card sm:grid-cols-2">
        <Item label="Amount" value={scholarship.amountSummary} />
        <Item label="Coverage" value={scholarship.coverage} />
        <Item
          label="Fields"
          value={scholarship.fields.map((f) => f.replaceAll("_", " ")).join(", ")}
        />
        <Item
          label="Nationalities"
          value={scholarship.nationalities.join(", ")}
        />
        <Item
          label="Min German grade"
          value={
            scholarship.minGermanGrade != null
              ? `≤ ${scholarship.minGermanGrade}`
              : "Not listed"
          }
        />
        <Item
          label="Work experience"
          value={
            scholarship.workExperienceYears > 0
              ? `${scholarship.workExperienceYears}+ years`
              : "Not required"
          }
        />
        <Item
          label="Must be enrolled"
          value={scholarship.mustBeEnrolled ? "Yes" : "No"}
        />
        <Item
          label="Age limit"
          value={
            scholarship.ageLimit != null
              ? String(scholarship.ageLimit)
              : "Not listed"
          }
        />
      </dl>

      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold">Application cycles</h2>
        {scholarship.cycles.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No cycle dates listed yet — check the official source.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {scholarship.cycles.map((cycle, i) => (
              <li key={i}>
                Open: {cycle.openAt ?? "—"} · Close: {cycle.closeAt ?? "—"} ·{" "}
                <Badge
                  variant={
                    cycle.status === "confirmed" ? "verified" : "predicted"
                  }
                  className="align-middle"
                >
                  {cycle.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {scholarship.notes ? (
        <p className="mt-4 text-sm text-muted-foreground">{scholarship.notes}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <ScholarshipSaveToggle
          scholarshipId={scholarship.id}
          initiallySaved={saved}
          signedIn={Boolean(session)}
        />
        <Button asChild size="lg" variant="outline">
          <a
            href={scholarship.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Official source
            <ArrowSquareOut />
          </a>
        </Button>
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
      </div>
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
