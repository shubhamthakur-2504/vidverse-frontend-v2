"use client"

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { VideoCard } from '@/components/video/VideoCard'
import { VideoRow } from '@/components/library/VideoRow'
import subscriptionApi from '@/lib/api/client/subscriptionApi'
import videoApi from '@/lib/api/client/videoApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import type { SearchFilters } from '@/lib/search'
import type { VideoSummary } from '@/lib/types/videoType'
import type { Page } from '@/lib/types/apiType'
import { buttonSecondary } from '@/components/studio/styles'

// which list the next pages come from (functions cannot be passed from server components, so this names it)
export type VideoSource =
  | { kind: 'channel'; userName: string }
  | { kind: 'subscriptions' }
  | { kind: 'search'; filters: SearchFilters }

const fetchPage = (source: VideoSource, cursor: string) => {
  switch (source.kind) {
    case 'channel': return subscriptionApi.channelVideos(source.userName, cursor)
    case 'subscriptions': return subscriptionApi.feed(cursor)
    case 'search': return videoApi.search(source.filters, cursor)
  }
}

// a server-rendered first page of videos, as cards or (search results) rows, with "Load more" for the rest
export function PagedVideoGrid({ source, initial, emptyMessage, layout = 'grid' }: {
  source: VideoSource
  initial: Page<VideoSummary>
  emptyMessage: React.ReactNode
  layout?: 'grid' | 'list'
}) {
  const [videos, setVideos] = useState(initial.items)
  const [cursor, setCursor] = useState(initial.nextCursor)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const page: Page<VideoSummary> = (await fetchPage(source, cursor)).data.data
      setVideos((current) => [...current, ...page.items])
      setCursor(page.nextCursor)
    } catch (error: unknown) {
      toast.error('Could not load more videos', { description: getApiErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  if (videos.length === 0) {
    return <div className="py-16 text-center text-sm text-fg-secondary">{emptyMessage}</div>
  }

  return (
    <div>
      {layout === 'list' ? (
        <ul className="flex flex-col gap-2">
          {videos.map((video) => <VideoRow key={video._id} video={video} size="lg" />)}
        </ul>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video, index) => <VideoCard key={video._id} video={video} index={index} />)}
        </div>
      )}
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
