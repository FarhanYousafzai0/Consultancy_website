"use client";

import Link from "next/link";
import { ArrowSquareOut, ArrowUpRight, CalendarBlank, GraduationCap, MagnifyingGlass, GlobeHemisphereWest } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subjectGroupOptions } from "@/lib/daad/catalog";

type Scholarship = {
  id: string;
  name: string;
  provider: string;
  levels: string[];
  studyCountries: string[];
  amountSummary: string;
  coverage: string;
  availability: "open" | "closing_soon" | "opening_soon" | "closed" | "unknown";
  deadline: string | null;
  lastVerifiedAt: string | null;
  applicationUrl?: string;
  sourceUrl: string;
  sourceDomain?: string;
};

type CountryFacet = { value: string; label: string; count: number };

const statuses = {
  open: ["Open now", "bg-secondary text-forest"],
  closing_soon: ["Closing soon", "bg-amber-soft text-amber-ink"],
  opening_soon: ["Opening soon", "bg-slate-soft text-slate-ink"],
  closed: ["Closed", "bg-muted text-muted-foreground"],
  unknown: ["Date unconfirmed", "bg-muted text-muted-foreground"],
} as const;

function levelLabel(level: string) {
  return level === "bachelor" ? "Bachelor's" : level === "phd" ? "PhD" : "Master's";
}

function countryLabel(country: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country.toUpperCase()) ?? country;
  } catch {
    return country;
  }
}

