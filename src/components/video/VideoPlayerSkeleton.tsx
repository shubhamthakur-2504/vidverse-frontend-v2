export function VideoPlayerSkeleton() {
  return (
    <div className="space-y-4">
      {/* Player Skeleton */}
      <div className="aspect-video rounded-xl glass relative overflow-hidden animate-pulse">
        <div className="absolute inset-0 shimmer" />
      </div>

      {/* Info Skeleton */}
      <div className="glass rounded-xl p-6 space-y-4 animate-pulse">
        <div className="h-7 glass rounded w-3/4" />
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full glass" />
          <div className="flex-1 space-y-2">
            <div className="h-4 glass rounded w-32" />
            <div className="h-3 glass rounded w-24" />
          </div>
          <div className="h-9 w-24 glass rounded-full" />
        </div>

        <div className="glass rounded-lg p-4 space-y-2">
          <div className="h-3 glass rounded w-full" />
          <div className="h-3 glass rounded w-5/6" />
          <div className="h-3 glass rounded w-4/6" />
        </div>
      </div>

      {/* Comments Skeleton */}
      <div className="glass rounded-xl p-6 space-y-4 animate-pulse">
        <div className="h-6 glass rounded w-32" />
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full glass" />
          <div className="flex-1 space-y-2">
            <div className="h-20 glass rounded w-full" />
            <div className="h-9 glass rounded w-24 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}