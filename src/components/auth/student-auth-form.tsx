"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/icons/google-icon";
import { authClient } from "@/lib/auth/auth-client";
import { syncLocalProfileToServer } from "@/lib/auth/sync-profile";
import {
  isProfileComplete,
  selectAnswers,
  useEligibilityStore,
} from "@/lib/eligibility";

type Mode = "login" | "signup";

export function StudentAuthForm({
  mode,
  googleEnabled = false,
}: {
  mode: Mode;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const store = useEligibilityStore();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function afterAuth() {
    await syncLocalProfileToServer();
    const answers = selectAnswers(store);
    const sessionRes = await fetch("/api/me/profile");
    if (sessionRes.ok) {
      const data = (await sessionRes.json()) as {
        session?: { role?: string };
      };
      if (data.session?.role === "admin") {
        router.push("/admin/programs");
        router.refresh();
        return;
      }
    }
    if (isProfileComplete(answers) || answers.goal) {
      router.push(next.startsWith("/") ? next : "/dashboard");
    } else {
      router.push("/check");
    }
    router.refresh();
  }

  async function sendOtp() {
    setLoading(true);
    setError(null);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setLoading(false);
    if (sendError) {
      setError(sendError.message ?? "Could not send code");
      return;
    }
    setSent(true);
    setMessage(
      "Code sent. Check your email, or D:\\dev-cache\\parwaz\\last-otp.txt if Resend is not configured."
    );
  }

  async function verify() {
    setLoading(true);
    setError(null);
    const { error: signError } = await authClient.signIn.emailOtp({
      email,
      otp,
      name: name.trim() || email.split("@")[0] || "Student",
    });
    setLoading(false);
    if (signError) {
      setError(signError.message ?? "Could not verify code");
      return;
    }
    await afterAuth();
  }

  async function signInGoogle() {
    setLoading(true);
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: next.startsWith("/") ? next : "/dashboard",
    });
  }

  const title = mode === "signup" ? "Save your results" : "Log in";
  const subtitle =
    mode === "signup"
      ? "Create a free account with an email code. Your eligibility answers will sync from this browser."
      : "Use the same email one-time code. No password to remember.";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:px-0">
      <p className="section-label">
        {mode === "signup" ? "Sign up" : "Welcome back"}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

      <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-card">
        {mode === "signup" ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-2xl"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-2xl"
            placeholder="you@email.com"
            autoComplete="email"
          />
        </div>

        {sent ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="otp">
              One-time code
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
          <Button
            type="button"
            onClick={sendOtp}
            disabled={loading || !email.includes("@")}
          >
            {sent ? "Resend code" : "Send code"}
          </Button>
          {sent ? (
            <Button
              type="button"
              variant="dark"
              onClick={verify}
              disabled={loading || otp.length < 4}
            >
              {mode === "signup" ? "Create account" : "Log in"}
            </Button>
          ) : null}
        </div>

        {googleEnabled ? (
          <>
            <div className="relative py-2 text-center text-xs text-muted-foreground before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-muted">
              <span className="relative bg-white px-2">or</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-12 w-full gap-3 rounded-full bg-[#f8dce8] px-6 text-[15px] font-semibold text-ink hover:bg-[#f3c9db]"
              onClick={signInGoogle}
              disabled={loading}
            >
              <GoogleIcon className="size-5" />
              Sign in with Google
            </Button>
          </>
        ) : null}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(next)}`}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
