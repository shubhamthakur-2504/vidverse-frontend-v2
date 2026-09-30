import Image from "next/image";
import Link from "next/link";
import { formatDuration, formatTimeAgo, formatViews } from "@/lib/utils";
import type { VideoSummary } from "@/lib/types/videoType";

// one horizontal list entry (history, playlist page, search results with size="lg"); `action` sits on the right, e.g. a remove button
export function VideoRow({
  video,
  position,
  action,
  size = "md",
}: {
  video: VideoSummary;
  position?: number;
  action?: React.ReactNode;
  size?: "md" | "lg";
}) {
  const large = size === "lg";
  return (
    <li className="group flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-surface">
      {position !== undefined && (
        <span className="hidden w-6 shrink-0 pt-8 text-center text-sm tabular-nums text-fg-tertiary sm:block">
          {position}
        </span>
      )}
      <Link
        href={`/watch/${video._id}`}
        className={`relative aspect-video w-40 shrink-0 overflow-hidden rounded-md border border-line bg-elevated ${large ? "sm:w-64 lg:w-90" : "sm:w-48"}`}
      >
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes={large ? "(max-width: 640px) 160px, 360px" : "192px"}
          className="object-cover"
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-bg/80 px-1.5 py-0.5 text-xs font-medium tabular-nums text-fg">
          {formatDuration(video.duration)}
        </span>
      </Link>
      <div className="min-w-0 flex-1 py-1">
        <Link
          href={`/watch/${video._id}`}
          className={`line-clamp-2 font-semibold text-fg hover:text-brand-fg ${large ? "text-base" : "text-sm"}`}
        >
          {video.title}
        </Link>
        <Link
          href={`/channel/${video.owner.userName}`}
          className="mt-1 block w-fit text-xs text-fg-secondary hover:text-fg"
        >
          {video.owner.userName}
        </Link>
        <p className="mt-0.5 text-xs text-fg-tertiary">
          {formatViews(video.views)} views · {formatTimeAgo(video.createdAt)}
        </p>
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </li>
  );
}
