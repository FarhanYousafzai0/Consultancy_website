"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/icons/google-icon";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { authClient } from "@/lib/auth/auth-client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import {
  destinationAfterLogin,
  loadLoginState,
  safeNext,
} from "@/lib/auth/finish-login";

type Mode = "login" | "signup";
type Method = "password" | "code" | "reset";
type Step = "auth" | "set-password";

const GOOGLE_ERRORS: Record<string, string> = {
  access_denied: "Google sign-in was cancelled.",
  state_mismatch:
    "Google sign-in expired or was opened in another tab. Please try again.",
  account_not_linked:
    "This email already has an account. Log in with your email code, then try Google again.",
};

function googleErrorMessage(code: string | null) {
  if (!code) return null;
  return GOOGLE_ERRORS[code] ?? "Google sign-in did not work. Please try again or use an email code.";
}

export function StudentAuthForm({
  mode,
  googleEnabled = false,
}: {
  mode: Mode;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [method, setMethod] = useState<Method>(mode === "signup" ? "code" : "password");
  const [step, setStep] = useState<Step>("auth");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    googleErrorMessage(searchParams.get("error"))
  );
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"admin" | "user">("user");

  const validEmail = email.includes("@");

  function switchMethod(nextMethod: Method) {
    setMethod(nextMethod);
    setSent(false);
    setOtp("");
    setError(null);
    setMessage(null);
  }

  function go(to: string) {
    router.push(to);
    router.refresh();
  }

  /** After a code or Google login, offer a password for next time. */
  async function afterAuth(offerPassword: boolean) {
    const state = await loadLoginState();
    if (!state) {
      setError("You are signed in, but we could not load your account. Please refresh.");
      return;
    }
    setRole(state.role);
    if (offerPassword && !state.hasPassword) {
      setStep("set-password");
      return;
    }
    go(destinationAfterLogin(state.role, next));
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
          ? "Wrong email or password. No password yet? Log in with an email code and set one."
          : (signError.message ?? "Could not log in")
      );
      return;
    }
    await afterAuth(false);
    setLoading(false);
  }

  async function sendCode() {
    setLoading(true);
    setError(null);
    const { error: sendError } =
      method === "reset"
        ? await authClient.emailOtp.requestPasswordReset({ email: email.trim() })
        : await authClient.emailOtp.sendVerificationOtp({
            email: email.trim(),
            type: "sign-in",
          });
    setLoading(false);
    if (sendError) {
      setError(sendError.message ?? "Could not send the code");
      return;
    }
    setSent(true);
    setMessage(`We sent a 6-digit code to ${email.trim()}. It expires in 10 minutes.`);
  }

  async function verifyCode() {
    setLoading(true);
    setError(null);
    const { error: signError } = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp: otp.trim(),
      name: name.trim() || email.split("@")[0] || "Student",
    });
    if (signError) {
      setLoading(false);
      setError(signError.message ?? "Could not verify the code");
      return;
    }
    await afterAuth(true);
    setLoading(false);
  }

  async function resetPassword() {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setLoading(true);
    setError(null);
    const { error: resetError } = await authClient.emailOtp.resetPassword({
      email: email.trim(),
      otp: otp.trim(),
      password: newPassword,
    });
    if (resetError) {
      setLoading(false);
      setError(resetError.message ?? "Could not reset the password");
      return;
    }
    const { error: signError } = await authClient.signIn.email({
      email: email.trim(),
      password: newPassword,
    });
    if (signError) {
      setLoading(false);
      setPassword("");
      switchMethod("password");
      setMessage("Password updated. Log in with your new password.");
      return;
    }
    await afterAuth(false);
    setLoading(false);
  }

  async function signInGoogle() {
    setLoading(true);
    setError(null);
    const here = mode === "signup" ? "/signup" : "/login";
    const { error: googleError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `/login/continue?next=${encodeURIComponent(next)}`,
      newUserCallbackURL: `/login/continue?next=${encodeURIComponent(next)}&new=1`,
      errorCallbackURL: `${here}?next=${encodeURIComponent(next)}`,
    });
    if (googleError) {
      setLoading(false);
      setError(googleError.message ?? "Google sign-in is not available right now.");
    }
  }

  if (step === "set-password") {
    const destination = destinationAfterLogin(role, next);
    return (
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:px-0">
        <p className="section-label">You are in</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
          Set a password for next time
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Next time, log in with {email.trim() || "your email"} and this password. No code needed.
        </p>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-card">
          <SetPasswordForm onDone={() => go(destination)} onSkip={() => go(destination)} />
        </div>
      </div>
    );
  }

  const title =
    method === "reset" ? "Reset your password" : mode === "signup" ? "Save your results" : "Log in";
  const subtitle =
    method === "reset"
      ? "We will email you a code. Enter it with your new password."
      : mode === "signup"
        ? "Create a free account with an email code. Your eligibility answers will sync from this browser."
        : "Log in with your password, or get a one-time code by email.";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:px-0">
      <p className="section-label">
        {mode === "signup" ? "Sign up" : "Welcome back"}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

      <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-card">
        {mode === "login" && method !== "reset" ? (
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
        ) : null}

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

        {method === "password" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-forest underline-offset-4 hover:underline"
                onClick={() => switchMethod("reset")}
              >
                Forgot password?
              </button>
            </div>
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
        ) : null}

        {method !== "password" && sent ? (
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

        {method === "reset" && sent ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="reset-password">
              New password
            </label>
            <Input
              id="reset-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 rounded-2xl"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
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
              Log in
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={sendCode}
                disabled={loading || !validEmail}
              >
                {sent ? "Resend code" : "Send code"}
              </Button>
              {sent ? (
                <Button
                  type="button"
                  variant="dark"
                  onClick={method === "reset" ? resetPassword : verifyCode}
                  disabled={loading || otp.trim().length < 6 || (method === "reset" && !newPassword)}
                >
                  {method === "reset"
                    ? "Save new password"
                    : mode === "signup"
                      ? "Create account"
                      : "Log in"}
                </Button>
              ) : null}
            </>
          )}
          {method === "reset" ? (
            <Button type="button" variant="ghost" onClick={() => switchMethod("password")}>
              Back to log in
            </Button>
          ) : null}
        </div>

        {googleEnabled && method !== "reset" ? (
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
              {mode === "signup" ? "Sign up with Google" : "Log in with Google"}
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
