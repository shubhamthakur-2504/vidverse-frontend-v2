import Link from "next/link";
import Image from "next/image";
import { Clapperboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Video } from "@/lib/types/videoType";
import {
  formatAbsoluteDate,
  formatDuration,
  formatTimeAgo,
  formatViews,
} from "@/lib/utils";

/** "Up next": fetched server-side on the watch page and passed in. */
export function RelatedVideos({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="Nothing up next"
        description="There are no related videos for this one yet."
        className="py-10"
      />
    );
  }

  return (
    <section aria-labelledby="up-next">
      <h2
        id="up-next"
        className="mb-3 text-base font-semibold tracking-tight text-fg"
      >
        Up next
      </h2>
      <ul className="flex flex-col gap-2">
        {videos.map((video) => (
          <li key={video._id}>
            <article className="group relative flex gap-3 rounded-md p-2 transition-colors duration-120 ease-out hover:bg-surface">
              <div className="relative aspect-video w-42 shrink-0 overflow-hidden rounded-md bg-surface inset-ring inset-ring-line">
                <Image
                  src={video.thumbnailUrl}
                  alt=""
                  fill
                  sizes="168px"
                  className="object-cover transition-[filter] duration-200 ease-out group-hover:brightness-105"
                />
                <Badge tone="media" className="absolute right-1 bottom-1">
                  {formatDuration(video.duration)}
                </Badge>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm leading-5 font-semibold text-pretty">
                  <Link
                    href={`/watch/${video._id}`}
                    className="line-clamp-2 rounded-sm text-fg after:absolute after:inset-0 after:content-['']"
                  >
                    {video.title}
                  </Link>
                </h3>
                <p className="mt-1 truncate text-xs text-fg-secondary">
                  {video.owner.fullName}
                </p>
                <p className="text-xs text-fg-tertiary tabular-nums">
                  {formatViews(video.views)} views ·{" "}
                  <time
                    dateTime={video.createdAt}
                    title={formatAbsoluteDate(video.createdAt)}
                  >
                    {formatTimeAgo(video.createdAt)}
                  </time>
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
