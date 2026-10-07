"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, CaretRight } from "@phosphor-icons/react";
import {
  AFTER_ADMISSION_STEPS,
  partnersForStep,
  type AfterAdmissionStepId,
} from "@/lib/after-admission/steps";
import { PARTNER_DISCLOSURE } from "@/data/partner-offers";

export function AfterAdmissionChecklist({
  initialCompleted,
  compact = false,
}: {
  initialCompleted: string[];
  /** Home summary: fewer partner details, link to full page */
  compact?: boolean;
}) {
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(initialCompleted)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doneCount = useMemo(
    () =>
      AFTER_ADMISSION_STEPS.filter((s) => completed.has(s.id)).length,
    [completed]
  );

  async function persist(next: Set<string>, previous: Set<string>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          afterAdmissionCompleted: [...next],
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Could not save progress.");
      }
      const data = (await res.json()) as {
        profile?: { afterAdmissionCompleted?: string[] };
      };
      setCompleted(
        new Set(data.profile?.afterAdmissionCompleted ?? [...next])
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save progress.");
      setCompleted(previous);
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: AfterAdmissionStepId) {
    const previous = new Set(completed);
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
    void persist(next, previous);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label">Next steps to Germany</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Track APS, funds, insurance, visa, housing, and Anmeldung. Guides
            stay free — we never book appointments for you.
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums">
          {doneCount}/{AFTER_ADMISSION_STEPS.length}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {AFTER_ADMISSION_STEPS.map((step) => {
          const checked = completed.has(step.id);
          const partners = partnersForStep(step);
          return (
            <li
              key={step.id}
              className="rounded-xl border border-border/70 bg-muted/30 px-3 py-3"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`after-admission-${step.id}`}
                  checked={checked}
                  disabled={busy}
                  onChange={() => toggle(step.id)}
                  className="mt-1 size-4 accent-[var(--forest)]"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`after-admission-${step.id}`}
                    className="cursor-pointer font-semibold"
                  >
                    {step.label}
                  </label>
                  <p className="mt-1">
                    <Link
                      href={`/guides/${step.guideSlug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-forest hover:underline"
                    >
                      Read guide
                      <CaretRight className="size-3.5" />
                    </Link>
                  </p>

                  {!compact && partners.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Partner offers
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {partners.map((p) => (
                          <li key={p.id}>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold shadow-card hover:bg-muted"
                            >
                              {p.name}
                              <ArrowSquareOut className="size-3.5" />
                            </a>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] leading-snug text-muted-foreground">
                        {PARTNER_DISCLOSURE}
                      </p>
                    </div>
                  ) : null}

                  {compact && partners.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Partner options available on the full checklist
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {compact ? (
        <Link
          href="/dashboard/next-steps"
          className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
        >
          Open full checklist
          <CaretRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
