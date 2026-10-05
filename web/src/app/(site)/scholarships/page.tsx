import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Scholarships" };

export default function ScholarshipsPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <p className="section-label">Scholarships</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
        Scholarship matching is next
      </h1>
      <p className="mt-3 text-muted-foreground">
        We are building a verified scholarship database with honest eligibility
        odds. Meanwhile, start with programs you can actually get into.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/programs">Browse programs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/check">Check eligibility</Link>
        </Button>
      </div>
    </div>
  );
}
