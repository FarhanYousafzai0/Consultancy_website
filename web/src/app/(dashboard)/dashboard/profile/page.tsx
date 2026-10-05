import Link from "next/link";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  profileToAnswers,
} from "@/lib/db/student-profile";
import { emptyAnswers } from "@/lib/eligibility/types";

export const metadata = { title: "Profile" };

export default async function DashboardProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const profile = await getStudentProfile(session.userId);
  const initial = profile ? profileToAnswers(profile) : emptyAnswers();

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Profile</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
          Your education profile
        </h1>
        <p className="mt-1 text-muted-foreground">
          Each field unlocks better matches. Prefer the guided check?{" "}
          <Link href="/check" className="font-semibold text-forest underline">
            Re-run eligibility
          </Link>
        </p>
      </div>

      <ProfileEditor initial={initial} />

      <Button asChild variant="outline">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
