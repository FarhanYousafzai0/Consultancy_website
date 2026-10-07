"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/ui/filter-select";

const CITIES = [
  { id: "berlin", label: "Berlin", rent: 650, food: 280, transit: 49, misc: 150 },
  { id: "munich", label: "Munich", rent: 850, food: 300, transit: 49, misc: 170 },
  { id: "frankfurt", label: "Frankfurt", rent: 750, food: 290, transit: 49, misc: 160 },
  { id: "aachen", label: "Aachen / smaller city", rent: 480, food: 250, transit: 49, misc: 120 },
] as const;

export function CostCalculatorForm() {
  const [cityId, setCityId] = useState<(typeof CITIES)[number]["id"]>("berlin");
  const [tuition, setTuition] = useState("0");
  const [semesterFee, setSemesterFee] = useState("320");
  const [months, setMonths] = useState("12");

  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];

  const result = useMemo(() => {
    const tuitionN = Math.max(0, Number(tuition) || 0);
    const feeN = Math.max(0, Number(semesterFee) || 0);
    const monthsN = Math.min(24, Math.max(1, Number(months) || 12));
    const livingMonthly = city.rent + city.food + city.transit + city.misc;
    const livingTotal = livingMonthly * monthsN;
    const semesters = monthsN / 6;
    const uniTotal = (tuitionN + feeN) * semesters;
    return {
      livingMonthly,
      livingTotal,
      uniTotal,
      grandTotal: livingTotal + uniTotal,
      monthsN,
    };
  }, [city, months, semesterFee, tuition]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FilterSelect
            label="City"
            value={cityId}
            onChange={(next) =>
              setCityId(next as (typeof CITIES)[number]["id"])
            }
            options={CITIES.map((c) => [c.id, c.label])}
          />
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">
            Tuition / semester (€)
          </span>
          <input
            type="number"
            min={0}
            className="w-full rounded-full border border-input bg-background px-3 py-2"
            value={tuition}
            onChange={(e) => setTuition(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">
            Semester fee (€)
          </span>
          <input
            type="number"
            min={0}
            className="w-full rounded-full border border-input bg-background px-3 py-2"
            value={semesterFee}
            onChange={(e) => setSemesterFee(e.target.value)}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold">Months to plan</span>
          <input
            type="number"
            min={1}
            max={24}
            className="w-full rounded-full border border-input bg-background px-3 py-2"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </label>
      </div>

      <div className="rounded-2xl bg-muted/50 p-5 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Living / month (est.)</span>
          <span className="font-semibold tabular-nums">
            €{result.livingMonthly.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">
            Living × {result.monthsN} months
          </span>
          <span className="font-semibold tabular-nums">
            €{Math.round(result.livingTotal).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">University fees (est.)</span>
          <span className="font-semibold tabular-nums">
            €{Math.round(result.uniTotal).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-2 border-t border-border pt-2 text-base">
          <span className="font-semibold">Rough total</span>
          <span className="font-extrabold tabular-nums">
            €{Math.round(result.grandTotal).toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Illustrative living costs only (rent, food, Deutschlandticket-style
        transit, misc). Blocked-account / visa proof-of-funds amounts change —
        confirm with the German mission. Public unis often have €0 tuition + a
        semester fee.
      </p>
    </div>
  );
}
