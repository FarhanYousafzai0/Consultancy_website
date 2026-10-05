"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";

export default function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("founder@parwaz.local");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setLoading(true);
    setError(null);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setLoading(false);
    if (sendError) {
      setError(sendError.message ?? "Could not send OTP");
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
      name: "Parwaz Admin",
    });
    setLoading(false);
    if (signError) {
      setError(signError.message ?? "Could not verify OTP");
      return;
    }
    router.push("/admin/programs");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <p className="section-label">Admin</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
        Sign in to Parwaz admin
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Email one-time code via Better Auth. With Resend configured the code
        arrives by email; otherwise it is written to{" "}
        <code className="font-mono">D:\dev-cache\parwaz\last-otp.txt</code>.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-card">
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
            />
          </div>
        ) : null}

        {message ? <p className="text-sm text-forest">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={sendOtp} disabled={loading}>
            {sent ? "Resend code" : "Send code"}
          </Button>
          {sent ? (
            <Button
              type="button"
              variant="dark"
              onClick={verify}
              disabled={loading || !otp}
            >
              Sign in
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
