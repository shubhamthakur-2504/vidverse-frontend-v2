"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Pencil, Play, RotateCcw, Trash2, Upload, Film } from 'lucide-react'
import { toast } from 'sonner'
import videoApi from '@/lib/api/client/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { formatDuration, formatTimeAgo, formatViews } from '@/lib/utils'
import type { StudioOverview, StudioVideo } from '@/lib/types/studioType'
import { ConfirmDialog } from '@/components/ui/dialog'
import { StatusBadge } from './StatusBadge'
import { buttonGhost, buttonPrimary, card } from './styles'

const POLL_MS = 5000

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${card} p-4`}>
      <p className="text-xs font-medium text-fg-tertiary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">{formatViews(value)}</p>
    </div>
  )
}

export function StudioDashboard({ initial }: { initial: StudioOverview }) {
  const [overview, setOverview] = useState(initial)
  const [pendingDelete, setPendingDelete] = useState<StudioVideo | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const reload = async () => {
    const res = await videoApi.studio()
    setOverview(unwrapApiResponse<StudioOverview>(res.data))
  }

  // keep statuses fresh while anything is still being transcoded
  useEffect(() => {
    if (overview.processing === 0) return
    const timer = setInterval(() => { reload().catch(() => {}) }, POLL_MS)
    return () => clearInterval(timer)
  }, [overview.processing])

  const toggleVisibility = async (video: StudioVideo) => {
    setBusyId(video._id)
    try {
      await videoApi.setPublished(video._id, !video.isPublished)
      setOverview((o) => ({ ...o, videos: o.videos.map((v) => (v._id === video._id ? { ...v, isPublished: !v.isPublished } : v)) }))
      toast.success(video.isPublished ? 'Video is now private' : 'Video is now public')
    } catch (error: unknown) {
      toast.error('Could not change visibility', { description: getApiErrorMessage(error) })
    } finally {
      setBusyId(null)
    }
  }

  const retry = async (video: StudioVideo) => {
    setBusyId(video._id)
    try {
      await videoApi.reprocess(video._id)
      await reload()
      toast.success('Processing restarted')
    } catch (error: unknown) {
      toast.error('Could not restart processing', { description: getApiErrorMessage(error) })
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await videoApi.delete(pendingDelete._id)
      await reload()
      toast.success('Video deleted')
      setPendingDelete(null)
    } catch (error: unknown) {
      toast.error('Could not delete the video', { description: getApiErrorMessage(error) })
    } finally {
      setDeleting(false)
    }
  }

  const { totals, videos } = overview

  return (
    <div className="space-y-8">
      <section aria-label="Channel totals" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Views" value={totals.views} />
        <StatCard label="Subscribers" value={totals.subscribers} />
        <StatCard label="Videos" value={totals.videos} />
        <StatCard label="Likes" value={totals.likes} />
        <StatCard label="Comments" value={totals.comments} />
      </section>

      <section aria-labelledby="content-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="content-heading" className="text-lg font-semibold text-fg">Your videos</h2>
          <Link href="/studio/upload" className={buttonPrimary}>
            <Upload className="h-4 w-4" aria-hidden />
            Upload video
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
            <Film className="h-10 w-10 text-fg-tertiary" aria-hidden />
            <h3 className="mt-4 text-base font-semibold text-fg">No videos yet</h3>
            <p className="mt-1 max-w-sm text-sm text-fg-secondary">Upload your first video. It will be converted to multiple qualities automatically.</p>
            <Link href="/studio/upload" className={`${buttonPrimary} mt-6`}>Upload video</Link>
          </div>
        ) : (
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-xs text-fg-tertiary">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Video</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Visibility</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Views</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Likes</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Comments</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {videos.map((video) => (
                  <tr key={video._id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-elevated">
                          {video.thumbnailUrl ? (
                            <Image src={video.thumbnailUrl} alt="" fill sizes="112px" className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-fg-tertiary"><Film className="h-5 w-5" aria-hidden /></div>
                          )}
                          {video.status === 'ready' && video.duration > 0 && (
                            <span className="absolute bottom-1 right-1 rounded-sm bg-black/80 px-1 text-xs font-medium tabular-nums text-white">{formatDuration(video.duration)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-medium text-fg">{video.title}</p>
                          <p className="mt-0.5 text-xs text-fg-tertiary">{video.category} · {formatTimeAgo(video.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={video.status} />
                        {video.status === 'failed' && (
                          <button onClick={() => retry(video)} disabled={busyId === video._id} className={buttonGhost}>
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVisibility(video)}
                        disabled={busyId === video._id}
                        aria-pressed={video.isPublished}
                        className={buttonGhost}
                        title={video.isPublished ? 'Make private' : 'Make public'}
                      >
                        {video.isPublished ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
                        {video.isPublished ? 'Public' : 'Private'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-fg-secondary">{formatViews(video.views)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-fg-secondary">{formatViews(video.likes ?? 0)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-fg-secondary">{formatViews(video.comments ?? 0)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/studio/videos/${video._id}`} className={buttonGhost} aria-label={`Edit ${video.title}`}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                        {video.status === 'ready' && (
                          <Link href={`/watch/${video._id}`} className={buttonGhost} aria-label={`Watch ${video.title}`}>
                            <Play className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        )}
                        <button onClick={() => setPendingDelete(video)} className={`${buttonGhost} hover:text-danger`} aria-label={`Delete ${video.title}`}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
        title="Delete video?"
        description={<>&ldquo;{pendingDelete?.title}&rdquo; and its comments, likes and views will be removed permanently.</>}
        busy={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
