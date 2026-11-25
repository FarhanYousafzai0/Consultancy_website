"use client";

import { safeNext } from "@/lib/auth/finish-login-path";
import { syncLocalProfileToServer } from "@/lib/auth/sync-profile";
import {
  isProfileComplete,
  selectAnswers,
  useEligibilityStore,
} from "@/lib/eligibility";

export type LoginState = {
  role: "admin" | "user";
  hasPassword: boolean;
};

/** Runs after any successful sign-in: syncs answers and reads the account. */
export async function loadLoginState(): Promise<LoginState | null> {
  await syncLocalProfileToServer().catch(() => false);
  const [profileRes, passwordRes] = await Promise.all([
    fetch("/api/me/profile", { cache: "no-store" }),
    fetch("/api/me/password", { cache: "no-store" }),
  ]);
  if (!profileRes.ok) return null;
  const profile = (await profileRes.json()) as { session?: { role?: string } };
  const password = passwordRes.ok
    ? ((await passwordRes.json()) as { hasPassword?: boolean })
    : { hasPassword: true };
  return {
    role: profile.session?.role === "admin" ? "admin" : "user",
    hasPassword: Boolean(password.hasPassword),
  };
}

/** Where to send someone once they are signed in. */
export function destinationAfterLogin(role: "admin" | "user", next: string) {
  if (role === "admin") return "/admin/programs";
  const answers = selectAnswers(useEligibilityStore.getState());
  if (isProfileComplete(answers) || answers.goal) {
    return safeNext(next);
  }
  return "/check";
}

export { safeNext };
