"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUSES,
  applicationStatusLabel,
  buildTimeline,
  docProgress,
  intakeKey,
  resolveDeadline,
  type ApplicationStatus,
  type TargetIntake,
} from "@/lib/applications/progress";
import type { ProgramIntake } from "@/lib/db/types";

export type ApplicationCardItem = {
  id: string;
  programId: string;
  name: string;
  university: string;
  city: string;
  status: ApplicationStatus;
  completedDocuments: string[];
  targetIntake: TargetIntake | null;
  documents: string[];
  intakes: ProgramIntake[];
  deadline: string | null;
};

function daysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return "today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

function statusBadgeVariant(
  status: ApplicationStatus
): "verified" | "predicted" | "neutral" {
  if (status === "offer" || status === "submitted" || status === "ready_to_apply") {
    return "verified";
  }
  if (status === "rejected" || status === "withdrawn") return "neutral";
  return "predicted";
}

export function ShortlistManager({
  initialItems,
}: {
  initialItems: ApplicationCardItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timeline = useMemo(
    () =>
      buildTimeline(
        items.map((item) => ({
          id: item.id,
          programId: item.programId,
          status: item.status,
          completedDocuments: item.completedDocuments,
          targetIntake: item.targetIntake,
          createdAt: "",
          updatedAt: "",
          program: {
            id: item.programId,
            name: item.name,
            university: item.university,
            city: item.city,
            intakes: item.intakes,
            requiredDocuments: item.documents,
          } as never,
        }))
      ),
    [items]
  );

  async function patch(
    programId: string,
    body: Record<string, unknown>,
    apply: (prev: ApplicationCardItem) => ApplicationCardItem
  ) {
    setError(null);
    setBusyKey(programId);
    const previous = items;
    setItems((list) =>
      list.map((item) => (item.programId === programId ? apply(item) : item))
    );
    try {
      const res = await fetch("/api/me/shortlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      const next = data.item as {
        status: ApplicationStatus;
        completedDocuments: string[];
        targetIntake: TargetIntake | null;
        program: {
          requiredDocuments?: string[];
          intakes?: ProgramIntake[];
          name?: string;
          university?: string;
          city?: string;
        } | null;
      };
      setItems((list) =>
        list.map((item) => {
          if (item.programId !== programId) return item;
          const documents =
            next.program?.requiredDocuments ?? item.documents;
          const intakes = next.program?.intakes ?? item.intakes;
          const updated: ApplicationCardItem = {
            ...item,
            status: next.status,
            completedDocuments: next.completedDocuments,
            targetIntake: next.targetIntake,
            documents,
            intakes,
            name: next.program?.name ?? item.name,
            university: next.program?.university ?? item.university,
            city: next.program?.city ?? item.city,
            deadline: resolveDeadline({
              targetIntake: next.targetIntake,
              program: {
                intakes,
                requiredDocuments: documents,
              } as never,
            }),
          };
          return updated;
        })
      );
      router.refresh();
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyKey(null);
    }
  }

  async function remove(programId: string) {
    setBusyKey(`remove:${programId}`);
    setError(null);
    const res = await fetch(
      `/api/me/shortlist?programId=${encodeURIComponent(programId)}`,
      { method: "DELETE" }
    );
    setBusyKey(null);
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.programId !== programId));
      router.refresh();
    } else {
      setError("Could not remove program.");
    }
  }

  function toggleDoc(item: ApplicationCardItem, doc: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...item.completedDocuments, doc]))
      : item.completedDocuments.filter((d) => d !== doc);
    void patch(item.programId, { completedDocuments: next }, (prev) => ({
      ...prev,
      completedDocuments: next,
    }));
  }

  return (
    <div className="space-y-6">
      {timeline.length > 0 ? (
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <p className="section-label">Timeline</p>
          <h2 className="mt-1 text-lg font-extrabold">Upcoming deadlines</h2>
          <ul className="mt-4 divide-y divide-border">
            {timeline.map((row) => (
              <li
                key={`${row.programId}-${row.deadline}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <Link
                    href={`/programs/${row.programId}`}
                    className="font-semibold hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {row.university}
                    {row.university ? " · " : ""}
                    {row.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusBadgeVariant(row.status)}>
                    {applicationStatusLabel(row.status)}
                  </Badge>
                  <span
                    className={
                      row.daysLeft < 0
                        ? "text-sm font-semibold text-red-600"
                        : row.daysLeft <= 14
                          ? "text-sm font-semibold text-amber-ink"
                          : "text-sm text-muted-foreground"
                    }
                  >
                    {daysLeftLabel(row.daysLeft)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ul className="space-y-3">
        {items.map((item) => {
          const progress = docProgress({
            completedDocuments: item.completedDocuments,
            program: {
              requiredDocuments: item.documents,
            } as never,
          });
          const busy = busyKey === item.programId;
          const intakeValue = item.targetIntake
            ? intakeKey(item.targetIntake)
            : "";

          return (
            <li key={item.id} className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/programs/${item.programId}`}
                    className="text-lg font-bold hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {item.university}
                    {item.city ? ` · ${item.city}` : ""}
                  </p>
                  {item.deadline ? (
                    <p className="mt-1 text-sm font-medium text-amber-ink">
                      Deadline: {item.deadline}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      No non-EU deadline recorded yet
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busyKey === `remove:${item.programId}`}
                  onClick={() => void remove(item.programId)}
                >
                  Remove
                </Button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </span>
                  <select
                    className="w-full rounded-full border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    value={item.status}
                    disabled={busy}
                    onChange={(e) => {
                      const status = e.target.value as ApplicationStatus;
                      void patch(item.programId, { status }, (prev) => ({
                        ...prev,
                        status,
                      }));
                    }}
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {applicationStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Target intake
                  </span>
                  <select
                    className="w-full rounded-full border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    value={intakeValue}
                    disabled={busy || item.intakes.length === 0}
                    onChange={(e) => {
                      const value = e.target.value;
                      const targetIntake = value
                        ? (() => {
                            const [semester, yearStr] = value.split(":");
                            return {
                              semester: semester as "winter" | "summer",
                              year: Number(yearStr),
                            };
                          })()
                        : null;
                      void patch(
                        item.programId,
                        { targetIntake },
                        (prev) => ({
                          ...prev,
                          targetIntake,
                          deadline: resolveDeadline({
                            targetIntake,
                            program: {
                              intakes: prev.intakes,
                            } as never,
                          }),
                        })
                      );
                    }}
                  >
                    <option value="">Earliest deadline</option>
                    {item.intakes.map((intake) => (
                      <option key={intakeKey(intake)} value={intakeKey(intake)}>
                        {intake.semester} {intake.year}
                        {intake.deadlineNonEu
                          ? ` · ${intake.deadlineNonEu}`
                          : ""}
                        {intake.status === "predicted" ? " (predicted)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {item.documents.length ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Document checklist
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {progress.done} of {progress.total} docs
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {item.documents.map((doc) => {
                      const checked = item.completedDocuments.includes(doc);
                      return (
                        <li key={doc}>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-input accent-forest"
                              checked={checked}
                              disabled={busy}
                              onChange={(e) =>
                                toggleDoc(item, doc, e.target.checked)
                              }
                            />
                            <span
                              className={
                                checked
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }
                            >
                              {doc.replaceAll("_", " ")}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No document checklist recorded for this program yet.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
