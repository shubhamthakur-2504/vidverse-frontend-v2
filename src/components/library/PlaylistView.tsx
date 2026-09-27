"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Play, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import playlistApi from '@/lib/api/client/playlistApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { formatTimeAgo } from '@/lib/utils'
import type { PlaylistDetails } from '@/lib/types/libraryType'
import { ConfirmDialog, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { buttonGhost, buttonPrimary, buttonSecondary, card, fieldInput, fieldLabel } from '@/components/studio/styles'
import { VideoRow } from './VideoRow'

export function PlaylistView({ playlist: initial }: { playlist: PlaylistDetails }) {
  const router = useRouter()
  const [playlist, setPlaylist] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [first] = playlist.videos
  const count = playlist.videos.length

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      await playlistApi.update(playlist._id, { title: title.trim(), description: description.trim() })
      setPlaylist((current) => ({ ...current, title: title.trim(), description: description.trim() }))
      setEditing(false)
      toast.success('Playlist updated')
    } catch (error: unknown) {
      toast.error('Could not update the playlist', { description: getApiErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const removeVideo = async (videoId: string) => {
    const before = playlist.videos
    setPlaylist((current) => ({ ...current, videos: current.videos.filter((v) => v._id !== videoId) }))
    try {
      await playlistApi.removeVideo(playlist._id, videoId)
    } catch (error: unknown) {
      setPlaylist((current) => ({ ...current, videos: before }))
      toast.error('Could not remove the video', { description: getApiErrorMessage(error) })
    }
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await playlistApi.delete(playlist._id)
      toast.success('Playlist deleted')
      router.push('/playlists')
      router.refresh()
    } catch (error: unknown) {
      toast.error('Could not delete the playlist', { description: getApiErrorMessage(error) })
      setDeleting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <aside className={`${card} h-fit overflow-hidden lg:sticky lg:top-24`}>
        <div className="relative aspect-video bg-elevated">
          {playlist.thumbnailUrl && <Image src={playlist.thumbnailUrl} alt="" fill priority sizes="360px" className="object-cover" />}
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-fg">{playlist.title}</h1>
            <Link href={`/channel/${playlist.owner.userName}`} className="mt-1 block w-fit text-sm text-fg-secondary hover:text-fg">
              {playlist.owner.fullName}
            </Link>
            <p className="mt-1 text-xs text-fg-tertiary">
              {count} {count === 1 ? 'video' : 'videos'} · Updated {formatTimeAgo(playlist.updatedAt)}
            </p>
          </div>
          {playlist.description && <p className="whitespace-pre-wrap text-sm text-fg-secondary">{playlist.description}</p>}
          <div className="flex flex-wrap gap-2">
            {first && (
              <Link href={`/watch/${first._id}`} className={buttonPrimary}>
                <Play className="h-4 w-4" aria-hidden />
                Play all
              </Link>
            )}
            {playlist.isOwner && (
              <>
                <button type="button" onClick={() => setEditing(true)} className={buttonSecondary}>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit
                </button>
                <button type="button" onClick={() => setConfirmingDelete(true)} className={`${buttonSecondary} hover:text-danger`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <section aria-label="Videos in this playlist">
        {count === 0 ? (
          <p className="py-16 text-center text-sm text-fg-secondary">This playlist has no videos you can watch.</p>
        ) : (
          <ol className="space-y-1">
            {playlist.videos.map((video, index) => (
              <VideoRow
                key={video._id}
                video={video}
                position={index + 1}
                action={playlist.isOwner && (
                  <button type="button" onClick={() => removeVideo(video._id)} className={buttonGhost} aria-label={`Remove ${video.title} from the playlist`}>
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              />
            ))}
          </ol>
        )}
      </section>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogTitle>Edit playlist</DialogTitle>
          <DialogDescription>Playlists are public: anyone with the link can see them.</DialogDescription>
          <form onSubmit={save} className="mt-5 space-y-4">
            <div>
              <label htmlFor="playlist-title" className={fieldLabel}>Title</label>
              <input id="playlist-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={`${fieldInput} h-10`} />
            </div>
            <div>
              <label htmlFor="playlist-description" className={fieldLabel}>Description</label>
              <textarea id="playlist-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={4} className={`${fieldInput} resize-y py-2`} />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose className={buttonSecondary}>Cancel</DialogClose>
              <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete playlist?"
        description={<>&ldquo;{playlist.title}&rdquo; will be deleted. The videos in it are not affected.</>}
        busy={deleting}
        onConfirm={remove}
      />
    </div>
  )
}
