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
  scholarshipAudienceOptions,
  scholarshipPurposeOptions,
  subjectGroupOptions,
} from "@/lib/daad/catalog";

type ListItem = {
  id: string;
  name: string;
  provider: string;
  slug: string;
  levels: string[];
  amountSummary: string;
  coverage: string;
  lastVerifiedAt: string | null;
  bachelorFundingRareNote: boolean;
  odds: ScholarshipOdds | null;
  reasons: string[];
  cycles: { closeAt: string | null }[];
};

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

  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [level, setLevel] = useQueryState("level", parseAsString.withDefault(""));
  const [field, setField] = useQueryState("field", parseAsString.withDefault(""));
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
  const [bachelorWarning, setBachelorWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (level) params.set("level", level);
      if (field) params.set("field", field);
      if (purpose) params.set("purpose", purpose);
      if (provider) params.set("provider", provider);
      if (qualify && hasProfile) {
        params.set("qualify", "1");
        params.set("answers", JSON.stringify(answers));
      }
      try {
        const res = await fetch(`/api/scholarships?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) {
          setItems(data.scholarships ?? []);
          setTotal(data.total ?? 0);
          setBachelorWarning(Boolean(data.bachelorFundingWarning));
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
    level,
    field,
    purpose,
    provider,
    qualify,
    hasProfile,
    answers.completedAt,
    answers.goal,
    answers.field,
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Scholarships for Germany</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
          Fully funded scholarships for Germany
        </h1>
        <p className="mt-3 text-muted-foreground">
          Funding for students living in Pakistan. Filter by who it is for,
          subject, and purpose. Bachelor funding for non-EU students is rare.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-start gap-6 lg:flex-row">
        <aside className="scrollbar-none w-full space-y-4 rounded-2xl border border-border bg-white p-4 shadow-card lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:w-80 lg:overflow-y-auto">
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => void setQ(e.target.value)}
              placeholder="Search name or provider"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Country</span>
            <div className="flex h-11 items-center rounded-2xl border border-border bg-background px-3 text-sm">
              Pakistan
            </div>
          </label>
          <FilterSelect
            label="Programmes for"
            value={level}
            onChange={(next) => void setLevel(next)}
            options={[
              ["", "Any"],
              ...scholarshipAudienceOptions.map(
                (option) => [option.value, option.label] as [string, string]
              ),
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
          {bachelorWarning ? (
            <div className="rounded-2xl bg-amber-soft px-4 py-3 text-sm text-amber-ink">
              Bachelor funding for non-EU students is rare. Most strong options
              are for Master&apos;s / PhD — plan finances accordingly.
            </div>
          ) : null}
          <div className="text-sm text-muted-foreground">
            {loading && items.length === 0 ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              `${total} scholarships`
            )}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loading && items.length === 0 ? (
            <ScholarshipCardSkeletonList />
          ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/scholarships/${item.id}`}
                  className="block rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="flex flex-wrap items-center gap-2">
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
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.levels.join(" · ")}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold">{item.name}</h2>
                  <p className="text-sm text-muted-foreground">{item.provider}</p>
                  <p className="mt-2 text-sm">{item.amountSummary}</p>
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
