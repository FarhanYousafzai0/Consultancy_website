"use client";

import { selectAnswers, useEligibilityStore } from "@/lib/eligibility";

/** Sync browser eligibility answers to the server profile after login/signup. */
export async function syncLocalProfileToServer(): Promise<boolean> {
  const answers = selectAnswers(useEligibilityStore.getState());
  if (!answers.goal) return false;
  const res = await fetch("/api/me/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  return res.ok;
}
