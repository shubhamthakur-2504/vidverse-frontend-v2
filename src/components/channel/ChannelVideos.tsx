"use client"

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { VideoCard } from '@/components/video/VideoCard'
import subscriptionApi from '@/lib/api/client/subscriptionApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import type { VideoSummary } from '@/lib/types/videoType'
import type { Page } from '@/lib/types/apiType'
import { buttonSecondary } from '@/components/studio/styles'

export function ChannelVideos({ userName, initial }: { userName: string; initial: Page<VideoSummary> }) {
  const [videos, setVideos] = useState(initial.items)
  const [cursor, setCursor] = useState(initial.nextCursor)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const page: Page<VideoSummary> = (await subscriptionApi.channelVideos(userName, cursor)).data.data
      setVideos((current) => [...current, ...page.items])
      setCursor(page.nextCursor)
    } catch (error: unknown) {
      toast.error('Could not load more videos', { description: getApiErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  if (videos.length === 0) {
    return <p className="py-16 text-center text-sm text-fg-secondary">This channel has no public videos yet.</p>
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video, index) => <VideoCard key={video._id} video={video} index={index} />)}
      </div>
      {cursor && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={loadMore} disabled={loading} className={buttonSecondary}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
