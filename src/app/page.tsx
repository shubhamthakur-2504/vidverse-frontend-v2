import { Suspense } from 'react'
import { VideoGrid } from '@/components/video/VideoGrid'
import { VideoGridSkeleton } from '@/components/video/VideoGridSkeleton'
import { HeroSection } from '@/components/home/HeroSection'
import { videoApi } from '@/lib/api/server/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { Video } from '@/lib/types/videoType'

export default async function HomePage() {
  let videosData: Video [] = []
  try {
    const res = await videoApi.getAllVideos()
    videosData = unwrapApiResponse<Video[]>(res)
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    // tost implementation for error display can be added here
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      {/* <HeroSection /> */}

      {/* Videos Grid */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<VideoGridSkeleton />}>
          <VideoGrid videos={videosData} />
        </Suspense>
      </div>
    </div>
  )
}