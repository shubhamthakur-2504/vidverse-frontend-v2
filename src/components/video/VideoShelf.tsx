import Link from "next/link";

import { VideoCard } from "@/components/video/VideoCard";
import type { VideoSummary } from "@/lib/types/videoType";

/**
 * A single row of videos above the main feed. It scrolls sideways rather than
 * wrapping, so the row below it always starts at the same height.
 */
export function VideoShelf({
  title,
  seeAllHref,
  videos,
}: {
  title: string;
  seeAllHref?: string;
  videos: VideoSummary[];
}) {
  if (videos.length === 0) return null;
  const headingId = `shelf-${title.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <section aria-labelledby={headingId} className="mb-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id={headingId}
          className="text-xl leading-7 font-semibold tracking-tight text-fg"
        >
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="shrink-0 rounded-sm text-sm font-medium text-brand-fg hover:underline"
          >
            See all
          </Link>
        )}
      </div>
      <ul className="no-scrollbar flex snap-x gap-4 overflow-x-auto">
        {videos.map((video) => (
          <li key={video._id} className="w-64 shrink-0 snap-start">
            <VideoCard video={video} />
          </li>
        ))}
      </ul>
    </section>
  );
}
