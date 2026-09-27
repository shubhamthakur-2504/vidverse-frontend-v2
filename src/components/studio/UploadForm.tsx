"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Film, ImagePlus, Loader2, UploadCloud, XCircle } from 'lucide-react'
import { uploadVideoDirect } from '@/lib/upload/directUpload'
import videoApi from '@/lib/api/client/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import type { StudioVideo } from '@/lib/types/studioType'
import { buttonPrimary, buttonSecondary, card, fieldInput, fieldLabel } from './styles'

const VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime,video/x-matroska'
const IMAGE_TYPES = 'image/jpeg,image/png,image/webp'
const POLL_MS = 4000

type Phase = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed'

const formatBytes = (bytes: number) =>
  bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : bytes >= 1024 ** 2 ? `${(bytes / 1024 ** 2).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

const titleFromFile = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 100)

export function UploadForm({ categories }: { categories: string[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [video, setVideo] = useState<StudioVideo | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const thumbnailPreview = useMemo(() => (thumbnail ? URL.createObjectURL(thumbnail) : null), [thumbnail])
  useEffect(() => () => { if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview) }, [thumbnailPreview])

  // leaving mid-upload loses the upload
  useEffect(() => {
    if (phase !== 'uploading') return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [phase])

  // follow the worker until the adaptive HLS ladder is ready (or failed)
  useEffect(() => {
    if (phase !== 'processing' || !video) return
    const timer = setInterval(async () => {
      try {
        const latest = unwrapApiResponse<StudioVideo>((await videoApi.getMyVideo(video._id)).data)
        setVideo(latest)
        if (latest.status === 'ready') setPhase('ready')
        if (latest.status === 'failed') setPhase('failed')
      } catch { /* try again on the next tick */ }
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [phase, video])

  const chooseFile = (picked: File | undefined | null) => {
    if (!picked) return
    if (!picked.type.startsWith('video/')) {
      setError('Choose a video file (MP4, WebM, MOV or MKV).')
      return
    }
    setError(null)
    setFile(picked)
    if (!title) setTitle(titleFromFile(picked.name))
  }

  const start = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) return setError('Choose a video to upload.')
    if (!title.trim()) return setError('Give your video a title.')
    setError(null)
    setPhase('uploading')
    setProgress(0)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const created = await uploadVideoDirect(
        file,
        { title: title.trim(), description: description.trim(), category, thumbnail },
        { onProgress: setProgress, signal: controller.signal }
      )
      setVideo(created)
      setPhase('processing')
    } catch (err: unknown) {
      setPhase('idle')
      if (err instanceof DOMException && err.name === 'AbortError') return setError('Upload cancelled.')
      setError(getApiErrorMessage(err, 'The upload failed. Please try again.'))
    } finally {
      abortRef.current = null
    }
  }

  const reset = () => {
    setFile(null); setTitle(''); setDescription(''); setCategory('General'); setThumbnail(null)
    setVideo(null); setProgress(0); setError(null); setPhase('idle')
  }

  if (phase === 'processing' || phase === 'ready' || phase === 'failed') {
    return (
      <div className={`${card} mx-auto max-w-xl p-8 text-center`} role="status" aria-live="polite">
        {phase === 'processing' && <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-fg" aria-hidden />}
        {phase === 'ready' && <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden />}
        {phase === 'failed' && <XCircle className="mx-auto h-10 w-10 text-danger" aria-hidden />}
        <h2 className="mt-4 text-lg font-semibold text-fg">
          {phase === 'processing' ? 'Uploaded. Processing your video...' : phase === 'ready' ? 'Your video is ready' : 'Processing failed'}
        </h2>
        <p className="mt-2 text-sm text-fg-secondary">
          {phase === 'processing'
            ? 'We are converting it into several qualities. You can leave this page; it keeps going in the background.'
            : phase === 'ready'
              ? `"${video?.title}" is live${video?.isPublished ? '' : ' (private)'}.`
              : 'You can retry from your studio. The uploaded file is kept.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {phase === 'ready' && video && <Link href={`/watch/${video._id}`} className={buttonPrimary}>Watch</Link>}
          {video && <Link href={`/studio/videos/${video._id}`} className={buttonSecondary}>Edit details</Link>}
          <Link href="/studio" className={buttonSecondary}>Go to studio</Link>
          <button onClick={reset} className={buttonSecondary}>Upload another</button>
        </div>
      </div>
    )
  }

  const uploading = phase === 'uploading'

  return (
    <form onSubmit={start} className="grid gap-8 lg:grid-cols-[1fr_320px]" noValidate>
      <div className="space-y-6">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); chooseFile(e.dataTransfer.files?.[0]) }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center transition-colors ${
            dragging ? 'border-brand-fg bg-brand-subtle' : 'border-line-default bg-surface hover:border-line-strong'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input type="file" accept={VIDEO_TYPES} className="sr-only" onChange={(e) => chooseFile(e.target.files?.[0])} disabled={uploading} />
          {file ? (
            <>
              <Film className="h-10 w-10 text-brand-fg" aria-hidden />
              <p className="mt-3 max-w-full truncate font-medium text-fg">{file.name}</p>
              <p className="mt-1 text-sm text-fg-tertiary">{formatBytes(file.size)} · click or drop to replace</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-10 w-10 text-fg-tertiary" aria-hidden />
              <p className="mt-3 font-medium text-fg">Drag a video here or choose a file</p>
              <p className="mt-1 text-sm text-fg-tertiary">MP4, WebM, MOV or MKV</p>
            </>
          )}
        </label>

        <div>
          <label htmlFor="title" className={fieldLabel}>Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} disabled={uploading} className={`${fieldInput} h-10`} placeholder="Add a title that describes your video" />
          <p className="mt-1 text-right text-xs text-fg-tertiary tabular-nums">{title.length}/100</p>
        </div>

        <div>
          <label htmlFor="description" className={fieldLabel}>Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={5} disabled={uploading} className={`${fieldInput} resize-y py-2`} placeholder="Tell viewers about your video" />
        </div>

        <div>
          <label htmlFor="category" className={fieldLabel}>Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading} className={`${fieldInput} h-10`}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <aside className="space-y-6">
        <div>
          <p className={fieldLabel}>Thumbnail</p>
          <label className={`relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-line-default bg-surface transition-colors hover:border-line-strong ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
            <input type="file" accept={IMAGE_TYPES} className="sr-only" onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} disabled={uploading} />
            {thumbnailPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object url preview
              <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-fg-tertiary"><ImagePlus className="h-6 w-6" aria-hidden />Optional</span>
            )}
          </label>
          <p className="mt-2 text-xs text-fg-tertiary">Without one, a frame from the video is used.</p>
        </div>

        {error && <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        {uploading ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <div className="flex justify-between text-sm">
              <span className="text-fg-secondary">Uploading...</span>
              <span className="font-medium tabular-nums text-fg">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated" aria-hidden>
              <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            {file && <p className="text-xs text-fg-tertiary tabular-nums">{formatBytes(file.size * progress)} of {formatBytes(file.size)}</p>}
            <button type="button" onClick={() => abortRef.current?.abort()} className={`${buttonSecondary} w-full`}>Cancel upload</button>
          </div>
        ) : (
          <button type="submit" className={`${buttonPrimary} h-11 w-full`} disabled={!file}>
            <UploadCloud className="h-4 w-4" aria-hidden />
            Upload
          </button>
        )}
      </aside>
    </form>
  )
}
