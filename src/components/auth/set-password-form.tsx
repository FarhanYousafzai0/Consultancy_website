"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

/** Adds a first password to an account made by email code or Google. */
export function SetPasswordForm({
  onDone,
  onSkip,
  submitLabel = "Save password",
}: {
  onDone: () => void;
  onSkip?: () => void;
  submitLabel?: string;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not save the password.");
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="new-password">
          New password
        </label>
        <Input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-2xl"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="confirm-password">
          Confirm password
        </label>
        <Input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-12 rounded-2xl"
          autoComplete="new-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
          }}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="dark" onClick={save} disabled={loading || !password}>
          {submitLabel}
        </Button>
        {onSkip ? (
          <Button type="button" variant="ghost" onClick={onSkip} disabled={loading}>
            Skip for now
          </Button>
        ) : null}
      </div>
    </div>
  );
}
