"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
} from "nuqs";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isProfileComplete,
  selectAnswers,
  useEligibilityHydrated,
  useEligibilityStore,
} from "@/lib/eligibility";

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
  ieltsMin: number | null;
  germanRequired: string;
  tuitionPerSemesterEur: number;
  semesterFeeEur: number;
  lastVerifiedAt: string | null;
  sourceUrl: string;
  tier: "reach" | "match" | "safety" | null;
};

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

  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [total, setTotal] = useState(0);
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
      answers.completedAt,
    ]
  );

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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8">
      <p className="section-label">Programs</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
        Find programs you can actually aim for
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Published, source-linked programs. Filters stay in the URL so you can share
        a search.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
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
            onChange={setDegree}
            options={[
              ["", "Any"],
              ["master", "Master's"],
              ["bachelor", "Bachelor's"],
            ]}
          />
          <FilterSelect
            label="Field"
            value={field}
            onChange={setField}
            options={[
              ["", "Any"],
              ["computer_science", "Computer Science"],
              ["engineering", "Engineering"],
              ["data", "Data / AI"],
              ["business", "Business"],
              ["natural_sciences", "Natural Sciences"],
              ["health", "Health"],
              ["social_sciences", "Social Sciences"],
              ["arts", "Arts"],
              ["other", "Other"],
            ]}
          />
          <FilterSelect
            label="University type"
            value={universityType}
            onChange={setUniversityType}
            options={[
              ["", "Any"],
              ["public", "Public"],
              ["private", "Private"],
            ]}
          />
          <FilterSelect
            label="Language"
            value={language}
            onChange={setLanguage}
            options={[
              ["", "Any"],
              ["english", "English"],
              ["german", "German"],
              ["both", "Both"],
            ]}
          />
          <FilterSelect
            label="IELTS at most"
            value={ieltsMax}
            onChange={setIeltsMax}
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
            onChange={setGermanRequired}
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
            onChange={setTuition}
            options={[
              ["", "Any"],
              ["free", "€0 tuition"],
              ["under_1500", "Under €1,500"],
            ]}
          />

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

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${total} program${total === 1 ? "" : "s"}`}
            </p>
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

          <ul className="space-y-3">
            {programs.map((program) => (
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
                    <Badge variant="neutral">{program.universityType}</Badge>
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
                    {program.ieltsMin != null ? ` · IELTS ≥ ${program.ieltsMin}` : ""}
                    {` · tuition €${program.tuitionPerSemesterEur}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  options: [string, string][];
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm font-medium"
      >
        {options.map(([v, text]) => (
          <option key={v || "any"} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
