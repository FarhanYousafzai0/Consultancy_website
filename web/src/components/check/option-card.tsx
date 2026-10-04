"use client";

import { Check } from "@phosphor-icons/react";
import { cn } from "cn";

type OptionCardProps = {
  label: string;
  description?: string;
  selected?: boolean;
  onSelect: () => void;
};

export function OptionCard({
  label,
  description,
  selected,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition-all",
        "hover:-translate-y-0.5 hover:shadow-card-hover",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2",
        selected && "shadow-[inset_0_0_0_2px_var(--ink)]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-border",
          selected && "border-ink bg-primary"
        )}
      >
        {selected ? <Check weight="bold" className="size-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
