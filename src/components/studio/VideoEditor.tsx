"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ImagePlus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import videoApi from '@/lib/api/client/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import type { StudioVideo } from '@/lib/types/studioType'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { ConfirmDialog } from '@/components/ui/dialog'
import { StatusBadge } from './StatusBadge'
import { buttonGhost, buttonPrimary, buttonSecondary, card, fieldInput, fieldLabel } from './styles'

const IMAGE_TYPES = 'image/jpeg,image/png,image/webp'

export function VideoEditor({ video: initial, categories }: { video: StudioVideo; categories: string[] }) {
  const router = useRouter()
  const [video, setVideo] = useState(initial)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description ?? '')
  const [category, setCategory] = useState(initial.category)
  const [isPublished, setIsPublished] = useState(initial.isPublished)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const thumbnailPreview = useMemo(() => (thumbnail ? URL.createObjectURL(thumbnail) : null), [thumbnail])
  useEffect(() => () => { if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview) }, [thumbnailPreview])

  const dirty =
    title.trim() !== video.title ||
    description.trim() !== (video.description ?? '') ||
    category !== video.category ||
    isPublished !== video.isPublished ||
    thumbnail !== null

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const form = new FormData()
      form.append('title', title.trim())
      form.append('description', description.trim())
      form.append('category', category)
      form.append('isPublished', String(isPublished))
      if (thumbnail) form.append('thumbnail', thumbnail)
      await videoApi.update(form, video._id)
      const latest = unwrapApiResponse<StudioVideo>((await videoApi.getMyVideo(video._id)).data)
      setVideo(latest)
      setThumbnail(null)
      toast.success('Changes saved')
    } catch (error: unknown) {
      toast.error('Could not save changes', { description: getApiErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await videoApi.delete(video._id)
      toast.success('Video deleted')
      router.push('/studio')
      router.refresh()
    } catch (error: unknown) {
      toast.error('Could not delete the video', { description: getApiErrorMessage(error) })
      setDeleting(false)
    }
  }

  const shownThumbnail = thumbnailPreview ?? video.thumbnailUrl

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/studio" className={buttonGhost}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to content
        </Link>
        <StatusBadge status={video.status} />
      </div>

      <form onSubmit={save} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className={fieldLabel}>Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={`${fieldInput} h-10`} />
          </div>
          <div>
            <label htmlFor="description" className={fieldLabel}>Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={8} className={`${fieldInput} resize-y py-2`} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={fieldLabel}>Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${fieldInput} h-10`}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="visibility" className={fieldLabel}>Visibility</label>
              <select id="visibility" value={isPublished ? 'public' : 'private'} onChange={(e) => setIsPublished(e.target.value === 'public')} className={`${fieldInput} h-10`}>
                <option value="public">Public: anyone can watch</option>
                <option value="private">Private: only you</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-6">
            <button type="submit" disabled={!dirty || saving} className={buttonPrimary}>
              <Save className="h-4 w-4" aria-hidden />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" onClick={() => setConfirmingDelete(true)} className={`${buttonSecondary} ml-auto hover:text-danger`}>
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete video
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className={`${card} overflow-hidden`}>
            {video.status === 'ready' ? (
              // owner preview: no videoId, so it is not counted as a view
              <VideoPlayer key={video._id} videoUrl={video.videoFileUrl} thumbnail={video.thumbnailUrl} />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-elevated px-6 text-center text-sm text-fg-tertiary">
                {video.status === 'processing' ? 'Preview is available once processing finishes.' : 'Processing failed. Retry it from your content list.'}
              </div>
            )}
            <div className="p-4 text-sm">
              <p className="text-fg-tertiary">Video link</p>
              <Link href={`/watch/${video._id}`} className="break-all text-brand-fg hover:underline">/watch/{video._id}</Link>
            </div>
          </div>

          <div>
            <p className={fieldLabel}>Thumbnail</p>
            <label className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-line-default bg-surface transition-colors hover:border-line-strong">
              <input type="file" accept={IMAGE_TYPES} className="sr-only" onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} />
              {shownThumbnail ? (
                thumbnailPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object url preview
                  <img src={thumbnailPreview} alt="New thumbnail preview" className="h-full w-full object-cover" />
                ) : (
                  <Image src={shownThumbnail} alt="Current thumbnail" fill sizes="360px" className="object-cover" />
                )
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-fg-tertiary"><ImagePlus className="h-6 w-6" aria-hidden />Add a thumbnail</span>
              )}
            </label>
            <p className="mt-2 text-xs text-fg-tertiary">{thumbnail ? `New: ${thumbnail.name} (saved with the other changes)` : 'Click to replace.'}</p>
          </div>
        </aside>
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete video?"
        description={<>&ldquo;{video.title}&rdquo; and its comments, likes and views will be removed permanently.</>}
        busy={deleting}
        onConfirm={remove}
      />
    </div>
  )
}
