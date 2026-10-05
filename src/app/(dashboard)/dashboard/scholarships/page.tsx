import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listSavedScholarships } from "@/lib/db/saved-scholarships";
import { Button } from "@/components/ui/button";
import { SavedScholarshipsManager } from "@/components/dashboard/saved-scholarships-manager";

export const metadata = { title: "Saved scholarships" };

function nextDeadline(
  cycles: { closeAt: string | null }[] | undefined
): string | null {
  if (!cycles?.length) return null;
  return (
    cycles
      .map((c) => c.closeAt)
      .filter((d): d is string => Boolean(d))
      .sort()[0] ?? null
  );
}

export default async function DashboardScholarshipsPage() {
  const session = await getSession();
  if (!session) return null;

  const items = await listSavedScholarships(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Scholarships</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          Saved scholarships
        </h1>
        <p className="mt-1 text-muted-foreground">
          Deadlines and amounts for funding you want to track.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            No saved scholarships yet. Browse the list and tap Save.
          </p>
          <Button asChild className="mt-4">
            <Link href="/scholarships">Browse scholarships</Link>
          </Button>
        </div>
      ) : (
        <SavedScholarshipsManager
          initialItems={items.map((item) => ({
            id: item.id,
            scholarshipId: item.scholarshipId,
            name: item.scholarship?.name ?? "Scholarship",
            provider: item.scholarship?.provider ?? "",
            amount: item.scholarship?.amountSummary ?? "",
            deadline: nextDeadline(item.scholarship?.cycles),
          }))}
        />
      )}
    </div>
  );
}
