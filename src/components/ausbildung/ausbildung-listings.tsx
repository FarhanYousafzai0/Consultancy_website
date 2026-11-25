"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, Briefcase, CalendarBlank, MapPin, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AusbildungCardSkeletonList } from "@/components/ui/content-skeletons";
import { FilterSelect } from "@/components/ui/filter-select";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ausbildungFieldOptions } from "@/lib/eligibility/labels";
import type { AusbildungListing } from "@/lib/ausbildung/jobsuche";
import { translateAusbildungTitle } from "@/lib/ausbildung/title";

type SearchResponse = {
  listings: AusbildungListing[];
  page: number;
  size: number;
  total: number;
  error?: string;
};

export function AusbildungListings({
  initialField = "",
  initialWhere = "",
  compact = false,
}: {
  initialField?: string;
  initialWhere?: string;
  compact?: boolean;
}) {
  const [field, setField] = useState(initialField);
  const [where, setWhere] = useState(initialWhere);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (field) params.set("field", field);
      if (where.trim()) params.set("where", where.trim());
      params.set("page", String(pageNum));
      params.set("size", compact ? "5" : "20");
      try {
        const res = await fetch(`/api/ausbildung/search?${params}`);
        const json = (await res.json()) as SearchResponse;
        if (!res.ok) {
          throw new Error(json.error || "Could not load listings.");
        }
        setData(json);
        setPage(pageNum);
        void fetch("/api/ausbildung/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "ausbildung_listing_view" }),
        }).catch(() => {});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load listings.");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [compact, field, q, where]
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  function onApplyClick(url: string) {
    void fetch("/api/ausbildung/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "ausbildung_apply_click" }),
    }).catch(() => {});
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      {!compact ? (
        <form
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void load(1);
          }}
        >
          <div className="min-w-[10rem] flex-1">
            <FilterSelect
              label="Field"
              value={field}
              onChange={setField}
              options={[
                ["", "All fields"],
                ...ausbildungFieldOptions.map(
                  (o) => [o.value, o.label] as [string, string]
                ),
              ]}
            />
          </div>
          <label className="block min-w-[10rem] flex-1 text-sm">
            <span className="mb-1 block font-semibold">City / region</span>
            <input
              className="w-full rounded-full border border-input bg-background px-3 py-2"
              placeholder="e.g. Berlin"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
            />
          </label>
          <label className="block min-w-[10rem] flex-[1.2] text-sm">
            <span className="mb-1 block font-semibold">Keywords</span>
            <input
              className="w-full rounded-full border border-input bg-background px-3 py-2"
              placeholder="Override search term"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <Button type="submit" className="shrink-0">
            <MagnifyingGlass className="size-4" />
            Search
          </Button>
        </form>
      ) : null}

      {loading ? (
        <div aria-busy="true">
          <Skeleton className="mb-3 h-5 w-36" />
          <AusbildungCardSkeletonList count={compact ? 3 : 6} />
        </div>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && data ? (
        <>
          <p className="text-sm text-muted-foreground">
            {data.total.toLocaleString()} offers found
            {compact ? " · top results" : ""}
          </p>
          {data.listings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No live offers matched. Try another field or city, or open the full
              Jobsuche site.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.listings.map((item) => (
                <li
                  key={item.id}
                  className="flex min-h-[300px] min-w-0 flex-col rounded-3xl border border-border bg-white p-5 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-forest">
                      <Briefcase aria-hidden className="size-3.5" />
                      Vocational training
                    </span>
                    <span className="grid size-9 place-items-center rounded-xl bg-muted text-forest">
                      <Briefcase aria-hidden className="size-4" />
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold leading-snug tracking-[-0.02em]">
                    {translateAusbildungTitle(item.title)}
                  </h3>
                  <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <Briefcase aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
                      <span>{item.employer}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
                      <span>{item.city}</span>
                    </p>
                    {item.publishedAt ? (
                      <p className="flex items-start gap-2">
                        <CalendarBlank aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
                        <span>Published {item.publishedAt}</span>
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    onClick={() => onApplyClick(item.url)}
                    className="mt-auto w-full justify-between"
                  >
                    View official listing
                    <ArrowSquareOut aria-hidden className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {compact ? (
            <Link
              href={`/ausbildung${field ? `?field=${encodeURIComponent(field)}` : ""}`}
              className="inline-block text-sm font-semibold text-forest hover:underline"
            >
              Browse all Ausbildung listings →
            </Link>
          ) : (
            <PaginationControls
              currentPage={page}
              totalPages={Math.ceil(data.total / data.size)}
              onPageChange={(nextPage) => void load(nextPage)}
              label="Ausbildung pages"
            />
          )}
        </>
      ) : null}
    </div>
  );
}
