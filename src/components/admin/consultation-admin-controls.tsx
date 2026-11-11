"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  CONSULTATION_STATUSES,
  type ConsultationStatus,
} from "@/lib/consultation/status";

export function ConsultationAdminControls({
  id,
  status,
  adminNotes,
}: {
  id: string;
  status: ConsultationStatus;
  adminNotes: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [notes, setNotes] = useState(adminNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(patch: { status?: ConsultationStatus; adminNotes?: string }) {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Could not save.");
      return;
    }
    if (patch.status) setCurrent(patch.status);
    setMessage("Saved.");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
      <div>
        <p className="text-sm font-semibold">Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONSULTATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={saving || s === current}
              onClick={() => save({ status: s })}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold capitalize",
                s === current ? "bg-ink text-primary" : "bg-muted hover:bg-muted/70"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="admin-notes" className="text-sm font-semibold">
          Internal notes
        </label>
        <textarea
          id="admin-notes"
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-xl border border-input p-3 text-sm"
          placeholder="Call outcome, fee quoted, next step…"
        />
        <Button type="button" size="sm" className="mt-2" disabled={saving} onClick={() => save({ adminNotes: notes })}>
          Save notes
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
