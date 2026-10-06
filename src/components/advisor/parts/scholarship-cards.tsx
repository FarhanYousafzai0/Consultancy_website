"use client";

import Link from "next/link";

type ScholarshipItem = {
  id?: string;
  name?: string;
  provider?: string;
  odds?: string;
  amountSummary?: string;
  href?: string;
  lastVerifiedAt?: string | null;
};

export function ScholarshipCards({ items }: { items: ScholarshipItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((s, i) => (
        <li
          key={s.id ?? `${s.name}-${i}`}
          className="rounded-xl bg-background px-3 py-2 text-xs shadow-sm"
        >
          <p className="font-semibold text-sm">
            {s.href ? (
              <Link href={s.href} className="text-forest hover:underline">
                {s.name}
              </Link>
            ) : (
              s.name
            )}
          </p>
          <p className="text-muted-foreground">
            {[s.provider, s.odds ? `odds: ${s.odds}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {s.amountSummary ? (
            <p className="mt-0.5 text-muted-foreground">{s.amountSummary}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
