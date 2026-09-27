import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { channelApi } from '@/lib/api/server/channelApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import type { Channel, ChannelPlaylist } from '@/lib/types/channelType'
import type { VideoSummary } from '@/lib/types/videoType'
import type { Page } from '@/lib/types/apiType'
import { ChannelHeader } from '@/components/channel/ChannelHeader'
import { ChannelVideos } from '@/components/channel/ChannelVideos'
import { ChannelPlaylists } from '@/components/channel/ChannelPlaylists'

type ChannelPageProps = {
  params: Promise<{ userName: string }>
  searchParams: Promise<{ tab?: string }>
}

// shared by generateMetadata and the page, so the header is fetched once per request
const loadChannel = cache(async (userName: string): Promise<Channel | null> => {
  try {
    return unwrapApiResponse<Channel>(await channelApi.getChannel(userName))
  } catch {
    return null
  }
})

const TABS = [
  { id: 'videos', label: 'Videos' },
  { id: 'playlists', label: 'Playlists' },
] as const

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  const { userName } = await params
  const channel = await loadChannel(decodeURIComponent(userName))
  return { title: channel ? `${channel.fullName} (@${channel.userName}) | VidVerse` : 'Channel not found | VidVerse' }
}

export default async function ChannelPage({ params, searchParams }: ChannelPageProps) {
  const { userName: rawUserName } = await params
  const userName = decodeURIComponent(rawUserName)
  const tab = (await searchParams).tab === 'playlists' ? 'playlists' : 'videos'

  const channel = await loadChannel(userName)
  if (!channel) notFound()

  let videos: Page<VideoSummary> = { items: [], nextCursor: null }
  let playlists: ChannelPlaylist[] = []
  try {
    if (tab === 'videos') videos = unwrapApiResponse<Page<VideoSummary>>(await channelApi.getVideos(channel.userName))
    else playlists = unwrapApiResponse<ChannelPlaylist[]>(await channelApi.getPlaylists(channel.userName))
  } catch { /* the tab shows its empty state */ }

  return (
    <div className="container mx-auto min-h-screen px-4 pb-16 pt-24">
      <ChannelHeader key={channel._id} channel={channel} />

      <nav aria-label="Channel sections" className="mt-8 flex gap-6 border-b border-line">
        {TABS.map(({ id, label }) => (
          <Link
            key={id}
            href={id === 'videos' ? `/channel/${channel.userName}` : `/channel/${channel.userName}?tab=${id}`}
            aria-current={tab === id ? 'page' : undefined}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${tab === id ? 'border-brand-fg text-fg' : 'border-transparent text-fg-secondary hover:text-fg'}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <section className="mt-8">
        {tab === 'videos'
          ? <ChannelVideos key={channel.userName} userName={channel.userName} initial={videos} />
          : <ChannelPlaylists playlists={playlists} />}
      </section>
    </div>
  )
}
