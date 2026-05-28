import { Suspense } from 'react'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { VideoInfo } from '@/components/video/VideoInfo'
import { CommentSection } from '@/components/video/CommentSection'
import { RelatedVideos } from '@/components/video/RelatedVideos'
import { VideoPlayerSkeleton } from '@/components/video/VideoPlayerSkeleton'
import { videoApi } from '@/lib/api/server/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { Video } from '@/lib/types/videoType'

export default async function WatchPage({ params }: { params: any }) {
  // `params` can be a Promise in some Next.js internals — resolve safely
  const resolvedParams = await Promise.resolve(params)
  const videoId: string = resolvedParams.videoId

  let videoData = null
  try {
    const res = await videoApi.getVideoDetails(videoId)
    videoData = unwrapApiResponse<Video>(res)
  } catch (error: any) {
    console.error('Failed to fetch video details.', error?.message || error)
  }

  if (videoData == null) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <p className="text-muted-foreground">This video may have been removed or is private.</p>
        </div>
      </div>
    )
  }

  // videoData is available — render page
  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <Suspense fallback={<VideoPlayerSkeleton />}>
              <VideoPlayer 
                videoUrl={videoData.videoFileUrl}
                thumbnail={videoData.thumbnailUrl}
              />
            </Suspense>

            {/* Video Info */}
            <VideoInfo video={videoData} />

            {/* Comments Section */}
            <CommentSection targetId={videoId} targetType="Video" />
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <RelatedVideos currentVideoId={videoId} />
          </div>
        </div>
      </div>
    </div>
  )
}