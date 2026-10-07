"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ANY = "__any__";

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold">
      {label}
      <Select
        value={value === "" ? ANY : value}
        onValueChange={(next) => onChange(next === ANY ? "" : next)}
      >
        <SelectTrigger className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="z-50 rounded-xl border border-border bg-white p-1 text-foreground shadow-card"
        >
          {options.map(([optionValue, text]) => (
            <SelectItem
              key={optionValue || ANY}
              value={optionValue === "" ? ANY : optionValue}
              className="rounded-lg py-2 focus:bg-muted focus:text-foreground"
            >
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
