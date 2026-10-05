import type { ReactNode } from "react";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-muted/40 text-foreground">{children}</div>;
}
