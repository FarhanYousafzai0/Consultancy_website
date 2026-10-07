"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
} from "nuqs";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { UniversityTypeBadge } from "@/components/programs/university-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramCardSkeletonList } from "@/components/ui/content-skeletons";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isProfileComplete,
  selectAnswers,
  useEligibilityHydrated,
  useEligibilityStore,
} from "@/lib/eligibility";
import {
  DAAD_PROGRAMMES_URL,
  courseTypeLabel,
  isSupportedCourseType,
  subjectGroupOptions,
} from "@/lib/daad/catalog";

type ProgramListItem = {
  id: string;
  name: string;
  university: string;
  universityType: string;
  degreeLevel: string;
  field: string;
  city: string;
  state: string;
  languageOfInstruction: string;
  internationalProgramme?: boolean;
  ieltsMin: number | null;
  germanRequired: string;
  tuitionPerSemesterEur: number;
  semesterFeeEur: number;
  lastVerifiedAt: string | null;
  sourceUrl: string;
  tier: "reach" | "match" | "safety" | null;
};

const PAGE_SIZE = 24;

export function ProgramsBrowser() {
  const hydrated = useEligibilityHydrated();
  const store = useEligibilityStore();
  const answers = selectAnswers(store);
  const hasProfile = hydrated && isProfileComplete(answers);

  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [degree, setDegree] = useQueryState(
    "degree",
    parseAsString.withDefault("")
  );
  const [field, setField] = useQueryState("field", parseAsString.withDefault(""));
  const [universityType, setUniversityType] = useQueryState(
    "universityType",
    parseAsString.withDefault("")
  );
  const [language, setLanguage] = useQueryState(
    "language",
    parseAsString.withDefault("")
  );
  const [ieltsMax, setIeltsMax] = useQueryState(
    "ieltsMax",
    parseAsString.withDefault("")
  );
  const [germanRequired, setGermanRequired] = useQueryState(
    "germanRequired",
    parseAsString.withDefault("")
  );
  const [tuition, setTuition] = useQueryState(
    "tuition",
    parseAsString.withDefault("")
  );
  const [openDeadline, setOpenDeadline] = useQueryState(
    "openDeadline",
    parseAsBoolean.withDefault(false)
  );
  const [qualify, setQualify] = useQueryState(
    "qualify",
    parseAsBoolean.withDefault(false)
  );
  const [international, setInternational] = useQueryState(
    "international",
    parseAsBoolean.withDefault(false)
  );
  const [courseType, setCourseType] = useQueryState(
    "courseType",
    parseAsString.withDefault("")
  );

  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        q,
        degree,
        field,
        universityType,
        language,
        ieltsMax,
        germanRequired,
        tuition,
        openDeadline,
        qualify,
        international,
        courseType,
        completedAt: answers.completedAt,
      }),
    [
      q,
      degree,
      field,
      universityType,
      language,
      ieltsMax,
      germanRequired,
      tuition,
      openDeadline,
      qualify,
      international,
      courseType,
      answers.completedAt,
    ]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [queryKey]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (degree) params.set("degree", degree);
      if (field) params.set("field", field);
      if (universityType) params.set("universityType", universityType);
      if (language) params.set("language", language);
      if (ieltsMax) params.set("ieltsMax", ieltsMax);
      if (germanRequired) params.set("germanRequired", germanRequired);
      if (tuition) params.set("tuition", tuition);
      if (openDeadline) params.set("openDeadline", "1");
      if (international) params.set("international", "1");
      if (qualify && hasProfile) {
        params.set("qualify", "1");
        params.set("profile", JSON.stringify(answers));
      }

      try {
        const res = await fetch(`/api/programs?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load programs");
        if (!cancelled) {
          setPrograms(data.programs ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load programs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, hasProfile]);

  const visiblePrograms = programs.slice(0, visibleCount);
  const hasMore = visibleCount < programs.length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">International programmes</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
          International programmes in Germany
        </h1>
        <p className="mt-2 text-muted-foreground">
          Programmes Parwaaz has checked against university pages — English-taught,
          bilingual, and German-taught, at public and private universities. Filter
          by degree, subject, language, and tuition. For every other course, use the{" "}
          <a
            href={DAAD_PROGRAMMES_URL}
            className="font-semibold text-forest underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            DAAD International Programmes database
          </a>
          .
        </p>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="scrollbar-none space-y-4 rounded-2xl border border-border bg-white p-4 shadow-card lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <label className="block space-y-1.5 text-sm font-semibold">
            Search
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value || null)}
                placeholder="University or program"
                className="h-11 rounded-xl pl-9"
              />
            </div>
          </label>

          <FilterSelect
            label="Degree"
            value={degree}
            onChange={(next) => void setDegree(next || null)}
            options={[
              ["", "Any"],
              ["master", "Master's"],
              ["bachelor", "Bachelor's"],
            ]}
          />
          <FilterSelect
            label="Subject group"
            value={field}
            onChange={(next) => void setField(next || null)}
            options={[
              ["", "Any"],
              ...subjectGroupOptions.map(
                (option) => [option.value, option.label] as [string, string]
              ),
            ]}
          />
          <FilterSelect
            label="University type"
            value={universityType}
            onChange={(next) => void setUniversityType(next || null)}
            options={[
              ["", "Any"],
              ["public", "Public"],
              ["private", "Private"],
            ]}
          />
          <FilterSelect
            label="Course language"
            value={language}
            onChange={(next) => void setLanguage(next || null)}
            options={[
              ["", "Any"],
              ["english", "English only"],
              ["german", "German only"],
              ["both", "German & English"],
            ]}
          />
          <FilterSelect
            label="IELTS at most"
            value={ieltsMax}
            onChange={(next) => void setIeltsMax(next || null)}
            options={[
              ["", "Any"],
              ["6", "6.0"],
              ["6.5", "6.5"],
              ["7", "7.0"],
            ]}
          />
          <FilterSelect
            label="German required"
            value={germanRequired}
            onChange={(next) => void setGermanRequired(next || null)}
            options={[
              ["", "Any"],
              ["none", "None"],
              ["a1", "A1"],
              ["a2", "A2"],
              ["b1", "B1"],
              ["b2", "B2"],
              ["c1", "C1"],
            ]}
          />
          <FilterSelect
            label="Tuition"
            value={tuition}
            onChange={(next) => void setTuition(next || null)}
            options={[
              ["", "Any"],
              ["free", "€0 tuition"],
              ["under_1500", "Under €1,500"],
            ]}
          />

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={international}
              onChange={(e) => setInternational(e.target.checked)}
              className="size-4 rounded border-border"
            />
            International programmes only
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={openDeadline}
              onChange={(e) => setOpenDeadline(e.target.checked)}
              className="size-4 rounded border-border"
            />
            Deadline still open
          </label>

          <div className="rounded-xl bg-muted p-3">
            <label className="flex items-start gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={qualify}
                disabled={!hasProfile}
                onChange={(e) => setQualify(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border"
              />
              <span>
                Only what I qualify for
                {!hasProfile ? (
                  <span className="mt-1 block font-normal text-muted-foreground">
                    Run the{" "}
                    <Link href="/check" className="text-forest underline">
                      eligibility check
                    </Link>{" "}
                    first.
                  </span>
                ) : null}
              </span>
            </label>
          </div>
        </aside>

        <section aria-busy={loading && programs.length === 0}>
          {courseType && !isSupportedCourseType(courseType) ? (
            <div className="mb-4 rounded-2xl bg-amber-soft p-4 text-sm text-amber-ink">
              <p className="font-semibold">
                {courseTypeLabel(courseType) ?? "This course type"} is not in our
                catalogue yet.
              </p>
              <p className="mt-1">
                DAAD lists PhD schools, language courses, prep courses, and joint
                degrees. We currently verify Bachelor&apos;s and Master&apos;s
                programmes for Pakistani applicants.{" "}
                <a
                  href={DAAD_PROGRAMMES_URL}
                  className="font-semibold underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the DAAD database
                </a>
                .
              </p>
            </div>
          ) : null}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {loading && programs.length === 0 ? (
                <Skeleton className="h-5 w-24" />
              ) : total === 0 ? (
                "0 programs"
              ) : (
                `Showing ${Math.min(visibleCount, total)} of ${total} program${total === 1 ? "" : "s"}`
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                void setQ(null);
                void setDegree(null);
                void setField(null);
                void setUniversityType(null);
                void setLanguage(null);
                void setIeltsMax(null);
                void setGermanRequired(null);
                void setTuition(null);
                void setOpenDeadline(null);
                void setQualify(null);
                void setInternational(null);
                void setCourseType(null);
              }}
            >
              Clear filters
            </Button>
          </div>

          {error ? (
            <p className="rounded-2xl bg-error-soft p-4 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {loading && programs.length === 0 ? (
            <ProgramCardSkeletonList />
          ) : (
            <>
              <ul className="space-y-3">
                {visiblePrograms.map((program) => (
                  <li key={program.id}>
                    <Link
                      href={`/programs/${program.id}`}
                      className="block rounded-2xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover md:p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {program.tier ? (
                          <Badge
                            variant={
                              program.tier === "match"
                                ? "match"
                                : program.tier === "reach"
                                  ? "reach"
                                  : "safety"
                            }
                          >
                            {program.tier}
                          </Badge>
                        ) : null}
                        <UniversityTypeBadge type={program.universityType} />
                        {program.internationalProgramme ||
                        program.languageOfInstruction === "english" ||
                        program.languageOfInstruction === "both" ? (
                          <Badge variant="verified">International programme</Badge>
                        ) : (
                          <Badge variant="neutral">German-taught</Badge>
                        )}
                        <Badge variant="verified">
                          {program.lastVerifiedAt
                            ? `Verified · ${program.lastVerifiedAt}`
                            : "Published"}
                        </Badge>
                      </div>
                      <h2 className="mt-3 text-lg font-bold">{program.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {program.university} · {program.city}, {program.state}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {program.degreeLevel} · {program.languageOfInstruction}
                        {program.ieltsMin != null
                          ? ` · IELTS ≥ ${program.ieltsMin}`
                          : ""}
                        {` · tuition €${program.tuitionPerSemesterEur}`}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              {hasMore ? (
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + PAGE_SIZE, programs.length)
                      )
                    }
                  >
                    Load more programmes
                  </Button>
                </div>
              ) : null}
            </>
          )}

          {!loading && programs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No programs match these filters yet.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

