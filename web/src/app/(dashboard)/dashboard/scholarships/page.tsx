import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Scholarships" };

export default function DashboardScholarshipsPage() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <p className="section-label">Scholarships</p>
      <h1 className="mt-3 text-2xl font-extrabold">Coming in the next phase</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        We will match scholarships you actually qualify for, with honest odds and
        deadline alerts. For now, keep building your program shortlist.
      </p>
      <Button asChild className="mt-5">
        <Link href="/dashboard/shortlist">Open shortlist</Link>
      </Button>
    </div>
  );
}
