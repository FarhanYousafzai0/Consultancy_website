"use client";

import Link from "next/link";

type GuideItem = {
  id?: string;
  title?: string;
  excerpt?: string;
  href?: string;
  lastVerifiedAt?: string | null;
  sourceUrl?: string;
};

export function GuideSnippets({ items }: { items: GuideItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((g, i) => (
        <li
          key={g.id ?? `${g.title}-${i}`}
          className="rounded-xl bg-background px-3 py-2 text-xs shadow-sm"
        >
          <p className="font-semibold text-sm">
            {g.href ? (
              <Link href={g.href} className="text-forest hover:underline">
                {g.title}
              </Link>
            ) : (
              g.title
            )}
          </p>
          {g.excerpt ? (
            <p className="mt-1 line-clamp-4 text-muted-foreground">{g.excerpt}</p>
          ) : null}
          {g.lastVerifiedAt ? (
            <p className="mt-1 text-muted-foreground">
              Verified {g.lastVerifiedAt}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
