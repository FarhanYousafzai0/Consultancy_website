"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";

export default function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const validEmail = email.includes("@");

  async function signIn() {
    setLoading(true);
    setError(null);
    const { error: signError } = await authClient.signIn.email({ email: email.trim(), password });
    if (signError) {
      setLoading(false);
      setError(signError.status === 401 || /invalid/i.test(signError.message ?? "") ? "Wrong email or password." : (signError.message ?? "Could not sign in"));
      return;
    }
    const res = await fetch("/api/me/profile", { cache: "no-store" });
    const data = res.ok ? ((await res.json()) as { session?: { role?: string } }) : {};
    if (data.session?.role !== "admin") {
      await authClient.signOut();
      setLoading(false);
      setError("This account is not an admin.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#edf1ee] text-foreground">
      <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 size-[28rem] rounded-full bg-[#bde5e3]/55 blur-3xl" />
      <header className="relative mx-4 flex h-20 items-center justify-between border-b border-white/80 md:mx-8">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Back to website</Link>
      </header>
      <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center px-4 py-12">
        <p className="section-label">Admin</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">Sign in to Parwaaz admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your admin email and password to continue.</p>
        <div className="mt-8 space-y-4 rounded-[1.5rem] border border-white/90 bg-white/80 p-6 shadow-[0_16px_45px_rgb(15_17_16_/_0.08)] backdrop-blur-sm">
          <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="email">Admin email</label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-2xl" autoComplete="email" /></div>
          <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="password">Password</label><Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-2xl" autoComplete="current-password" onKeyDown={(event) => { if (event.key === "Enter" && validEmail && password) void signIn(); }} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="button" variant="dark" onClick={signIn} disabled={loading || !validEmail || !password}>{loading ? "Signing in..." : "Sign in"}</Button>
        </div>
      </main>
    </div>
  );
}
