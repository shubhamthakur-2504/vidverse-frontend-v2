export function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse">
          {/* Thumbnail Skeleton */}
          <div className="aspect-video rounded-xl glass relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>

          {/* Info Skeleton */}
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full glass" />
            
            {/* Text */}
            <div className="flex-1 space-y-2">
              <div className="h-4 glass rounded w-full" />
              <div className="h-3 glass rounded w-3/4" />
              <div className="h-3 glass rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}