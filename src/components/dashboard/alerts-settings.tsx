"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function AlertsSettings({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  async function save(next: boolean) {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/me/alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailEnabled: next }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save preference");
      return;
    }
    setEnabled(next);
    setMessage(next ? "Email reminders are on." : "Email reminders are off.");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <p className="section-label">Alerts</p>
      <h1 className="mt-3 text-2xl font-extrabold">Deadline email reminders</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        We email you when a shortlisted program or saved scholarship deadline is
        in <strong>30</strong>, <strong>14</strong>, or <strong>7</strong> days.
        Uses the same Resend inbox as your login codes.
      </p>

      <label className="mt-6 flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          className="size-4"
          checked={enabled}
          disabled={saving}
          onChange={(e) => void save(e.target.checked)}
        />
        Send deadline emails to my account email
      </label>

      {message ? <p className="mt-3 text-sm text-forest">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        className="mt-5"
        variant="outline"
        disabled={saving}
        onClick={() => void save(!enabled)}
      >
        {enabled ? "Turn off reminders" : "Turn on reminders"}
      </Button>
    </div>
  );
}
