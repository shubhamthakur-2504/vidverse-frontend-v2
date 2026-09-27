"use client"

import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import playlistApi from '@/lib/api/client/playlistApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import type { MyPlaylist } from '@/lib/types/libraryType'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { buttonPrimary, fieldInput } from '@/components/studio/styles'

type Props = { videoId: string; open: boolean; onOpenChange: (open: boolean) => void }

// ticks add or remove the video right away; a new playlist starts with this video
export function SaveToPlaylistDialog({ videoId, open, onOpenChange }: Props) {
  const [playlists, setPlaylists] = useState<MyPlaylist[] | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    playlistApi.mine(videoId)
      .then((res) => { if (!cancelled) setPlaylists(res.data.data) })
      .catch((error: unknown) => {
        if (cancelled) return
        setPlaylists([])
        toast.error('Could not load your playlists', { description: getApiErrorMessage(error) })
      })
    return () => { cancelled = true }
  }, [open, videoId])

  const toggle = async (playlist: MyPlaylist) => {
    const adding = !playlist.hasVideo
    const flip = (hasVideo: boolean, delta: number) => setPlaylists((current) =>
      current?.map((p) => (p._id === playlist._id ? { ...p, hasVideo, videoCount: p.videoCount + delta } : p)) ?? null)
    setPending(playlist._id)
    flip(adding, adding ? 1 : -1)
    try {
      await (adding ? playlistApi.addVideo(playlist._id, videoId) : playlistApi.removeVideo(playlist._id, videoId))
      toast.success(adding ? `Saved to ${playlist.title}` : `Removed from ${playlist.title}`)
    } catch (error: unknown) {
      flip(!adding, adding ? -1 : 1)
      toast.error('Could not update the playlist', { description: getApiErrorMessage(error) })
    } finally {
      setPending(null)
    }
  }

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const created = (await playlistApi.create({ videoId, title: title.trim() })).data.data
      setPlaylists((current) => [{ ...created, videoCount: 1, hasVideo: true }, ...(current ?? [])])
      setTitle('')
      toast.success(`Saved to ${created.title}`)
    } catch (error: unknown) {
      toast.error('Could not create the playlist', { description: getApiErrorMessage(error) })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Save to playlist</DialogTitle>
        <DialogDescription>Playlists are public on your channel.</DialogDescription>

        <div className="mt-5 max-h-72 overflow-y-auto">
          {playlists === null ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-fg-tertiary" aria-label="Loading" /></div>
          ) : playlists.length === 0 ? (
            <p className="py-4 text-sm text-fg-secondary">You have no playlists yet. Create one below.</p>
          ) : (
            <ul className="space-y-1">
              {playlists.map((playlist) => (
                <li key={playlist._id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-fg transition-colors hover:bg-surface">
                    <input
                      type="checkbox"
                      checked={Boolean(playlist.hasVideo)}
                      disabled={pending === playlist._id}
                      onChange={() => toggle(playlist)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="min-w-0 flex-1 truncate">{playlist.title}</span>
                    <span className="text-xs tabular-nums text-fg-tertiary">{playlist.videoCount}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={create} className="mt-4 flex gap-2 border-t border-line pt-4">
          <label htmlFor="new-playlist" className="sr-only">New playlist title</label>
          <input
            id="new-playlist"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="New playlist title"
            className={`${fieldInput} h-9 flex-1`}
          />
          <button type="submit" disabled={!title.trim() || creating} className={buttonPrimary}>
            <Plus className="h-4 w-4" aria-hidden />
            Create
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
