"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ausbildungFieldOptions } from "@/lib/eligibility/labels";
import type { AusbildungListing } from "@/lib/ausbildung/jobsuche";

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
          <label className="block min-w-[10rem] flex-1 text-sm">
            <span className="mb-1 block font-semibold">Field</span>
            <select
              className="w-full rounded-full border border-input bg-background px-3 py-2"
              value={field}
              onChange={(e) => setField(e.target.value)}
            >
              <option value="">All fields</option>
              {ausbildungFieldOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
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
        <p className="text-sm text-muted-foreground">Loading listings…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {data && !loading ? (
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
            <ul className="space-y-3">
              {data.listings.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl bg-white p-4 shadow-card"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.employer} · {item.city}
                    {item.publishedAt ? ` · ${item.publishedAt}` : null}
                  </p>
                  <button
                    type="button"
                    onClick={() => onApplyClick(item.url)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
                  >
                    View on Jobsuche
                    <ArrowSquareOut className="size-3.5" />
                  </button>
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
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => void load(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  loading ||
                  !data.listings.length ||
                  page * data.size >= data.total
                }
                onClick={() => void load(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
