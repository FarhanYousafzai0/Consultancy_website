import { ScholarshipShowcase } from "@/components/scholarships/scholarship-showcase";
import { Suspense } from "react";

export const metadata = {
  title: "Scholarship Finder",
  description:
    "Explore scholarships for Bachelor's, Master's, and PhD study. Search by level, subject, funding, and deadline.",
};

export default function ScholarshipsPage() {
  return <Suspense fallback={<p className="p-12 text-center">Loading scholarships…</p>}><ScholarshipShowcase /></Suspense>;
}
