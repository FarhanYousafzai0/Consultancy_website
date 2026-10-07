import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgramCardSkeletonList } from "@/components/ui/content-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { ensureSeeded, listPrograms } from "@/lib/db/programs";
import {
  getStudyLanding,
  STUDY_LANDING_SLUGS,
} from "@/lib/seo/study-landings";

type Props = { params: Promise<{ field: string }> };

export function generateStaticParams() {
  return STUDY_LANDING_SLUGS.map((field) => ({ field }));
}

export async function generateMetadata({ params }: Props) {
  const { field } = await params;
  const landing = getStudyLanding(field);
  if (!landing) return { title: "Study in Germany" };
  return {
    title: landing.title,
    description: landing.description,
  };
}

export default async function StudyLandingPage({ params }: Props) {
  const { field: slug } = await params;
  const landing = getStudyLanding(slug);
  if (!landing) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Study in Germany</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          {landing.title}
        </h1>
        <p className="mt-4 text-muted-foreground">{landing.intro}</p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/check">Check eligibility</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/programs?field=${landing.field}`}>
            Open program search
          </Link>
        </Button>
      </div>

      <section className="mt-10">
        <Suspense
          fallback={
            <div aria-busy="true">
              <Skeleton className="h-7 w-56" />
              <div className="mt-4">
                <ProgramCardSkeletonList count={3} />
              </div>
            </div>
          }
        >
          <StudyProgramList field={landing.field} />
        </Suspense>
      </section>
    </div>
  );
}

async function StudyProgramList({ field }: { field: string }) {
  await ensureSeeded();
  const programs = (await listPrograms({ status: "published" })).filter(
    (p) => p.field === field
  );

  return (
    <>
      <h2 className="text-xl font-extrabold">
        {programs.length} published program
        {programs.length === 1 ? "" : "s"}
      </h2>
      {programs.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No published programs in this field yet. Browse all programs or
          check back after our next verification pass.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {programs.map((p) => (
            <li key={p.id}>
              <Link
                href={`/programs/${p.id}`}
                className="block rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{p.degreeLevel}</Badge>
                  <Badge variant="neutral">{p.universityType}</Badge>
                  {p.lastVerifiedAt ? (
                    <Badge variant="verified">
                      Verified · {p.lastVerifiedAt}
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-2 text-lg font-bold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.university} · {p.city}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
