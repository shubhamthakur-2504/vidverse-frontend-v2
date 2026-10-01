import { Skeleton } from "@/components/ui/skeleton";
import { VideoGridSkeleton } from "@/components/video/VideoGridSkeleton";

export default function HomeLoading() {
  return (
    <>
      <div className="flex gap-2 px-4 py-3 md:px-6 xl:px-8">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="px-4 pb-12 md:px-6 xl:px-8">
        <VideoGridSkeleton />
      </div>
    </>
  );
}
