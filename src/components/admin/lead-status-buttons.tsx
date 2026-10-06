"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { LeadStatus } from "@/lib/db/types";

export function LeadStatusButtons({
  id,
  status,
  kind,
  userId,
  creditAmount = 0,
}: {
  id: string;
  status: LeadStatus;
  kind: string;
  userId: string | null;
  creditAmount?: number;
}) {
  const router = useRouter();

  async function setStatus(next: LeadStatus) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      alert("Update failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status !== "contacted" ? (
        <Button type="button" size="sm" variant="outline" onClick={() => void setStatus("contacted")}>
          Contacted
        </Button>
      ) : null}
      {kind === "sop_review" && status !== "paid" && userId ? (
        <Button type="button" size="sm" onClick={() => void setStatus("paid")}>
          Mark paid
        </Button>
      ) : null}
      {kind === "ai_credits" && status !== "paid" && userId ? (
        <Button type="button" size="sm" onClick={() => void setStatus("paid")}>
          Mark paid{creditAmount > 0 ? ` (+${creditAmount} credits)` : ""}
        </Button>
      ) : null}
      {status !== "closed" ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => void setStatus("closed")}>
          Close
        </Button>
      ) : null}
    </div>
  );
}
