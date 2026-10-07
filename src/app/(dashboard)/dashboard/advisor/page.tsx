import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getStudentProfile } from "@/lib/db/student-profile";
import { AnalysesPanel } from "@/components/dashboard/analyses-panel";

export const metadata = { title: "Advisor" };

export default async function DashboardAdvisorPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/advisor");
  const profile = await getStudentProfile(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
          Advisor
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] md:text-3xl">
          Ask Parwaaz
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Use the floating <strong>Ask Parwaaz</strong> button for streaming chat.
          Answers come from verified programs, scholarships, and guides — with
          structured cards and sources.
        </p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm text-muted-foreground">
          Tip: complete your profile first so eligibility checks in chat use your
          real grades and language scores.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/profile">Update profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/guides">Browse guides</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">SOP review</Link>
          </Button>
        </div>
      </div>
      <AnalysesPanel
        initialCredits={profile?.aiCredits ?? 0}
        freeAnalysisUsed={profile?.freeAnalysisUsed ?? false}
      />
    </div>
  );
}
