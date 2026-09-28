import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { VideoGrid } from '@/components/video/VideoGrid'
import { VideoGridSkeleton } from '@/components/video/VideoGridSkeleton'
import { CategoryFilter } from '@/components/home/CategoryFilter'
import { videoApi } from '@/lib/api/server/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { Video } from '@/lib/types/videoType'
import { Page } from '@/lib/types/apiType'
import { resultsHref } from '@/lib/search'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string }>
}) {
  const { category, query } = await searchParams
  // search used to live here as /?query=: keep old links working
  if (query?.trim()) redirect(resultsHref({ q: query.trim() }))

  // Fetch videos and categories in parallel — both SSR, no client waterfall
  const [videosRes, categoriesRes] = await Promise.allSettled([
    videoApi.getAllVideos(category),
    videoApi.getCategories(),
  ])

  // first page only; the grid loads further pages on demand
  const emptyPage: Page<Video> = { items: [], nextCursor: null }
  const videosPage: Page<Video> = videosRes.status === 'fulfilled'
    ? (unwrapApiResponse<Page<Video>>(videosRes.value) ?? emptyPage)
    : emptyPage

  const categories: string[] = categoriesRes.status === 'fulfilled'
    ? (unwrapApiResponse<string[]>(categoriesRes.value) ?? [])
    : []

  return (
    <div className="min-h-screen pt-16">
      {/* Ambient background — subtle, never competes with content */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb orb-purple w-[700px] h-[700px] -top-60 -left-48 opacity-25 animate-float" />
        <div
          className="orb orb-cyan w-[500px] h-[500px] top-1/2 -right-32 opacity-15 animate-float"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* Sticky category filter — pinned below navbar */}
      <div className="sticky top-16 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="container mx-auto px-4 py-3">
          <Suspense fallback={<div className="h-10 animate-pulse bg-white/5 rounded-full w-full" />}>
            <CategoryFilter categories={categories} />
          </Suspense>
        </div>
      </div>

      {/* Video grid — SSR data, shows immediately on landing */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<VideoGridSkeleton />}>
          {/* keyed by the category so paging state resets when it changes */}
          <VideoGrid
            key={category ?? ''}
            initialVideos={videosPage.items}
            initialCursor={videosPage.nextCursor}
            category={category}
          />
        </Suspense>
      </div>
    </div>
  )
}