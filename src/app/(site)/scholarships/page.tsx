import { Suspense } from "react";
import { ScholarshipsBrowser } from "@/components/scholarships/scholarships-browser";

export const metadata = {
  title: "Scholarships for Germany",
  description:
    "Find DAAD and other scholarships for students living in Pakistan, with honest odds.",
};

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center">Loading scholarships…</div>}>
      <ScholarshipsBrowser />
    </Suspense>
  );
}
