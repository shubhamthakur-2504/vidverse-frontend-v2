import { Skeleton } from "@/components/ui/skeleton";

export function VideoPlayerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-7 w-4/5" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="ml-2 h-9 w-28 rounded-full" />
        </div>
        <div className="hidden gap-2 sm:flex">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 rounded-lg bg-surface p-3">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}
