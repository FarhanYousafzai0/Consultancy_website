"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScholarshipCardSkeletonList } from "@/components/ui/content-skeletons";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isProfileComplete,
  selectAnswers,
  useEligibilityHydrated,
  useEligibilityStore,
} from "@/lib/eligibility";
import type { ScholarshipOdds } from "@/lib/db/types";
import {
  isDaadProvider,
  scholarshipPurposeOptions,
  subjectGroupOptions,
} from "@/lib/daad/catalog";

type ListItem = {
  id: string;
  name: string;
  provider: string;
  slug: string;
  levels: string[];
  studyCountries: string[];
  amountSummary: string;
  coverage: string;
  fundingType: string;
  lastVerifiedAt: string | null;
  availability: "open" | "closing_soon" | "opening_soon" | "closed" | "unknown";
  deadline: string | null;
  odds: ScholarshipOdds | null;
  reasons: string[];
  cycles: { closeAt: string | null }[];
};

const levelOptions = [
  ["", "All levels"],
  ["bachelor", "Bachelor's"],
  ["master", "Master's"],
  ["phd", "PhD"],
] as [string, string][];

const statusOptions = [
  ["open", "Open now"],
  ["closing_soon", "Closing soon"],
  ["opening_soon", "Opening soon"],
  ["all", "All scholarships"],
  ["closed", "Closed archive"],
] as [string, string][];

const fundingOptions = [
  ["", "Any funding"],
  ["fully_funded", "Fully funded"],
  ["partially_funded", "Partially funded"],
  ["tuition_only", "Tuition only"],
  ["stipend", "Stipend"],
] as [string, string][];

function levelLabel(level: string) {
  if (level === "bachelor") return "Bachelor's";
  if (level === "phd") return "PhD";
  return "Master's";
}

function availabilityLabel(value: ListItem["availability"]) {
  return value === "closing_soon"
    ? "Closing soon"
    : value === "opening_soon"
      ? "Opening soon"
      : value === "closed"
        ? "Closed"
        : value === "unknown"
          ? "Date not confirmed"
          : "Open";
}

function availabilityClass(value: ListItem["availability"]) {
  return value === "open"
    ? "bg-emerald-50 text-emerald-700"
    : value === "closing_soon"
      ? "bg-amber-50 text-amber-700"
      : value === "opening_soon"
        ? "bg-sky-50 text-sky-700"
        : "bg-muted text-muted-foreground";
}

function oddsVariant(
  odds: ScholarshipOdds | null
): "match" | "reach" | "safety" | "predicted" | "neutral" {
  if (odds === "strong") return "match";
  if (odds === "possible") return "predicted";
  if (odds === "long_shot") return "reach";
  if (odds === "unlikely") return "safety";
  return "neutral";
}

