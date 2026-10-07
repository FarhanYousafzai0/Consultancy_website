import { Suspense } from "react";
import { ScholarshipsBrowser } from "@/components/scholarships/scholarships-browser";
import { ScholarshipsBrowseSkeleton } from "@/components/ui/content-skeletons";

export const metadata = {
  title: "Scholarships for Germany",
  description:
    "Find DAAD and other scholarships for students living in Pakistan, with honest odds.",
};

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={<ScholarshipsBrowseSkeleton />}>
      <ScholarshipsBrowser />
    </Suspense>
  );
}
