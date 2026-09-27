import Link from 'next/link'
import { videoApi } from '@/lib/api/server/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import type { StudioVideo } from '@/lib/types/studioType'
import { VideoEditor } from '@/components/studio/VideoEditor'

export default async function StudioVideoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params
  const [videoRes, categoriesRes] = await Promise.allSettled([videoApi.getMyVideo(videoId), videoApi.getAllCategories()])

  let video: StudioVideo | null = null
  try {
    if (videoRes.status === 'fulfilled') video = unwrapApiResponse<StudioVideo>(videoRes.value)
  } catch {
    video = null
  }
  let categories = ['General']
  try {
    if (categoriesRes.status === 'fulfilled') categories = unwrapApiResponse<string[]>(categoriesRes.value)
  } catch { /* keep the fallback */ }

  if (!video) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-fg">Video not found</h2>
        <p className="mt-1 text-sm text-fg-secondary">It may have been deleted, or it belongs to another account.</p>
        <Link href="/studio" className="mt-6 inline-block text-sm font-medium text-brand-fg hover:underline">Back to your content</Link>
      </div>
    )
  }
  return <VideoEditor video={video} categories={categories} />
}
