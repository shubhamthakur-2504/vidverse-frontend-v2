import videoApi from '@/lib/api/client/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { Video } from '@/lib/types/videoType'

// Browser -> Cloudinary upload of the original file (it never passes through our API), then registration.
// Our API signs the upload, and after registration our ffmpeg worker builds the adaptive HLS ladder.

type UploadIntent = {
  uploadUrl: string
  apiKey: string
  publicId: string
  timestamp: number
  signature: string
  maxBytes: number
  chunkBytes: number
}

export type VideoDetails = { title: string; description?: string; category?: string; thumbnail?: File | null }

export type UploadOptions = {
  // 0..1 across the whole file
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

// one request to Cloudinary; XHR (not fetch) because it reports upload progress
const sendChunk = (url: string, form: FormData, headers: Record<string, string>, onProgress: (loaded: number) => void, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value)
    xhr.upload.onprogress = (event) => onProgress(event.loaded)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let message = `Upload failed (${xhr.status})`
      try { message = JSON.parse(xhr.responseText)?.error?.message ?? message } catch { /* not json */ }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('Network error while uploading'))
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))
    signal?.addEventListener('abort', () => xhr.abort(), { once: true })
    xhr.send(form)
  })

export async function uploadVideoDirect(file: File, details: VideoDetails, { onProgress, signal }: UploadOptions = {}): Promise<Video> {
  const intent = unwrapApiResponse<UploadIntent>((await videoApi.uploadIntent()).data)
  if (file.size > intent.maxBytes) {
    throw new Error(`This video is larger than the ${Math.round(intent.maxBytes / 1024 / 1024)} MB upload limit`)
  }

  // files above chunkBytes go up in pieces: Cloudinary joins requests sharing X-Unique-Upload-Id
  const chunked = file.size > intent.chunkBytes
  const uploadId = crypto.randomUUID()
  for (let start = 0; start < file.size; start += intent.chunkBytes) {
    const end = Math.min(start + intent.chunkBytes, file.size)
    const form = new FormData()
    form.append('file', chunked ? file.slice(start, end) : file)
    form.append('api_key', intent.apiKey)
    form.append('timestamp', String(intent.timestamp))
    form.append('signature', intent.signature)
    form.append('public_id', intent.publicId)
    const headers: Record<string, string> = chunked
      ? { 'X-Unique-Upload-Id': uploadId, 'Content-Range': `bytes ${start}-${end - 1}/${file.size}` }
      : {}
    await sendChunk(intent.uploadUrl, form, headers, (loaded) => onProgress?.(Math.min(1, (start + loaded) / file.size)), signal)
  }
  onProgress?.(1)

  // register the upload; our worker takes it from here (status "processing" until the HLS ladder is ready)
  const form = new FormData()
  form.append('publicId', intent.publicId)
  form.append('title', details.title)
  if (details.description) form.append('description', details.description)
  if (details.category) form.append('category', details.category)
  if (details.thumbnail) form.append('thumbnail', details.thumbnail)
  return unwrapApiResponse<Video>((await videoApi.registerUpload(form)).data)
}
