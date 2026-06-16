export function VideoPlayerSkeleton() {
  return (
    <div className="space-y-5">
      {/* Player Skeleton */}
      <div className="aspect-video rounded-2xl shimmer-container border border-white/[0.04]" />

      {/* Title skeleton */}
      <div className="space-y-2.5">
        <div className="h-6 shimmer-container rounded-lg w-4/5" />
        <div className="h-4 shimmer-container rounded-md w-2/5" />
      </div>

      {/* Channel + actions skeleton */}
      <div className="flex items-center justify-between py-4 border-y border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full shimmer-container" />
          <div className="space-y-2">
            <div className="h-4 shimmer-container rounded-md w-28" />
            <div className="h-3 shimmer-container rounded-md w-20" />
          </div>
          <div className="h-9 w-24 shimmer-container rounded-full ml-3" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 shimmer-container rounded-full" />
          <div className="h-9 w-20 shimmer-container rounded-full" />
        </div>
      </div>

      {/* Description skeleton */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-2">
        <div className="h-3 shimmer-container rounded w-full" />
        <div className="h-3 shimmer-container rounded w-5/6" />
        <div className="h-3 shimmer-container rounded w-4/6" />
      </div>
    </div>
  )
}