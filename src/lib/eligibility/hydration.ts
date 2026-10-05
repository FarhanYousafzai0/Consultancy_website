"use client";

import { useSyncExternalStore } from "react";
import { useEligibilityStore } from "./store";

export function useEligibilityHydrated() {
  return useSyncExternalStore(
    (onStoreChange) =>
      useEligibilityStore.persist.onFinishHydration(onStoreChange),
    () => useEligibilityStore.persist.hasHydrated(),
    () => false
  );
}
