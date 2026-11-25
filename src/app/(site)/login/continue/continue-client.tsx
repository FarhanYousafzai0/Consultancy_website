"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import {
  destinationAfterLogin,
  loadLoginState,
  safeNext,
} from "@/lib/auth/finish-login";

export function ContinueLogin({ email }: { email: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [destination, setDestination] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const state = await loadLoginState();
      if (cancelled) return;
      if (!state) {
        setError("You are signed in, but we could not load your account. Please refresh.");
        return;
      }
      const to = destinationAfterLogin(state.role, next);
      if (state.hasPassword) {
        router.replace(to);
        router.refresh();
        return;
      }
      setDestination(to);
    })();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  function go() {
    if (!destination) return;
    router.replace(destination);
    router.refresh();
  }

  if (error) {
    return <p className="px-4 py-16 text-center text-sm text-destructive">{error}</p>;
  }
  if (!destination) {
    return <p className="px-4 py-16 text-center text-muted-foreground">Signing you in…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:px-0">
      <p className="section-label">You are in</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
        Set a password for next time
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You can keep using Google, or log in with {email} and a password.
      </p>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <SetPasswordForm onDone={go} onSkip={go} />
      </div>
    </div>
  );
}
