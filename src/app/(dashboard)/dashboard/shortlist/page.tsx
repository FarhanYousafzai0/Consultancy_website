import Link from "next/link";
import { ShortlistManager } from "@/components/dashboard/shortlist-manager";
import { getSession } from "@/lib/auth/session";
import {
  listShortlist,
  resolveDeadline,
} from "@/lib/db/shortlist";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Applications" };

export default async function DashboardShortlistPage() {
  const session = await getSession();
  if (!session) return null;

  const items = await listShortlist(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Applications</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          Track your applications
        </h1>
        <p className="mt-1 text-muted-foreground">
          Status, document checklists, and deadlines for every saved program.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            No applications yet. Open a program and tap Save to shortlist to
            start tracking.
          </p>
          <Button asChild className="mt-4">
            <Link href="/programs">Browse programs</Link>
          </Button>
        </div>
      ) : (
        <ShortlistManager
          initialItems={items.map((item) => ({
            id: item.id,
            programId: item.programId,
            name: item.program?.name ?? "Program",
            university: item.program?.university ?? "",
            city: item.program?.city ?? "",
            status: item.status,
            completedDocuments: item.completedDocuments,
            targetIntake: item.targetIntake,
            documents: item.program?.requiredDocuments ?? [],
            intakes: item.program?.intakes ?? [],
            deadline: resolveDeadline(item),
          }))}
        />
      )}
    </div>
  );
}
