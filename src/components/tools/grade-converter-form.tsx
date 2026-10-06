"use client";

import { useMemo, useState } from "react";
import {
  evaluateGrade,
  type GradeSystem,
  type PercentagePassMark,
} from "@/lib/eligibility";
import {
  gradeSystemOptions,
  passMarkOptions,
} from "@/lib/eligibility/labels";

export function GradeConverterForm() {
  const [system, setSystem] = useState<GradeSystem>("percentage");
  const [value, setValue] = useState("70");
  const [passMark, setPassMark] = useState<PercentagePassMark>(40);

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (system === "percentage" && (n < 0 || n > 100)) return null;
    if (system === "cgpa4" && (n < 0 || n > 4)) return null;
    if (system === "cgpa5" && (n < 0 || n > 5)) return null;
    return evaluateGrade(system, n, passMark);
  }, [passMark, system, value]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Grade system</span>
          <select
            className="w-full rounded-full border border-input bg-background px-3 py-2"
            value={system}
            onChange={(e) => setSystem(e.target.value as GradeSystem)}
          >
            {gradeSystemOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Your grade</span>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-full border border-input bg-background px-3 py-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        {system === "percentage" ? (
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-semibold">Pass mark</span>
            <select
              className="w-full rounded-full border border-input bg-background px-3 py-2"
              value={passMark}
              onChange={(e) =>
                setPassMark(Number(e.target.value) as PercentagePassMark)
              }
            >
              {passMarkOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {result ? (
        <div className="rounded-2xl bg-muted/50 p-5">
          <p className="text-sm text-muted-foreground">German grade (approx.)</p>
          <p className="mt-1 text-4xl font-extrabold tracking-[-0.03em]">
            {result.germanGrade.toFixed(2)}
          </p>
          <p className="mt-3 font-semibold">{result.bandLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.bandNote}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter a valid grade for the selected system.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Uses the modified Bavarian formula. Universities may convert differently
        — always confirm on the official program page.
      </p>
    </div>
  );
}
