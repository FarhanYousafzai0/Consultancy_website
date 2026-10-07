import { Suspense } from "react";
import { ProgramsBrowser } from "@/components/programs/programs-browser";
import { ProgramsBrowseSkeleton } from "@/components/ui/content-skeletons";

export const metadata = {
  title: "International programmes",
  description:
    "Browse programmes Parwaaz has verified for Pakistani students — English and German-taught, public and private. Full DAAD catalogue linked for everything else.",
};

export default function ProgramsPage() {
  return (
    <Suspense fallback={<ProgramsBrowseSkeleton />}>
      <ProgramsBrowser />
    </Suspense>
  );
}
