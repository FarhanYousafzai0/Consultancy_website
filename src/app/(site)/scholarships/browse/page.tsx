import { Suspense } from "react";
import { ScholarshipsBrowser } from "@/components/scholarships/scholarships-browser";
import { ScholarshipsBrowseSkeleton } from "@/components/ui/content-skeletons";

export const metadata = { title: "Browse scholarships" };

export default function ScholarshipBrowsePage() {
  return <Suspense fallback={<ScholarshipsBrowseSkeleton />}><ScholarshipsBrowser /></Suspense>;
}
