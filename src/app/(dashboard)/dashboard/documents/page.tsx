import { getSession } from "@/lib/auth/session";
import { getStudentProfile } from "@/lib/db/student-profile";
import { SopReviewForm } from "@/components/dashboard/sop-review-form";
import { AnalysesPanel } from "@/components/dashboard/analyses-panel";
import { redirect } from "next/navigation";

export const metadata = { title: "Documents · SOP review" };

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/documents");
  const profile = await getStudentProfile(session.userId);
  const unlocked =
    Boolean(profile?.sopReviewUnlocked) || (profile?.aiCredits ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
          Documents
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] md:text-3xl">
          Motivation letter review
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Spend 1 AI credit or unlock via WhatsApp payment. Critique only — we do
          not write a full letter for you to submit.
        </p>
      </div>
      <SopReviewForm unlocked={unlocked} credits={profile?.aiCredits ?? 0} />
      <AnalysesPanel
        initialCredits={profile?.aiCredits ?? 0}
        freeAnalysisUsed={profile?.freeAnalysisUsed ?? false}
      />
    </div>
  );
}
