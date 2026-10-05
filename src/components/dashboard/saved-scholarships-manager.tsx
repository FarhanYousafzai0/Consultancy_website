"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  scholarshipId: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string | null;
};

export function SavedScholarshipsManager({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(scholarshipId: string) {
    setBusyId(scholarshipId);
    const res = await fetch(
      `/api/me/scholarships?scholarshipId=${encodeURIComponent(scholarshipId)}`,
      { method: "DELETE" }
    );
    setBusyId(null);
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.scholarshipId !== scholarshipId));
      router.refresh();
    }
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href={`/scholarships/${item.scholarshipId}`}
                className="text-lg font-bold hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-sm text-muted-foreground">{item.provider}</p>
              <p className="mt-1 text-sm">{item.amount}</p>
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
              disabled={busyId === item.scholarshipId}
              onClick={() => void remove(item.scholarshipId)}
            >
              Remove
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
