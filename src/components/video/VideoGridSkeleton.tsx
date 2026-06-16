export function VideoGridSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-4 h-4 rounded shimmer-container" />
        <div className="w-28 h-4 rounded-full shimmer-container" />
        <div className="flex-1 h-px bg-white/[0.04]" />
        <div className="w-16 h-3 rounded-full shimmer-container" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            {/* Thumbnail Skeleton */}
            <div className="aspect-video rounded-2xl shimmer-container border border-white/[0.04]" />

            {/* Info skeleton */}
            <div className="flex gap-3 px-0.5">
              <div className="h-8 w-8 rounded-full shimmer-container flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2 pt-0.5">
                <div className="h-3.5 shimmer-container rounded-md w-full" />
                <div className="h-3 shimmer-container rounded-md w-3/4" />
                <div className="h-2.5 shimmer-container rounded-md w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}