export function ScholarshipsBrowser() {
  const hydrated = useEligibilityHydrated();
  const store = useEligibilityStore();
  const answers = selectAnswers(store);
  const hasProfile = hydrated && isProfileComplete(answers);
  const answersJson = JSON.stringify(answers);

  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [field, setField] = useQueryState("field", parseAsString.withDefault(""));
  const [level, setLevel] = useQueryState("level", parseAsString.withDefault(""));
  const [country, setCountry] = useQueryState("country", parseAsString.withDefault(""));
  const [nationality, setNationality] = useQueryState("nationality", parseAsString.withDefault(""));
  const [year, setYear] = useQueryState("year", parseAsString.withDefault(""));
  const [month, setMonth] = useQueryState("month", parseAsString.withDefault(""));
  const [funding, setFunding] = useQueryState("funding", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("open"));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("relevance"));
  const [qualify, setQualify] = useQueryState(
    "qualify",
    parseAsBoolean.withDefault(false)
  );
  const [purpose, setPurpose] = useQueryState(
    "purpose",
    parseAsString.withDefault("")
  );
  const [provider, setProvider] = useQueryState(
    "provider",
    parseAsString.withDefault("")
  );

  const [items, setItems] = useState<ListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (field) params.set("field", field);
      if (level) params.set("level", level);
      if (country) params.set("country", country.toLowerCase());
      if (nationality) params.set("nationality", nationality.toLowerCase());
      if (year) params.set("year", year);
      if (month) params.set("month", month);
      if (funding) params.set("funding", funding);
      if (status) params.set("status", status);
      if (sort) params.set("sort", sort);
      if (purpose) params.set("purpose", purpose);
      if (provider) params.set("provider", provider);
      if (qualify && hasProfile) {
        params.set("qualify", "1");
        params.set("answers", answersJson);
      }
      try {
        const res = await fetch(`/api/scholarships?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) {
          setItems(data.scholarships ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    q,
    field,
    level,
    country,
    nationality,
    year,
    month,
    funding,
    status,
    sort,
    purpose,
    provider,
    qualify,
    hasProfile,
    answersJson,
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Scholarship finder</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
          Find funding for your next degree
        </h1>
        <p className="mt-3 text-muted-foreground">
          Discover active scholarships for Bachelor&apos;s, Master&apos;s, and PhD
          study. Filter by level, subject, and funding purpose.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <div className="relative">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => void setQ(e.target.value)}
            placeholder="Search scholarships, universities, providers, or subjects"
            className="h-14 rounded-2xl bg-white pl-11 text-base shadow-card"
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {statusOptions.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => void setStatus(value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                status === value
                  ? "border-forest bg-forest text-white"
                  : "border-border bg-white text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start gap-6 lg:flex-row">
        <aside className="scrollbar-none w-full space-y-4 rounded-2xl border border-border bg-white p-4 shadow-card lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:w-80 lg:overflow-y-auto">
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Country</span>
            <div className="flex h-11 items-center rounded-2xl border border-border bg-background px-3 text-sm">
              Pakistan
            </div>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Eligible nationality</span>
            <Input
              value={nationality}
              onChange={(e) => void setNationality(e.target.value)}
              placeholder="e.g. Pakistan"
              className="h-11 rounded-2xl"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold">Deadline year</span>
              <Input value={year} onChange={(e) => void setYear(e.target.value)} placeholder="2027" className="h-11 rounded-2xl" inputMode="numeric" />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold">Month</span>
              <Input value={month} onChange={(e) => void setMonth(e.target.value)} placeholder="1–12" className="h-11 rounded-2xl" inputMode="numeric" />
            </label>
          </div>
          <FilterSelect
            label="Study level"
            value={level}
            onChange={(next) => void setLevel(next)}
            options={levelOptions}
          />
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Country of study</span>
            <Input
              value={country}
              onChange={(e) => void setCountry(e.target.value)}
              placeholder="e.g. Germany"
              className="h-11 rounded-2xl"
            />
          </label>
          <FilterSelect
            label="Funding"
            value={funding}
            onChange={(next) => void setFunding(next)}
            options={fundingOptions}
          />
          <FilterSelect
            label="Sort by"
            value={sort}
            onChange={(next) => void setSort(next)}
            options={[
              ["relevance", "Relevance"],
              ["deadline", "Deadline soonest"],
              ["verified", "Recently verified"],
              ["newest", "Newest"],
            ]}
          />
          <FilterSelect
            label="Subject"
            value={field}
            onChange={(next) => void setField(next)}
            options={[
              ["", "Any"],
              ...subjectGroupOptions.map(
                (option) => [option.value, option.label] as [string, string]
              ),
            ]}
          />
          <FilterSelect
            label="Scholarship purpose"
            value={purpose}
            onChange={(next) => void setPurpose(next)}
            options={[
              ["", "Any"],
              ...scholarshipPurposeOptions.map(
                (option) => [option.value, option.label] as [string, string]
              ),
            ]}
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={provider.toLowerCase() === "daad"}
              onChange={(e) => void setProvider(e.target.checked ? "DAAD" : "")}
              className="size-4 rounded border-border"
            />
            DAAD funding programmes only
          </label>
          <Button
            type="button"
            variant={qualify ? "default" : "outline"}
            className="w-full"
            disabled={!hasProfile}
            onClick={() => void setQualify(!qualify)}
          >
            {qualify ? "Only what I qualify for" : "Show all"}
          </Button>
          {!hasProfile ? (
            <p className="text-xs text-muted-foreground">
              <Link href="/check" className="font-semibold text-forest underline">
                Complete eligibility
              </Link>{" "}
              to enable qualify-for-me.
            </p>
          ) : null}
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="text-sm text-muted-foreground">
            {loading && items.length === 0 ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              `${total} ${status === "closed" ? "closed scholarships" : "scholarships"}`
            )}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loading && items.length === 0 ? (
            <ScholarshipCardSkeletonList />
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
              <p className="font-semibold">
                {status === "open"
                  ? "No currently open scholarships found."
                  : "No scholarships match these filters."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try viewing all scholarships or widening your filters. We only mark a
                listing active when its official deadline is confirmed.
              </p>
            </div>
          ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/scholarships/${item.id}`}
                  className="block rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${availabilityClass(item.availability)}`}>
                      {availabilityLabel(item.availability)}
                    </span>
                    {item.odds ? (
                      <Badge variant={oddsVariant(item.odds)}>
                        {item.odds.replace("_", " ")}
                      </Badge>
                    ) : null}
                    {isDaadProvider(item.provider) ? (
                      <Badge variant="verified">DAAD</Badge>
                    ) : (
                      <Badge variant="neutral">Other funder</Badge>
                    )}
                    {item.levels.map((itemLevel) => (
                      <span key={itemLevel} className="text-xs text-muted-foreground">
                        {levelLabel(itemLevel)}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-2 text-lg font-bold">{item.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {item.provider}{item.studyCountries.length ? ` · ${item.studyCountries.join(", ")}` : ""}
                  </p>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <p><span className="font-semibold">Funding:</span> {item.amountSummary || item.coverage}</p>
                    <p><span className="font-semibold">Deadline:</span> {item.deadline ?? "Not confirmed"}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Last verified: {item.lastVerifiedAt ?? "Not yet verified"}
                  </p>
                  {item.odds && item.reasons[0] ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.reasons[0]}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          )}
        </div>
      </div>
    </div>
  );
}
