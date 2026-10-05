"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  programId: string;
  name: string;
  university: string;
  city: string;
  deadline: string | null;
  documents: string[];
};

export function ShortlistManager({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(programId: string) {
    setBusyId(programId);
    const res = await fetch(
      `/api/me/shortlist?programId=${encodeURIComponent(programId)}`,
      { method: "DELETE" }
    );
    setBusyId(null);
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.programId !== programId));
      router.refresh();
    }
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl bg-white p-5 shadow-card"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href={`/programs/${item.programId}`}
                className="text-lg font-bold hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {item.university}
                {item.city ? ` · ${item.city}` : ""}
              </p>
              {item.deadline ? (
                <p className="mt-1 text-sm font-medium text-amber-ink">
                  Deadline: {item.deadline}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busyId === item.programId}
              onClick={() => void remove(item.programId)}
            >
              Remove
            </Button>
          </div>
          {item.documents.length ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Document checklist
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {item.documents.map((doc) => (
                  <li key={doc}>☐ {doc}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
