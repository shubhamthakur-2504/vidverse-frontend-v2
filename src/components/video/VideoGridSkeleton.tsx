import { Skeleton } from "@/components/ui/skeleton";

import { VIDEO_GRID_CLASS } from "./gridClass";

/** One placeholder card, shaped exactly like a real one so nothing shifts. */
export function VideoCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="flex gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2 pt-0.5">
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={VIDEO_GRID_CLASS}>
      {Array.from({ length: count }, (_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  );
}
