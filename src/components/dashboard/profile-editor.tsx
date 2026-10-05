"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ausbildungFieldOptions,
  ausbildungQualificationOptions,
  bachelorsQualificationOptions,
  englishTestOptions,
  germanLevelOptions,
  goalOptions,
  mastersQualificationOptions,
  studyFieldOptions,
  type EligibilityAnswers,
  type EnglishTest,
  type Field,
  type GermanLevel,
  type Goal,
  type GradeSystem,
  type PercentagePassMark,
  type Qualification,
} from "@/lib/eligibility";
import { useEligibilityStore } from "@/lib/eligibility";

const gradeSystems: { value: GradeSystem; label: string }[] = [
  { value: "percentage", label: "Percentage" },
  { value: "cgpa4", label: "CGPA (out of 4)" },
  { value: "cgpa5", label: "CGPA (out of 5)" },
];

export function ProfileEditor({
  initial,
}: {
  initial: EligibilityAnswers;
}) {
  const router = useRouter();
  const store = useEligibilityStore();
  const [form, setForm] = useState<EligibilityAnswers>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qualificationOptions =
    form.goal === "masters"
      ? mastersQualificationOptions
      : form.goal === "bachelors"
        ? bachelorsQualificationOptions
        : ausbildungQualificationOptions;

  const fieldOptions =
    form.goal === "ausbildung" ? ausbildungFieldOptions : studyFieldOptions;

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload: EligibilityAnswers = {
      ...form,
      completedAt: form.completedAt ?? new Date().toISOString(),
    };
    const res = await fetch("/api/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save profile");
      return;
    }
    // Keep local store in sync for guest flows / WhatsApp summary
    if (payload.goal) store.setGoal(payload.goal);
    if (payload.qualification) store.setQualification(payload.qualification);
    if (
      payload.gradeSystem != null &&
      payload.gradeValue != null
    ) {
      store.setGrade({
        gradeSystem: payload.gradeSystem,
        gradeValue: payload.gradeValue,
        percentagePassMark: payload.percentagePassMark,
      });
    }
    if (payload.field) store.setField(payload.field);
    if (payload.englishTest && payload.germanLevel) {
      store.setLanguage({
        englishTest: payload.englishTest,
        englishScore: payload.englishScore,
        germanLevel: payload.germanLevel,
      });
    }
    store.markComplete();
    setForm(payload);
    setMessage("Profile saved. Matches will update.");
    router.refresh();
  }

  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 shadow-card">
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="goal">
          Goal
        </label>
        <select
          id="goal"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
          value={form.goal ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              goal: (e.target.value || null) as Goal | null,
              qualification: null,
              field: null,
              completedAt: null,
            })
          }
        >
          <option value="">Select…</option>
          {goalOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {form.goal ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="qualification">
            Qualification
          </label>
          <select
            id="qualification"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            value={form.qualification ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                qualification: (e.target.value || null) as Qualification | null,
                completedAt: null,
              })
            }
          >
            <option value="">Select…</option>
            {qualificationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="gradeSystem">
            Grade system
          </label>
          <select
            id="gradeSystem"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            value={form.gradeSystem ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                gradeSystem: (e.target.value || null) as GradeSystem | null,
                percentagePassMark:
                  e.target.value === "percentage"
                    ? ((form.percentagePassMark ?? 40) as PercentagePassMark)
                    : null,
                completedAt: null,
              })
            }
          >
            <option value="">Select…</option>
            {gradeSystems.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="gradeValue">
            Grade value
          </label>
          <Input
            id="gradeValue"
            type="number"
            step="0.01"
            value={form.gradeValue ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                gradeValue: e.target.value === "" ? null : Number(e.target.value),
                completedAt: null,
              })
            }
            className="h-12 rounded-2xl"
          />
        </div>
      </div>

      {form.gradeSystem === "percentage" ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="passMark">
            Pass mark
          </label>
          <select
            id="passMark"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            value={form.percentagePassMark ?? 40}
            onChange={(e) =>
              setForm({
                ...form,
                percentagePassMark: Number(e.target.value) as PercentagePassMark,
                completedAt: null,
              })
            }
          >
            <option value={33}>33%</option>
            <option value={40}>40%</option>
            <option value={50}>50%</option>
          </select>
        </div>
      ) : null}

      {form.goal ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="field">
            Field
          </label>
          <select
            id="field"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            value={form.field ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                field: (e.target.value || null) as Field | null,
                completedAt: null,
              })
            }
          >
            <option value="">Select…</option>
            {fieldOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="englishTest">
            English test
          </label>
          <select
            id="englishTest"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            value={form.englishTest ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                englishTest: (e.target.value || null) as EnglishTest | null,
                englishScore:
                  e.target.value === "none" ? null : form.englishScore,
                completedAt: null,
              })
            }
          >
            <option value="">Select…</option>
            {englishTestOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {form.englishTest && form.englishTest !== "none" ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="englishScore">
              Score
            </label>
            <Input
              id="englishScore"
              type="number"
              step="0.1"
              value={form.englishScore ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  englishScore:
                    e.target.value === "" ? null : Number(e.target.value),
                  completedAt: null,
                })
              }
              className="h-12 rounded-2xl"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="german">
          German level
        </label>
        <select
          id="german"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
          value={form.germanLevel ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              germanLevel: (e.target.value || null) as GermanLevel | null,
              completedAt: null,
            })
          }
        >
          <option value="">Select…</option>
          {germanLevelOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {message ? <p className="text-sm text-forest">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </div>
  );
}
