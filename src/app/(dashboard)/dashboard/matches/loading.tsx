import { ProgramCardSkeletonList } from "@/components/ui/content-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-9 w-72 max-w-full" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
      <ProgramCardSkeletonList count={4} />
    </div>
  );
}
