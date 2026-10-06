"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
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
import type { ScholarshipOdds } from "@/lib/db/types";
import {
  DAAD_SCHOLARSHIPS_URL,
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
      <div className="max-w-2xl">
        <p className="section-label">Scholarships for Germany</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
          Finding scholarships
        </h1>
        <p className="mt-3 text-muted-foreground">
          Filter the way the{" "}
          <a
            href={DAAD_SCHOLARSHIPS_URL}
            className="font-semibold text-forest underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            DAAD scholarship database
          </a>{" "}
          does — country, who it is for, subject, and purpose. We add honest odds
          for students living in Pakistan. Bachelor funding for non-EU students
          is rare.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-card lg:w-72">
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
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Programmes for</span>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background px-3"
              value={level}
              onChange={(e) => void setLevel(e.target.value)}
            >
              <option value="">Any</option>
              {scholarshipAudienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Subject</span>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background px-3"
              value={field}
              onChange={(e) => void setField(e.target.value)}
            >
              <option value="">Any</option>
              {subjectGroupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Scholarship purpose</span>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background px-3"
              value={purpose}
              onChange={(e) => void setPurpose(e.target.value)}
            >
              <option value="">Any</option>
              {scholarshipPurposeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
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
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${total} scholarships`}
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
        </div>
      </div>
    </div>
  );
}
