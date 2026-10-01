import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayerSkeleton } from "@/components/video/VideoPlayerSkeleton";

export default function WatchLoading() {
  return (
    <div className="mx-auto max-w-400 px-4 py-4 pb-12 md:px-6 xl:px-8">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
        <div className="min-w-0">
          <VideoPlayerSkeleton />
        </div>
        <div className="hidden min-w-0 flex-col gap-2 xl:flex">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex gap-3 p-2">
              <Skeleton className="aspect-video w-42 shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
