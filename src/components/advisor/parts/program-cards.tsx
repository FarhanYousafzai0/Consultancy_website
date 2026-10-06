"use client";

import Link from "next/link";

type ProgramItem = {
  id?: string;
  name?: string;
  university?: string;
  city?: string;
  degreeLevel?: string;
  ieltsMin?: number | null;
  tuitionPerSemesterEur?: number;
  href?: string;
  lastVerifiedAt?: string | null;
};

export function ProgramCards({ items }: { items: ProgramItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((p, i) => (
        <li
          key={p.id ?? `${p.name}-${i}`}
          className="rounded-xl bg-background px-3 py-2 text-xs shadow-sm"
        >
          <p className="font-semibold text-sm">
            {p.href ? (
              <Link href={p.href} className="text-forest hover:underline">
                {p.name}
              </Link>
            ) : (
              p.name
            )}
          </p>
          <p className="text-muted-foreground">
            {[p.university, p.city, p.degreeLevel].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-0.5 text-muted-foreground">
            {p.ieltsMin != null ? `IELTS ${p.ieltsMin}` : null}
            {p.ieltsMin != null && p.tuitionPerSemesterEur != null ? " · " : null}
            {p.tuitionPerSemesterEur != null
              ? `€${p.tuitionPerSemesterEur}/sem`
              : null}
            {p.lastVerifiedAt ? ` · verified ${p.lastVerifiedAt}` : null}
          </p>
        </li>
      ))}
    </ul>
  );
}
