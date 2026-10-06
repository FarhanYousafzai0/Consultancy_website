import { getSession } from "@/lib/auth/session";
import { getStudentProfile } from "@/lib/db/student-profile";
import { AfterAdmissionChecklist } from "@/components/dashboard/after-admission-checklist";

export const metadata = { title: "Next steps" };

export default async function NextStepsPage() {
  const session = await getSession();
  if (!session) return null;

  const profile = await getStudentProfile(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Dashboard</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          Next steps to Germany
        </h1>
        <p className="mt-1 text-muted-foreground">
          Checklist for APS, blocked account, insurance, visa, housing, and
          Anmeldung — with disclosed partner offers where relevant.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <AfterAdmissionChecklist
          initialCompleted={profile?.afterAdmissionCompleted ?? []}
        />
      </section>
    </div>
  );
}
