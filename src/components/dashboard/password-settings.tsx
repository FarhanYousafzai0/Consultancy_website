"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { authClient } from "@/lib/auth/auth-client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

/** Profile card: add a first password, or change the current one. */
export function PasswordSettings() {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/me/password", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { hasPassword: false }))
      .then((data: { hasPassword?: boolean }) => setHasPassword(Boolean(data.hasPassword)))
      .catch(() => setHasPassword(false));
  }, []);

  async function change() {
    setError(null);
    setMessage(null);
    if (next.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setLoading(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (changeError) {
      setError(
        /invalid/i.test(changeError.message ?? "")
          ? "Your current password is not right."
          : (changeError.message ?? "Could not change the password.")
      );
      return;
    }
    setCurrent("");
    setNext("");
    setMessage("Password changed. Other devices have been signed out.");
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="text-lg font-bold">Password</h2>
      {hasPassword === null ? (
        <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
      ) : hasPassword ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            You can log in with your email and password, or with an email code.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="current-password">
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="h-12 rounded-2xl"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="changed-password">
              New password
            </label>
            <Input
              id="changed-password"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="h-12 rounded-2xl"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
            />
          </div>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="button"
            variant="dark"
            onClick={change}
            disabled={loading || !current || !next}
          >
            Change password
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Add a password so you can log in without waiting for an email code.
          </p>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
          <SetPasswordForm
            onDone={() => {
              setHasPassword(true);
              setMessage("Password saved. Next time, log in with your email and password.");
            }}
          />
        </div>
      )}
    </section>
  );
}
