"use client";

import { useEffect, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import type { EligibilityAnswers } from "@/lib/eligibility/types";
import type { MatchTier } from "@/lib/db/types";

type MatchCard = {
  id: string;
  name: string;
  university: string;
  universityType: "public" | "private";
  city: string;
  field: string;
  degreeLevel: string;
  ieltsMin: number | null;
  tuitionPerSemesterEur: number;
  semesterFeeEur: number;
  typicalGermanGradeMax: number | null;
  sourceUrl: string;
  lastVerifiedAt: string | null;
  tier: MatchTier;
  reasons: string[];
};

export function MatchesPanel({ answers }: { answers: EligibilityAnswers }) {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
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
    return (
      <section className="mt-4 rounded-2xl border border-dashed border-border bg-muted/60 p-6">
        <p className="section-label">Program matches</p>
        <h2 className="mt-3 text-lg font-bold">University matches do not apply here</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ausbildung uses employer listings, not university programs. That list comes in a later
          build.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <p className="section-label">Program matches</p>
        <p className="mt-3 text-sm text-muted-foreground">Finding programs you can aim for…</p>
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
        Top 3 shown free. Sign-up to see all comes later — matching itself is never paywalled.
      </p>

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
                  <Badge variant="neutral">{match.universityType}</Badge>
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
