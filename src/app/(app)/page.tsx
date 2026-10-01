import { Suspense } from "react";
import { redirect } from "next/navigation";
import { VideoOff } from "lucide-react";

import { CategoryFilter } from "@/components/home/CategoryFilter";
import { PagedVideoGrid } from "@/components/video/PagedVideoGrid";
import { VideoShelf } from "@/components/video/VideoShelf";
import { EmptyState } from "@/components/ui/empty-state";
import { channelApi } from "@/lib/api/server/channelApi";
import { videoApi } from "@/lib/api/server/videoApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import { Video, VideoSummary } from "@/lib/types/videoType";
import { Page } from "@/lib/types/apiType";
import { resultsHref } from "@/lib/search";

const SHELF_SIZE = 6;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string }>;
}) {
  const { category, query } = await searchParams;
  // search used to live here as /?query=: keep old links working
  if (query?.trim()) redirect(resultsHref({ q: query.trim() }));

  const [videosRes, categoriesRes, feedRes] = await Promise.allSettled([
    videoApi.getAllVideos(category),
    videoApi.getCategories(),
    // 401 for signed-out visitors, which just means no shelf
    channelApi.getSubscriptionFeed(),
  ]);

  // first page only; the grid loads further pages as the reader nears the end
  const emptyPage: Page<Video> = { items: [], nextCursor: null };
  const videosPage: Page<Video> =
    videosRes.status === "fulfilled"
      ? (unwrapApiResponse<Page<Video>>(videosRes.value) ?? emptyPage)
      : emptyPage;

  const categories: string[] =
    categoriesRes.status === "fulfilled"
      ? (unwrapApiResponse<string[]>(categoriesRes.value) ?? [])
      : [];

  let shelf: VideoSummary[] = [];
  try {
    if (feedRes.status === "fulfilled")
      shelf =
        unwrapApiResponse<Page<VideoSummary>>(feedRes.value)?.items.slice(
          0,
          SHELF_SIZE
        ) ?? [];
  } catch {
    /* signed out, or the feed is unavailable: the main grid stands alone */
  }

  return (
    <>
      <div className="sticky top-(--header-h) z-20 bg-bg px-4 py-3 md:px-6 xl:px-8">
        <Suspense fallback={<div className="h-8" />}>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      <div className="px-4 pb-12 md:px-6 xl:px-8">
        {/* a category filters the whole feed, so the shelf would contradict it */}
        {!category && (
          <VideoShelf
            title="Latest from your subscriptions"
            seeAllHref="/subscriptions"
            videos={shelf}
          />
        )}

        {/* keyed by the category so paging state resets when it changes */}
        <PagedVideoGrid
          key={category ?? ""}
          source={{ kind: "home", category }}
          initial={videosPage}
          emptyMessage={
            <EmptyState
              icon={VideoOff}
              title={category ? `No videos in ${category}` : "No videos yet"}
              description={
                category
                  ? "Try another category, or clear the filter to see everything."
                  : "Be the first to upload something."
              }
            />
          }
        />
      </div>
    </>
  );
}
