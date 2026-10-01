"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VideoOff } from "lucide-react";

import { VideoCard } from "@/components/video/VideoCard";
import { VideoCardSkeleton } from "@/components/video/VideoGridSkeleton";
import { VIDEO_GRID_CLASS } from "@/components/video/gridClass";
import { VideoRow } from "@/components/library/VideoRow";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import subscriptionApi from "@/lib/api/client/subscriptionApi";
import videoApi from "@/lib/api/client/videoApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import type { SearchFilters } from "@/lib/search";
import type { VideoSummary } from "@/lib/types/videoType";
import type { Page } from "@/lib/types/apiType";

// which list the next pages come from (functions cannot be passed from server
// components, so this names it)
export type VideoSource =
  | { kind: "home"; category?: string }
  | { kind: "channel"; userName: string }
  | { kind: "subscriptions" }
  | { kind: "search"; filters: SearchFilters };

const fetchPage = (source: VideoSource, cursor: string) => {
  switch (source.kind) {
    case "home":
      return videoApi.getAll({ category: source.category, cursor });
    case "channel":
      return subscriptionApi.channelVideos(source.userName, cursor);
    case "subscriptions":
      return subscriptionApi.feed(cursor);
    case "search":
      return videoApi.search(source.filters, cursor);
  }
};

/** How many rows ahead of the viewport the next page starts loading. */
const PRELOAD_MARGIN = "600px";
const PENDING_SKELETONS = 4;

/**
 * A server-rendered first page of videos, as cards or (search results) rows.
 * Further pages load as the reader approaches the end of the list.
 */
export function PagedVideoGrid({
  source,
  initial,
  emptyMessage,
  layout = "grid",
}: {
  source: VideoSource;
  initial: Page<VideoSummary>;
  /** Shown when the very first page came back with nothing. */
  emptyMessage: React.ReactNode;
  layout?: "grid" | "list";
}) {
  const [videos, setVideos] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const page: Page<VideoSummary> = (await fetchPage(source, cursor)).data
        .data;
      setVideos((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (caught: unknown) {
      // inline, next to the list it belongs to, rather than as a toast
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, source]);

  useEffect(() => {
    const target = sentinel.current;
    // after an error the reader asks again with the button, so stop watching
    if (!target || !cursor || error) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: PRELOAD_MARGIN }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [cursor, error, loadMore]);

  if (videos.length === 0) {
    return typeof emptyMessage === "string" ? (
      <EmptyState
        icon={VideoOff}
        title="No videos yet"
        description={emptyMessage}
      />
    ) : (
      <>{emptyMessage}</>
    );
  }

  return (
    <div>
      {layout === "list" ? (
        <ul className="flex flex-col gap-2">
          {videos.map((video) => (
            <VideoRow key={video._id} video={video} size="lg" />
          ))}
        </ul>
      ) : (
        <div className={VIDEO_GRID_CLASS}>
          {videos.map((video, index) => (
            <VideoCard key={video._id} video={video} priority={index < 4} />
          ))}
          {loading &&
            Array.from({ length: PENDING_SKELETONS }, (_, index) => (
              <VideoCardSkeleton key={`pending-${index}`} />
            ))}
        </div>
      )}

      {loading && layout === "list" && (
        <p className="py-6 text-center text-sm text-fg-tertiary">
          Loading more…
        </p>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-fg-secondary">{error}</p>
          <Button variant="secondary" onClick={loadMore} loading={loading}>
            Try again
          </Button>
        </div>
      )}

      <div ref={sentinel} aria-hidden className="h-px" />
    </div>
  );
}
