import { Suspense } from "react";
import { InternshipsBrowser } from "@/components/internships/internships-browser";
import { InternshipPageSkeleton } from "@/components/ui/content-skeletons";

export const metadata = {
  title: "International Internships",
  description: "Discover verified international internships across Europe, Asia, the Middle East, and worldwide opportunities.",
};

export default function InternshipsPage() {
  return <Suspense fallback={<InternshipPageSkeleton />}><InternshipsBrowser /></Suspense>;
}
