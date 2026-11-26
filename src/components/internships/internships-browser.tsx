"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { InternshipResultsSkeleton } from "@/components/ui/content-skeletons";
import { InternshipCard } from "./internship-card";
import { fieldLabel, type PublicInternship } from "@/lib/internships/public";

type Facet = { value: string; label: string; count?: number };
type Result = { internships: PublicInternship[]; total: number; page: number; pageSize: number; hasMore: boolean; facets: { countries: Facet[]; regions: Facet[]; fields: Facet[]; workModes: Facet[]; funding: Facet[] } };
const defaults = { q: parseAsString.withDefault(""), country: parseAsString.withDefault(""), region: parseAsString.withDefault(""), field: parseAsString.withDefault(""), workMode: parseAsString.withDefault(""), duration: parseAsString.withDefault(""), funding: parseAsString.withDefault(""), status: parseAsString.withDefault("all"), sort: parseAsString.withDefault("open_first"), page: parseAsInteger.withDefault(1) };

export function InternshipsBrowser() {
  const [filters, setFilters] = useQueryStates(defaults);
  const [result, setResult] = useState<Result | null>(null);
  const [loadedQuery, setLoadedQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== "") params.set(key, String(value)); });
  params.set("pageSize", "12");
  const query = params.toString();
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try { const response = await fetch(`/api/internships?${query}`, { signal: controller.signal }); if (!response.ok) throw new Error("Internships could not be loaded. Please try again."); const data = await response.json() as Result; if (!controller.signal.aborted) { setResult(data); setError(null); setLoadedQuery(query); } }
      catch (failure) { if (!controller.signal.aborted) { setError(failure instanceof Error ? failure.message : "Unable to load internships."); setLoadedQuery(query); } }
    }, 150);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, retry]);
  const update = (key: keyof typeof filters, value: string) => void setFilters({ [key]: value, page: 1 });
  const active = Object.entries(filters).some(([key, value]) => key !== "page" && value !== "" && !(key === "status" && value === "all") && !(key === "sort" && value === "open_first"));
  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 0;
  const loading = loadedQuery !== query;
  return (
    <div className="mx-auto max-w-7xl bg-background px-4 pb-16 pt-12 text-foreground md:px-6 md:pt-16">
      <header className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-forest">Global opportunities</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">Find your next internship</h1><p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">Explore international internships across Europe, Asia, the Middle East, and beyond. Imported listings need independent verification.</p></header>
      <section aria-label="Search and filter internships" className="mt-10 rounded-3xl border border-border bg-white p-4 md:p-6"><div className="relative"><MagnifyingGlass aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search internships" value={filters.q} onChange={(event) => update("q", event.target.value)} placeholder="Search roles, organizations, countries, or fields" className="h-12 rounded-full pl-12" /></div><div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><FilterSelect label="Status" value={filters.status} onChange={(value) => update("status", value)} options={[["open", "Open and closing soon"], ["closing_soon", "Closing soon"], ["unknown", "Status unconfirmed"], ["closed", "Closed"], ["all", "All opportunities"]]} /><FilterSelect label="Region" value={filters.region} onChange={(value) => update("region", value)} options={[["", "All regions"], ...(result?.facets.regions ?? []).map((item) => [item.value, item.label] as [string, string])]}/><FilterSelect label="Country" value={filters.country} onChange={(value) => update("country", value)} options={[["", "All countries"], ...(result?.facets.countries ?? []).map((item) => [item.value, `${item.label} (${item.count})`] as [string, string])]}/><FilterSelect label="Field" value={filters.field} onChange={(value) => update("field", value)} options={[["", "Any field"], ...(result?.facets.fields ?? []).map((item) => [item.value, `${fieldLabel(item.value as never)} (${item.count})`] as [string, string])]}/><FilterSelect label="Work mode" value={filters.workMode} onChange={(value) => update("workMode", value)} options={[["", "Any work mode"], ["remote", "Remote"], ["hybrid", "Hybrid"], ["on_site", "On-site"]]}/><FilterSelect label="Duration" value={filters.duration} onChange={(value) => update("duration", value)} options={[["", "Any duration"], ["weeks", "Weeks"], ["months", "Months"], ["year", "One year"]]}/><FilterSelect label="Funding" value={filters.funding} onChange={(value) => update("funding", value)} options={[["", "Any funding"], ["paid", "Paid"], ["unpaid", "Unpaid"], ["fully_funded", "Fully funded"], ["partially_funded", "Partially funded"], ["unknown", "Not specified"]]}/><div className="flex items-end gap-2"><FilterSelect label="Sort by" value={filters.sort} onChange={(value) => update("sort", value)} options={[["open_first", "Open first"], ["deadline", "Deadline soonest"], ["verified", "Recently verified"], ["newest", "Newest"], ["title", "Title A–Z"]]}/><Button variant="ghost" disabled={!active} onClick={() => void setFilters(null)} className="h-11">Clear</Button></div></div></section>
      <section aria-label="Internship results" aria-busy={loading} className="mt-8"><div className="mb-5 flex items-center justify-between gap-4">{loading && !result ? <Skeleton className="h-4 w-36" /> : <p className="text-sm font-semibold text-muted-foreground">{result ? `${result.total} ${result.total === 1 ? "opportunity" : "opportunities"}` : null}</p>}<p className="hidden text-xs text-muted-foreground sm:block">Imported listings are unverified; check the source before applying.</p></div>{error ? <div role="alert" className="rounded-3xl border border-destructive/30 bg-white p-8 text-center"><p className="font-bold">We couldn&apos;t load internships.</p><p className="mt-2 text-sm text-muted-foreground">{error}</p><Button className="mt-5" onClick={() => setRetry((value) => value + 1)}>Try again</Button></div> : loading && !result ? <InternshipResultsSkeleton /> : !result?.internships.length ? <div className="rounded-3xl border border-border bg-white p-12 text-center"><p className="text-lg font-bold">No internships match those filters.</p><p className="mt-2 text-sm text-muted-foreground">Try widening your search or checking back after the next source refresh.</p></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.internships.map((item) => <InternshipCard key={item.id} item={item} />)}</div>}{totalPages > 1 ? <PaginationControls currentPage={filters.page} totalPages={totalPages} onPageChange={(page) => void setFilters({ page })} label="Internship pages" /> : null}</section>
      <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">Haseeb Consultancy is a discovery platform. Application details, eligibility, and final decisions belong to the organization listed above.</p>
    </div>
  );
}
