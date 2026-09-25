import { Suspense } from 'react'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { VideoInfo } from '@/components/video/VideoInfo'
import { CommentSection } from '@/components/video/CommentSection'
import { RelatedVideos } from '@/components/video/RelatedVideos'
import { VideoPlayerSkeleton } from '@/components/video/VideoPlayerSkeleton'
import { videoApi } from '@/lib/api/server/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { Video } from '@/lib/types/videoType'
import Link from 'next/link'
import { Home, ChevronRight } from 'lucide-react'

type WatchPageParams = {
  params: { videoId: string } | Promise<{ videoId: string }>
}

export default async function WatchPage({ params }: WatchPageParams) {
  const resolvedParams = await Promise.resolve(params)
  const videoId: string = resolvedParams.videoId

  let videoData = null
  try {
    const res = await videoApi.getVideoDetails(videoId)
    videoData = unwrapApiResponse<Video>(res)
  } catch (error: unknown) {
    console.error('Failed to fetch video details.', error instanceof Error ? error.message : error)
  }

  if (videoData == null) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mx-auto">
            <span className="text-4xl">📹</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Video not found</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            This video may have been removed, made private, or the link might be incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full btn-gradient text-white text-sm font-semibold"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 pb-12">
      {/* Ambient background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb orb-purple w-[700px] h-[700px] -top-80 -left-64 opacity-30" />
        <div className="orb orb-cyan w-[500px] h-[500px] top-1/2 right-0 opacity-20" />
      </div>

      <div className="container mx-auto px-4 max-w-[1440px]">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/25 py-4 mb-2">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/50 truncate max-w-xs">{videoData.title}</span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">

          {/* Left — Primary content */}
          <div className="space-y-5 min-w-0">
            <Suspense fallback={<VideoPlayerSkeleton />}>
              <>
                {/* Video Player */}
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
                  <VideoPlayer
                    videoUrl={videoData.videoFileUrl}
                    thumbnail={videoData.thumbnailUrl}
                    videoId={videoId}
                  />
                </div>

                {/* Video Info */}
                <VideoInfo video={videoData} />

                {/* Divider */}
                <div className="h-px bg-white/[0.05]" />

                {/* Comments */}
                <CommentSection targetId={videoId} targetType="Video" />
              </>
            </Suspense>
          </div>

          {/* Right — Sidebar */}
          <div className="xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto pr-0.5">
            <RelatedVideos currentVideoId={videoId} />
          </div>
        </div>
      </div>
    </div>
  )
}