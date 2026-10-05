import type { ReactNode } from "react";

/** Admin pages query MongoDB — skip static prerender during Vercel build. */
export const dynamic = "force-dynamic";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-muted/40 text-foreground">{children}</div>;
}
