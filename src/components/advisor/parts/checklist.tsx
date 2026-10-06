"use client";

type ChecklistItem = {
  document?: string;
  programId?: string;
};

export function Checklist({ items }: { items: ChecklistItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 list-disc space-y-1 rounded-xl bg-background px-5 py-2 text-xs">
      {items.map((item, i) => (
        <li key={`${item.document}-${i}`}>{item.document}</li>
      ))}
    </ul>
  );
}
