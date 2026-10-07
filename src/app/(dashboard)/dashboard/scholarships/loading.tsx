import { ScholarshipCardSkeletonList } from "@/components/ui/content-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-9 w-64 max-w-full" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </div>
      <ScholarshipCardSkeletonList count={3} />
    </div>
  );
}
