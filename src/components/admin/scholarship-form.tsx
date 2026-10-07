"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScholarshipInput, ScholarshipRecord } from "@/lib/db/types";

const ALL_FIELDS = [
  "computer_science",
  "engineering",
  "data",
  "business",
  "economics",
  "natural_sciences",
  "health",
  "social_sciences",
  "arts",
  "other",
] as const;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const emptyForm = (): ScholarshipInput => ({
  name: "",
  provider: "",
  slug: "",
  levels: ["master"],
  nationalities: ["any"],
  fields: ["computer_science", "engineering", "data", "other"],
  minGermanGrade: 2.5,
  workExperienceYears: 0,
  maxYearsSinceDegree: null,
  ageLimit: null,
  mustBeEnrolled: false,
  amountSummary: "",
  coverage: "",
  cycles: [
    {
      openAt: "",
      closeAt: "",
      status: "predicted",
    },
  ],
  nextCycleStatus: "predicted",
  sourceUrl: "https://",
  lastVerifiedAt: new Date().toISOString().slice(0, 10),
  status: "draft",
  notes: "",
  bachelorFundingRareNote: false,
});

export function ScholarshipForm({ initial }: { initial?: ScholarshipRecord }) {
  const router = useRouter();
  const starting = useMemo(() => {
    if (!initial) return emptyForm();
    const {
      id: _id,
      createdAt: _c,
      updatedAt: _u,
      ...rest
    } = initial;
    void _id;
    void _c;
    void _u;
    return {
      ...rest,
      cycles: rest.cycles.map((c) => ({
        openAt: c.openAt ?? "",
        closeAt: c.closeAt ?? "",
        status: c.status,
      })),
    };
  }, [initial]);

  const [form, setForm] = useState(starting);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function patch<K extends keyof ScholarshipInput>(
    key: K,
    value: ScholarshipInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleLevel(level: "bachelor" | "master" | "phd") {
    setForm((prev) => {
      const has = prev.levels.includes(level);
      const levels = has
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level];
      return { ...prev, levels: levels.length ? levels : prev.levels };
    });
  }

  function toggleField(field: (typeof ALL_FIELDS)[number]) {
    setForm((prev) => {
      const has = prev.fields.includes(field);
      const fields = has
        ? prev.fields.filter((f) => f !== field)
        : [...prev.fields, field];
      return { ...prev, fields: fields.length ? fields : prev.fields };
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload: ScholarshipInput = {
      ...form,
      slug: form.slug || slugify(form.name),
      minGermanGrade:
        form.minGermanGrade == null || Number.isNaN(Number(form.minGermanGrade))
          ? null
          : Number(form.minGermanGrade),
      workExperienceYears: Number(form.workExperienceYears) || 0,
      maxYearsSinceDegree:
        form.maxYearsSinceDegree == null ||
        form.maxYearsSinceDegree === ("" as never)
          ? null
          : Number(form.maxYearsSinceDegree),
      ageLimit:
        form.ageLimit == null || form.ageLimit === ("" as never)
          ? null
          : Number(form.ageLimit),
      cycles: form.cycles.map((c) => ({
        openAt: c.openAt || null,
        closeAt: c.closeAt || null,
        status: c.status,
      })),
      lastVerifiedAt: form.lastVerifiedAt || null,
    };

    const url = initial
      ? `/api/admin/scholarships/${initial.id}`
      : "/api/admin/scholarships";
    const res = await fetch(url, {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not save");
      return;
    }
    router.push("/admin/scholarships");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-card">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <Input
            value={form.name}
            onChange={(e) => {
              patch("name", e.target.value);
              if (!initial) patch("slug", slugify(e.target.value));
            }}
            className="h-11 rounded-2xl"
            required
          />
        </Field>
        <Field label="Provider">
          <Input
            value={form.provider}
            onChange={(e) => patch("provider", e.target.value)}
            className="h-11 rounded-2xl"
            required
          />
        </Field>
        <Field label="Slug">
          <Input
            value={form.slug}
            onChange={(e) => patch("slug", e.target.value)}
            className="h-11 rounded-2xl font-mono text-sm"
            required
          />
        </Field>
        <Field label="Source URL">
          <Input
            value={form.sourceUrl}
            onChange={(e) => patch("sourceUrl", e.target.value)}
            className="h-11 rounded-2xl"
            required
          />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Levels</p>
        <div className="flex flex-wrap gap-2">
          {(["bachelor", "master", "phd"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => toggleLevel(level)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${
                form.levels.includes(level)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Fields</p>
        <div className="flex flex-wrap gap-2">
          {ALL_FIELDS.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => toggleField(field)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                form.fields.includes(field)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {field.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Min German grade (nullable)">
          <Input
            type="number"
            step="0.1"
            value={form.minGermanGrade ?? ""}
            onChange={(e) =>
              patch(
                "minGermanGrade",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="h-11 rounded-2xl"
          />
        </Field>
        <Field label="Work experience years">
          <Input
            type="number"
            value={form.workExperienceYears}
            onChange={(e) =>
              patch("workExperienceYears", Number(e.target.value) || 0)
            }
            className="h-11 rounded-2xl"
          />
        </Field>
        <Field label="Age limit (nullable)">
          <Input
            type="number"
            value={form.ageLimit ?? ""}
            onChange={(e) =>
              patch(
                "ageLimit",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="h-11 rounded-2xl"
          />
        </Field>
      </div>

      <Field label="Amount summary">
        <Input
          value={form.amountSummary}
          onChange={(e) => patch("amountSummary", e.target.value)}
          className="h-11 rounded-2xl"
          required
        />
      </Field>
      <Field label="Coverage">
        <Input
          value={form.coverage}
          onChange={(e) => patch("coverage", e.target.value)}
          className="h-11 rounded-2xl"
          required
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Cycle open">
          <Input
            type="date"
            value={form.cycles[0]?.openAt ?? ""}
            onChange={(e) =>
              patch("cycles", [
                {
                  openAt: e.target.value,
                  closeAt: form.cycles[0]?.closeAt ?? "",
                  status: form.cycles[0]?.status ?? "predicted",
                },
              ])
            }
            className="h-11 rounded-2xl"
          />
        </Field>
        <Field label="Cycle close">
          <Input
            type="date"
            value={form.cycles[0]?.closeAt ?? ""}
            onChange={(e) =>
              patch("cycles", [
                {
                  openAt: form.cycles[0]?.openAt ?? "",
                  closeAt: e.target.value,
                  status: form.cycles[0]?.status ?? "predicted",
                },
              ])
            }
            className="h-11 rounded-2xl"
          />
        </Field>
        <Field label="Status">
          <select
            className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
            value={form.status}
            onChange={(e) =>
              patch("status", e.target.value as ScholarshipInput["status"])
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.mustBeEnrolled}
          onChange={(e) => patch("mustBeEnrolled", e.target.checked)}
        />
        Must be enrolled
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.bachelorFundingRareNote}
          onChange={(e) => patch("bachelorFundingRareNote", e.target.checked)}
        />
        Show “bachelor funding is rare” note
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.nationalities.includes("pakistan") && !form.nationalities.includes("any")}
          onChange={(e) =>
            patch(
              "nationalities",
              e.target.checked ? ["pakistan"] : ["any"]
            )
          }
        />
        Pakistan-only (otherwise any nationality)
      </label>

      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => patch("notes", e.target.value)}
          className="min-h-24 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Update" : "Create"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/scholarships")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
