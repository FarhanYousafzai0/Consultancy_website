import { Suspense } from "react";
import { ScholarshipsBrowser } from "@/components/scholarships/scholarships-browser";

export const metadata = {
  title: "Scholarships",
  description:
    "German scholarships with honest odds for Pakistani students — DAAD, foundations, and more.",
};

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center">Loading scholarships…</div>}>
      <ScholarshipsBrowser />
    </Suspense>
  );
}