function ShowcaseCard({ scholarship }: { scholarship: Scholarship }) {
  const [label, color] = statuses[scholarship.availability];
  const officialUrl = scholarship.applicationUrl || scholarship.sourceUrl;
  const applyLabel = scholarship.availability === "open" || scholarship.availability === "closing_soon"
    ? "Apply on official site"
    : "Visit official site";
  return (
    <article className="flex h-full min-w-0 flex-col rounded-3xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span aria-hidden className="grid size-11 place-items-center rounded-2xl bg-muted text-forest">
          <GraduationCap className="size-6" />
        </span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${color}`}>{label}</span>
      </div>
      <p className="mt-5 text-xs font-semibold text-muted-foreground">{scholarship.provider}</p>
      <h2 className="mt-2 text-xl font-bold leading-snug">
        <Link href={`/scholarships/${scholarship.id}`} className="rounded-sm hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
          {scholarship.name}
        </Link>
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {scholarship.levels.map((level) => <span key={level} className="rounded-full border border-border px-3 py-1 text-xs font-medium">{levelLabel(level)}</span>)}
      </div>
      <div className="mt-5 space-y-3 text-sm">
        {scholarship.studyCountries.length > 0 && <p className="flex items-start gap-2 text-muted-foreground"><GlobeHemisphereWest aria-hidden className="mt-0.5 size-4 shrink-0" />{scholarship.studyCountries.map(countryLabel).join(", ")}</p>}
        <p className="leading-relaxed">{scholarship.amountSummary || scholarship.coverage || "See official funding details."}</p>
        <p className="flex items-start gap-2 text-muted-foreground"><CalendarBlank aria-hidden className="mt-0.5 size-4 shrink-0" />Deadline: {scholarship.deadline ?? "Not confirmed"}</p>
      </div>
      <div className="mt-auto pt-6">
        <p className="mb-4 text-xs text-muted-foreground">
          Last verified: {scholarship.lastVerifiedAt ?? "Not yet verified"}
          {scholarship.sourceDomain && <> · Source: {scholarship.sourceDomain.replace(/^www\d*\./, "")}</>}
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${applyLabel} for ${scholarship.name} (opens in a new tab)`}
            className="flex items-center justify-between rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
          >
            {applyLabel}<ArrowSquareOut aria-hidden className="size-4" />
          </a>
          <Link href={`/scholarships/${scholarship.id}`} aria-label={`View details for ${scholarship.name}`} className="flex items-center justify-between rounded-full bg-muted px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
            View details<ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

const defaults = {
  q: parseAsString.withDefault(""),
  level: parseAsString.withDefault(""),
  status: parseAsString.withDefault("active"),
  funding: parseAsString.withDefault(""),
  field: parseAsString.withDefault(""),
  year: parseAsString.withDefault(""),
  country: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("open_first"),
  page: parseAsInteger.withDefault(1),
};

export function ScholarshipShowcase() {
  const [filters, setFilters] = useQueryStates(defaults);
  const [result, setResult] = useState<{
    scholarships: Scholarship[];
    total: number;
    hasMore: boolean;
    meta?: { total: number; page: number; pageSize: number; hasMore: boolean };
    facets?: { countries: CountryFacet[] };
  } | null>(null);
  const [loadedQuery, setLoadedQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== "") params.set(key, String(value)); });
  params.set("pageSize", "12");
  const query = params.toString();
  const loading = loadedQuery !== query;

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/scholarships?${query}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Scholarships could not be loaded. Please try again.");
        const data = await response.json();
        if (!controller.signal.aborted) { setResult(data); setError(null); setLoadedQuery(query); }
      } catch (failure) {
        if (!controller.signal.aborted) { setError(failure instanceof Error ? failure.message : "Unable to load scholarships."); setLoadedQuery(query); }
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, retry]);

  function update(key: keyof typeof filters, value: string) {
    void setFilters({ [key]: value, page: 1 });
  }
  const active = filters.q || filters.level || filters.funding || filters.field || filters.year || filters.country || filters.status !== "active";

  return (
    <div className="mx-auto max-w-7xl bg-background px-4 pb-16 pt-12 text-foreground md:px-6 md:pt-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Find your scholarship</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">Explore funding for Bachelor&apos;s, Master&apos;s, and PhD study. Find an opportunity that fits your next step.</p>
      </header>

      <section aria-label="Search and filter scholarships" className="mt-10 rounded-3xl border border-border bg-white p-4 md:p-6">
        <div className="relative">
          <MagnifyingGlass aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search scholarships" value={filters.q} onChange={(event) => update("q", event.target.value)} placeholder="Search scholarships, providers, or subjects" className="h-12 rounded-full pl-12" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Study level" value={filters.level} onChange={(value) => update("level", value)} options={[["", "All levels"], ["bachelor", "Bachelor's"], ["master", "Master's"], ["phd", "PhD"]]} />
          <FilterSelect label="Status" value={filters.status} onChange={(value) => update("status", value)} options={[["active", "All active"], ...Object.entries(statuses).map(([value, [label]]) => [value, label] as [string, string]), ["all", "Everything, incl. closed"]]} />
          <FilterSelect label="Funding" value={filters.funding} onChange={(value) => update("funding", value)} options={[["", "Any funding"], ["fully_funded", "Fully funded"], ["partially_funded", "Partially funded"], ["tuition_only", "Tuition only"], ["stipend", "Stipend"]]} />
          <FilterSelect label="Subject" value={filters.field} onChange={(value) => update("field", value)} options={[["", "Any subject"], ...subjectGroupOptions.map((option) => [option.value, option.label] as [string, string])]} />
          <FilterSelect label="Country of study" value={filters.country} onChange={(value) => update("country", value)} options={[['', 'All countries'], ...(result?.facets?.countries ?? []).map((country) => [country.value, `${country.label} (${country.count})`] as [string, string])]} />
          <label className="space-y-1.5 text-sm font-semibold">Deadline year<Input value={filters.year} onChange={(event) => update("year", event.target.value)} placeholder="Any year" inputMode="numeric" maxLength={4} className="h-11 rounded-xl font-normal" /></label>
          <FilterSelect label="Sort by" value={filters.sort} onChange={(value) => update("sort", value)} options={[["open_first", "Open first"], ["newest", "Newest"], ["deadline", "Deadline soonest"], ["verified", "Recently verified"], ["relevance", "Name A–Z"]]} />
          <div className="flex items-end"><Button variant="ghost" disabled={!active} onClick={() => void setFilters(null)} className="h-11">Clear filters</Button></div>
        </div>
      </section>

      <section aria-label="Scholarship results" aria-busy={loading} className="mt-7">
        <p role="status" className="mb-5 text-sm text-muted-foreground">{loading ? "Loading scholarships…" : error ? "Unable to load results" : `${result?.total ?? 0} scholarships`}</p>
        {error && !loading ? <div role="alert" className="rounded-3xl border border-border p-8 text-center"><p>{error}</p><Button className="mt-4" onClick={() => { setLoadedQuery(""); setRetry((value) => value + 1); }}>Try again</Button></div>
          : loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((key) => <div key={key} aria-hidden className="h-80 rounded-3xl border border-border bg-muted/40 motion-safe:animate-pulse" />)}</div>
          : result?.scholarships.length ? <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.scholarships.map((scholarship) => <li key={scholarship.id} className="min-w-0"><ShowcaseCard scholarship={scholarship} /></li>)}</ul>
          : <div className="rounded-3xl border border-dashed border-border px-6 py-14 text-center"><p className="font-semibold">No scholarships found</p><p className="mt-2 text-sm text-muted-foreground">Try another search or clear your filters to see the full collection.</p></div>}
        {!loading && !error && (filters.page > 1 || result?.hasMore) && <nav aria-label="Scholarship pages" className="mt-8 flex items-center justify-center gap-4"><Button variant="outline" disabled={filters.page <= 1} onClick={() => void setFilters({ page: filters.page - 1 })}>Previous</Button><span className="text-sm">Page {filters.page}</span><Button variant="outline" disabled={!result?.hasMore} onClick={() => void setFilters({ page: filters.page + 1 })}>Next</Button></nav>}
      </section>
    </div>
  );
}
