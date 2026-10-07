import { Suspense } from "react";
import { ProgramsBrowser } from "@/components/programs/programs-browser";
import { ProgramsBrowseSkeleton } from "@/components/ui/content-skeletons";

export const metadata = {
  title: "International programmes",
  description:
    "Search international programmes in Germany — course type, language, and subject — with public and private universities marked.",
};

export default function ProgramsPage() {
  return (
    <Suspense fallback={<ProgramsBrowseSkeleton />}>
      <ProgramsBrowser />
    </Suspense>
  );
}
