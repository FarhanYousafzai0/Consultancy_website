"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <SmoothScroll>{children}</SmoothScroll>
    </NuqsAdapter>
  );
}
