import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Alerts" };

export default function DashboardAlertsPage() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <p className="section-label">Alerts</p>
      <h1 className="mt-3 text-2xl font-extrabold">Email reminders soon</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Deadline emails for shortlisted programs and saved scholarships are
        planned for Build Phase 2.
      </p>
      <Button asChild className="mt-5" variant="outline">
        <Link href="/dashboard">Back to home</Link>
      </Button>
    </div>
  );
}
