import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { libraryApi } from '@/lib/api/server/libraryApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import type { PlaylistDetails } from '@/lib/types/libraryType'
import { PlaylistView } from '@/components/library/PlaylistView'

type PlaylistPageProps = { params: Promise<{ id: string }> }

// shared by generateMetadata and the page, so the playlist is fetched once per request
const loadPlaylist = cache(async (id: string): Promise<PlaylistDetails | null> => {
  try {
    return unwrapApiResponse<PlaylistDetails>(await libraryApi.getPlaylist(id))
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const playlist = await loadPlaylist((await params).id)
  return { title: playlist ? `${playlist.title} · VidVerse` : 'Playlist not found · VidVerse' }
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const playlist = await loadPlaylist((await params).id)
  if (!playlist) notFound()

  return (
    <div className="min-h-screen bg-bg pt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PlaylistView key={playlist._id} playlist={playlist} />
      </div>
    </div>
  )
}
