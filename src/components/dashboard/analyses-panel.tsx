"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Report = {
  id: string;
  type: string;
  inputSummary: string;
  result: Record<string, unknown>;
  createdAt: string;
};

export function AnalysesPanel({
  initialCredits = 0,
  freeAnalysisUsed = false,
}: {
  initialCredits?: number;
  freeAnalysisUsed?: boolean;
}) {
  const [credits, setCredits] = useState(initialCredits);
  const [freeUsed, setFreeUsed] = useState(freeAnalysisUsed);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Report | null>(null);

  async function refresh() {
    const res = await fetch("/api/advisor/analysis");
    if (!res.ok) return;
    const data = await res.json();
    setReports(data.reports ?? []);
    setCredits(data.credits ?? 0);
    setFreeUsed(Boolean(data.freeAnalysisUsed));
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function run(type: "profile" | "shortlist") {
    setLoading(type);
    setError(null);
    try {
      const res = await fetch("/api/advisor/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setCredits(data.credits ?? credits);
      setFreeUsed(Boolean(data.freeAnalysisUsed));
      setActive(data.report);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(null);
    }
  }

  async function buyCredits() {
    const res = await fetch("/api/advisor/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack: "standard" }),
    });
    const data = await res.json();
    if (res.ok && data.whatsappUrl) {
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      setError(data.error || "Could not start credit purchase.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">AI analyses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Structured reports grounded in your profile and verified program
              data. First profile analysis is free.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Credits: <strong>{credits}</strong>
              {!freeUsed ? " · 1 free profile analysis available" : ""}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void buyCredits()}>
            Buy credits (WhatsApp)
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={Boolean(loading)}
            onClick={() => void run("profile")}
          >
            {loading === "profile" ? "Analyzing…" : "Profile analysis"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={Boolean(loading)}
            onClick={() => void run("shortlist")}
          >
            {loading === "shortlist" ? "Building…" : "Shortlist report"}
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      {active ? (
        <ReportCard report={active} />
      ) : null}

      {reports.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-bold">Past reports</h3>
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-white px-4 py-3 text-left text-sm shadow-card hover:bg-muted/40"
                  onClick={() => setActive(r)}
                >
                  <span className="font-semibold capitalize">{r.type}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {new Date(r.createdAt).toLocaleString()}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.inputSummary}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const r = report.result;
  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow-card">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {report.type} report
        </p>
        <h3 className="text-base font-extrabold">
          {String(r.summary ?? report.inputSummary)}
        </h3>
      </div>
      {typeof r.strengthSummary === "string" ? (
        <Block title="Strengths" body={r.strengthSummary} />
      ) : null}
      {Array.isArray(r.gaps) ? (
        <List title="Gaps" items={r.gaps as string[]} />
      ) : null}
      {Array.isArray(r.nextSteps) ? (
        <List title="Next steps" items={r.nextSteps as string[]} />
      ) : null}
      {r.reachMatchSafety && typeof r.reachMatchSafety === "object" ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {(["reach", "match", "safety"] as const).map((k) => (
            <div key={k} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">
                {k}
              </p>
              <p className="mt-1">
                {String((r.reachMatchSafety as Record<string, string>)[k] ?? "—")}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {Array.isArray(r.ranked) ? (
        <ul className="space-y-2">
          {(r.ranked as Array<Record<string, unknown>>).map((item, i) => (
            <li key={i} className="rounded-xl bg-muted/40 px-3 py-2 text-sm">
              <p className="font-semibold">
                {String(item.name)} · {String(item.university)}
              </p>
              <p className="text-xs text-muted-foreground">
                Tier {String(item.tier)}
                {item.deadlineNote ? ` · ${String(item.deadlineNote)}` : ""}
              </p>
              {Array.isArray(item.reasons) ? (
                <ul className="mt-1 list-disc pl-4 text-xs">
                  {(item.reasons as string[]).map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {typeof r.clarity === "string" ? (
        <Block title="Clarity" body={r.clarity} />
      ) : null}
      {typeof r.germanyFit === "string" ? (
        <Block title="Germany fit" body={r.germanyFit} />
      ) : null}
      {Array.isArray(r.missingFacts) ? (
        <List title="Missing facts" items={r.missingFacts as string[]} />
      ) : null}
      {Array.isArray(r.rewriteSuggestions) ? (
        <List
          title="Rewrite suggestions"
          items={r.rewriteSuggestions as string[]}
        />
      ) : null}
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h4 className="font-bold">{title}</h4>
      <p className="mt-1 text-sm text-foreground/85">{body}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="font-bold">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
