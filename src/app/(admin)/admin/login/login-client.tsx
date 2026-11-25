"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";

type Method = "password" | "code";

export default function AdminLoginClient() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validEmail = email.includes("@");

  function switchMethod(next: Method) {
    setMethod(next);
    setSent(false);
    setOtp("");
    setError(null);
    setMessage(null);
  }

  /** Signed in — but only admins may stay on the admin side. */
  async function finish() {
    const res = await fetch("/api/me/profile", { cache: "no-store" });
    const data = res.ok
      ? ((await res.json()) as { session?: { role?: string } })
      : {};
    if (data.session?.role !== "admin") {
      await authClient.signOut();
      setLoading(false);
      setError("This account is not an admin.");
      return;
    }
    router.push("/admin/programs");
    router.refresh();
  }

  async function signInWithPassword() {
    setLoading(true);
    setError(null);
    const { error: signError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    if (signError) {
      setLoading(false);
      setError(
        signError.status === 401 || /invalid/i.test(signError.message ?? "")
          ? "Wrong email or password."
          : (signError.message ?? "Could not sign in")
      );
      return;
    }
    await finish();
  }

  async function sendOtp() {
    setLoading(true);
    setError(null);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });
    setLoading(false);
    if (sendError) {
      setError(sendError.message ?? "Could not send the code");
      return;
    }
    setSent(true);
    setMessage(`We sent a 6-digit code to ${email.trim()}.`);
  }

  async function verify() {
    setLoading(true);
    setError(null);
    const { error: signError } = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp: otp.trim(),
    });
    if (signError) {
      setLoading(false);
      setError(signError.message ?? "Could not verify the code");
      return;
    }
    await finish();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <p className="section-label">Admin</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
        Sign in to Parwaaz admin
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your admin password, or get a one-time code by email.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="tablist">
          {(["password", "code"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={method === m}
              onClick={() => switchMethod(m)}
              className={`h-10 rounded-full text-sm font-semibold transition ${
                method === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "password" ? "Password" : "Email code"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="email">
            Admin email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-2xl"
            autoComplete="email"
          />
        </div>

        {method === "password" ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl"
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter" && validEmail && password) void signInWithPassword();
              }}
            />
          </div>
        ) : sent ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="otp">
              Code from your email
            </label>
            <Input
              id="otp"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-12 rounded-2xl"
              placeholder="6-digit code"
              autoComplete="one-time-code"
            />
          </div>
        ) : null}

        {message ? <p className="text-sm text-forest">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          {method === "password" ? (
            <Button
              type="button"
              variant="dark"
              onClick={signInWithPassword}
              disabled={loading || !validEmail || !password}
            >
              Sign in
            </Button>
          ) : (
            <>
              <Button type="button" onClick={sendOtp} disabled={loading || !validEmail}>
                {sent ? "Resend code" : "Send code"}
              </Button>
              {sent ? (
                <Button
                  type="button"
                  variant="dark"
                  onClick={verify}
                  disabled={loading || otp.trim().length < 6}
                >
                  Sign in
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
