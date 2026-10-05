"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProgramInput, ProgramRecord } from "@/lib/db/types";

const emptyForm = (): ProgramInput => ({
  name: "",
  university: "",
  universityType: "public",
  degreeLevel: "master",
  field: "computer_science",
  city: "",
  state: "",
  languageOfInstruction: "english",
  ieltsMin: 6.5,
  toeflMin: 90,
  germanRequired: "none",
  applicationRoute: "uni_assist",
  tuitionPerSemesterEur: 0,
  semesterFeeEur: 300,
  typicalGermanGradeMax: 2.5,
  intakes: [
    {
      semester: "winter",
      year: new Date().getFullYear() + 1,
      deadlineNonEu: "",
      status: "predicted",
    },
  ],
  requiredDocuments: [
    "transcript",
    "degree_certificate",
    "cv",
    "english_certificate",
    "aps_certificate",
  ],
  sourceUrl: "https://",
  lastVerifiedAt: new Date().toISOString().slice(0, 10),
  status: "draft",
  notes: "",
});

type ProgramFormProps = {
  initial?: ProgramRecord;
};

export function ProgramForm({ initial }: ProgramFormProps) {
  const router = useRouter();
  const starting = useMemo(() => {
    if (!initial) return emptyForm();
    return {
      name: initial.name,
      university: initial.university,
      universityType: initial.universityType,
      degreeLevel: initial.degreeLevel,
      field: initial.field,
      city: initial.city,
      state: initial.state,
      languageOfInstruction: initial.languageOfInstruction,
      ieltsMin: initial.ieltsMin,
      toeflMin: initial.toeflMin,
      germanRequired: initial.germanRequired,
      applicationRoute: initial.applicationRoute,
      tuitionPerSemesterEur: initial.tuitionPerSemesterEur,
      semesterFeeEur: initial.semesterFeeEur,
      typicalGermanGradeMax: initial.typicalGermanGradeMax,
      intakes: initial.intakes.map((intake) => ({
        ...intake,
        deadlineNonEu: intake.deadlineNonEu ?? "",
      })),
      requiredDocuments: initial.requiredDocuments,
      sourceUrl: initial.sourceUrl,
      lastVerifiedAt: initial.lastVerifiedAt,
      status: initial.status,
      notes: initial.notes,
    };
  }, [initial]);

  const [form, setForm] = useState(starting);
  const [docs, setDocs] = useState(starting.requiredDocuments.join(", "));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function patch<K extends keyof ProgramInput>(key: K, value: ProgramInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: ProgramInput = {
      ...form,
      ieltsMin: form.ieltsMin === null || Number.isNaN(form.ieltsMin as number)
        ? null
        : Number(form.ieltsMin),
      toeflMin: form.toeflMin === null || Number.isNaN(form.toeflMin as number)
        ? null
        : Number(form.toeflMin),
      typicalGermanGradeMax:
        form.typicalGermanGradeMax === null ||
        Number.isNaN(form.typicalGermanGradeMax as number)
          ? null
          : Number(form.typicalGermanGradeMax),
      tuitionPerSemesterEur: Number(form.tuitionPerSemesterEur) || 0,
      semesterFeeEur: Number(form.semesterFeeEur) || 0,
      requiredDocuments: docs
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      intakes: form.intakes.map((intake) => ({
        ...intake,
        year: Number(intake.year),
        deadlineNonEu: intake.deadlineNonEu?.trim()
          ? intake.deadlineNonEu.trim()
          : null,
      })),
      lastVerifiedAt: form.lastVerifiedAt?.trim() || null,
    };

    const res = await fetch(
      initial ? `/api/admin/programs/${initial.id}` : "/api/admin/programs",
      {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save program");
      return;
    }
    router.push("/admin/programs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-card">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Program name">
          <Input
            required
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="University">
          <Input
            required
            value={form.university}
            onChange={(e) => patch("university", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="City">
          <Input
            required
            value={form.city}
            onChange={(e) => patch("city", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="State">
          <Input
            required
            value={form.state}
            onChange={(e) => patch("state", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="University type">
          <Select
            value={form.universityType}
            onChange={(v) => patch("universityType", v as ProgramInput["universityType"])}
            options={[
              ["public", "Public"],
              ["private", "Private"],
            ]}
          />
        </Field>
        <Field label="Degree level">
          <Select
            value={form.degreeLevel}
            onChange={(v) => patch("degreeLevel", v as ProgramInput["degreeLevel"])}
            options={[
              ["master", "Master's"],
              ["bachelor", "Bachelor's"],
            ]}
          />
        </Field>
        <Field label="Field">
          <Select
            value={form.field}
            onChange={(v) => patch("field", v as ProgramInput["field"])}
            options={[
              ["computer_science", "Computer Science"],
              ["engineering", "Engineering"],
              ["data", "Data / AI"],
              ["business", "Business"],
              ["natural_sciences", "Natural Sciences"],
              ["health", "Health"],
              ["social_sciences", "Social Sciences"],
              ["arts", "Arts"],
              ["other", "Other"],
            ]}
          />
        </Field>
        <Field label="Language of instruction">
          <Select
            value={form.languageOfInstruction}
            onChange={(v) =>
              patch(
                "languageOfInstruction",
                v as ProgramInput["languageOfInstruction"]
              )
            }
            options={[
              ["english", "English"],
              ["german", "German"],
              ["both", "Both"],
            ]}
          />
        </Field>
        <Field label="IELTS minimum (blank = none)">
          <Input
            type="number"
            step="0.5"
            value={form.ieltsMin ?? ""}
            onChange={(e) =>
              patch(
                "ieltsMin",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="TOEFL minimum (blank = none)">
          <Input
            type="number"
            value={form.toeflMin ?? ""}
            onChange={(e) =>
              patch(
                "toeflMin",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="German required">
          <Select
            value={form.germanRequired}
            onChange={(v) =>
              patch("germanRequired", v as ProgramInput["germanRequired"])
            }
            options={[
              ["none", "None"],
              ["a1", "A1"],
              ["a2", "A2"],
              ["b1", "B1"],
              ["b2", "B2"],
              ["c1", "C1"],
            ]}
          />
        </Field>
        <Field label="Application route">
          <Select
            value={form.applicationRoute}
            onChange={(v) =>
              patch("applicationRoute", v as ProgramInput["applicationRoute"])
            }
            options={[
              ["direct", "Direct"],
              ["uni_assist", "uni-assist"],
              ["vpd", "VPD"],
            ]}
          />
        </Field>
        <Field label="Tuition € / semester">
          <Input
            type="number"
            value={form.tuitionPerSemesterEur}
            onChange={(e) =>
              patch("tuitionPerSemesterEur", Number(e.target.value))
            }
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Semester fee €">
          <Input
            type="number"
            value={form.semesterFeeEur}
            onChange={(e) => patch("semesterFeeEur", Number(e.target.value))}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Typical German grade max (1.0 best)">
          <Input
            type="number"
            step="0.1"
            value={form.typicalGermanGradeMax ?? ""}
            onChange={(e) =>
              patch(
                "typicalGermanGradeMax",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(v) => patch("status", v as ProgramInput["status"])}
            options={[
              ["draft", "Draft"],
              ["published", "Published"],
            ]}
          />
        </Field>
        <Field label="Source URL">
          <Input
            required
            type="url"
            value={form.sourceUrl}
            onChange={(e) => patch("sourceUrl", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Last verified (YYYY-MM-DD)">
          <Input
            value={form.lastVerifiedAt ?? ""}
            onChange={(e) => patch("lastVerifiedAt", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      <Field label="Required documents (comma-separated)">
        <Input
          value={docs}
          onChange={(e) => setDocs(e.target.value)}
          className="h-11 rounded-xl"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Intake semester">
          <Select
            value={form.intakes[0]?.semester ?? "winter"}
            onChange={(v) =>
              patch("intakes", [
                {
                  ...(form.intakes[0] ?? {
                    year: new Date().getFullYear() + 1,
                    deadlineNonEu: "",
                    status: "predicted" as const,
                  }),
                  semester: v as "winter" | "summer",
                },
              ])
            }
            options={[
              ["winter", "Winter"],
              ["summer", "Summer"],
            ]}
          />
        </Field>
        <Field label="Intake year">
          <Input
            type="number"
            value={form.intakes[0]?.year ?? ""}
            onChange={(e) =>
              patch("intakes", [
                {
                  ...(form.intakes[0] ?? {
                    semester: "winter" as const,
                    deadlineNonEu: "",
                    status: "predicted" as const,
                  }),
                  year: Number(e.target.value),
                },
              ])
            }
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Non-EU deadline">
          <Input
            value={form.intakes[0]?.deadlineNonEu ?? ""}
            onChange={(e) =>
              patch("intakes", [
                {
                  ...(form.intakes[0] ?? {
                    semester: "winter" as const,
                    year: new Date().getFullYear() + 1,
                    status: "predicted" as const,
                  }),
                  deadlineNonEu: e.target.value,
                },
              ])
            }
            className="h-11 rounded-xl"
            placeholder="2027-03-15"
          />
        </Field>
        <Field label="Deadline status">
          <Select
            value={form.intakes[0]?.status ?? "predicted"}
            onChange={(v) =>
              patch("intakes", [
                {
                  ...(form.intakes[0] ?? {
                    semester: "winter" as const,
                    year: new Date().getFullYear() + 1,
                    deadlineNonEu: "",
                  }),
                  status: v as "confirmed" | "predicted",
                },
              ])
            }
            options={[
              ["predicted", "Predicted"],
              ["confirmed", "Confirmed"],
            ]}
          />
        </Field>
      </div>

      <Field label="Internal notes">
        <textarea
          value={form.notes}
          onChange={(e) => patch("notes", e.target.value)}
          className="min-h-24 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create program"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/programs")}
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
    <label className="block space-y-1.5 text-sm font-semibold">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm font-medium"
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}
