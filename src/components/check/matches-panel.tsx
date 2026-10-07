"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { UniversityTypeBadge } from "@/components/programs/university-type-badge";
import { MatchCardSkeletonList } from "@/components/ui/content-skeletons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import type { MatchTier } from "@/lib/db/types";

type RelatedScholarship = {
  id: string;
  name: string;
  provider: string;
  daad: boolean;
};

type MatchCard = {
  id: string;
  name: string;
  university: string;
  universityType: "public" | "private";
  city: string;
  field: string;
  degreeLevel: string;
  languageOfInstruction?: string;
  internationalProgramme?: boolean;
  ieltsMin: number | null;
  tuitionPerSemesterEur: number;
  semesterFeeEur: number;
  typicalGermanGradeMax: number | null;
  sourceUrl: string;
  lastVerifiedAt: string | null;
  tier: MatchTier;
  reasons: string[];
  scholarships?: RelatedScholarship[];
};

export function MatchesPanel({ answers }: { answers: EligibilityAnswers }) {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [publicCount, setPublicCount] = useState(0);
  const [privateCount, setPrivateCount] = useState(0);
  const [internationalCount, setInternationalCount] = useState(0);
  const [scholarships, setScholarships] = useState<RelatedScholarship[]>([]);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Could not load matches");
        }
        if (!cancelled) {
          setMatches(data.matches ?? []);
          setTotal(data.totalQualified ?? 0);
          setPublicCount(data.publicCount ?? 0);
          setPrivateCount(data.privateCount ?? 0);
          setInternationalCount(data.internationalCount ?? 0);
          setScholarships(data.scholarships ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load matches");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // Re-run when the saved profile identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.completedAt, answers.goal, answers.field, answers.qualification]);

  if (answers.goal === "ausbildung") {
    const field =
      typeof answers.field === "string" ? answers.field : "";
    const href = field
      ? `/ausbildung?field=${encodeURIComponent(field)}`
      : "/ausbildung";
    return (
      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <p className="section-label">Ausbildung listings</p>
        <h2 className="mt-3 text-lg font-bold">
          University matches do not apply here
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse live employer offers from the German Jobsuche — self-serve on
          Parwaaz.
        </p>
        <a
          href={href}
          className="mt-4 inline-block text-sm font-semibold text-forest hover:underline"
        >
          Open Ausbildung listings →
        </a>
      </section>
    );
  }

  if (loading && matches.length === 0) {
    return (
      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card" aria-busy="true">
        <p className="section-label">Program matches</p>
        <Skeleton className="mt-3 h-6 w-64 max-w-full" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <MatchCardSkeletonList count={3} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <p className="section-label">Program matches</p>
        <p className="mt-3 text-sm text-destructive">{error}</p>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="mt-4 rounded-2xl border border-dashed border-border bg-muted/60 p-6">
        <p className="section-label">Program matches</p>
        <h2 className="mt-3 text-lg font-bold">No published matches yet for this path</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That can mean your education path needs another step first, or we have not published
          enough programs in this field yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
      <p className="section-label">Program matches</p>
      <h2 className="mt-3 text-lg font-bold">
        {total === 1 ? "1 program you can aim for" : `${total} programs you can aim for`}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Top 3 shown free. Each one is marked public or private, and whether it is
        an international programme.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="safety">{publicCount} public</Badge>
        <Badge variant="predicted">{privateCount} private</Badge>
        <Badge variant="verified">{internationalCount} international</Badge>
        <Badge variant="match">{scholarships.length} scholarships</Badge>
      </div>
      {scholarships.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-muted/60 p-4">
          <p className="text-sm font-semibold">Scholarships for Germany</p>
          <ul className="mt-2 space-y-1.5 text-sm">
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

      <ul className="mt-6 space-y-4">
        {matches.map((match) => (
          <li
            key={match.id}
            className="rounded-2xl bg-muted/50 p-4 md:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      match.tier === "match"
                        ? "match"
                        : match.tier === "reach"
                          ? "reach"
                          : "safety"
                    }
                  >
                    {match.tier}
                  </Badge>
                  <UniversityTypeBadge type={match.universityType} withUniversity />
                  {match.internationalProgramme ? (
                    <Badge variant="verified">International programme</Badge>
                  ) : (
                    <Badge variant="neutral">German-taught</Badge>
                  )}
                </div>
                <h3 className="mt-2 text-base font-bold md:text-lg">{match.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {match.university} · {match.city}
                </p>
              </div>
              <a
                href={match.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-forest"
              >
                Source <ArrowSquareOut className="size-4" />
              </a>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {match.reasons.slice(0, 3).map((reason) => (
                <li key={reason}>· {reason}</li>
              ))}
            </ul>
            {match.scholarships && match.scholarships.length > 0 ? (
              <p className="mt-3 text-sm">
                <span className="font-semibold">Scholarships for Germany: </span>
                {match.scholarships.map((scholarship, index) => (
                  <span key={scholarship.id}>
                    {index > 0 ? ", " : ""}
                    <Link
                      href={`/scholarships/${scholarship.id}`}
                      className="font-semibold text-forest hover:underline"
                    >
                      {scholarship.daad ? "DAAD · " : ""}
                      {scholarship.name}
                    </Link>
                  </span>
                ))}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No published scholarship in this field yet.
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Tuition €{match.tuitionPerSemesterEur}/sem · fee €{match.semesterFeeEur}
              {match.ieltsMin != null ? ` · IELTS ≥ ${match.ieltsMin}` : ""}
              {match.lastVerifiedAt ? ` · checked ${match.lastVerifiedAt}` : " · seed / draft data"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
