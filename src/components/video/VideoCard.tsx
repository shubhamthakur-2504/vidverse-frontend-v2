"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Link2, ListPlus, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { SaveToPlaylistDialog } from "@/components/library/SaveToPlaylistDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VideoSummary } from "@/lib/types/videoType";
import {
  formatAbsoluteDate,
  formatDuration,
  formatTimeAgo,
  formatViews,
} from "@/lib/utils";

export function VideoCard({
  video,
  /** The first row is above the fold, so those thumbnails load eagerly. */
  priority = false,
}: {
  video: VideoSummary;
  priority?: boolean;
}) {
  const { user } = useAuth();
  const [saveOpen, setSaveOpen] = useState(false);
  const watchHref = `/watch/${video._id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(watchHref, window.location.origin).toString()
      );
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <article className="group relative flex min-w-0 flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-surface inset-ring inset-ring-line">
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 300px"
          className="object-cover transition-[filter] duration-200 ease-out group-hover:brightness-105"
        />
        <Badge tone="media" className="absolute right-2 bottom-2">
          {formatDuration(video.duration)}
        </Badge>
      </div>

      <div className="flex items-start gap-3">
        <Link
          href={`/channel/${video.owner.userName}`}
          aria-label={`${video.owner.fullName} channel`}
          className="relative z-10 shrink-0"
        >
          <Avatar className="size-9">
            <AvatarImage src={video.owner.avatarUrl} alt="" />
            <AvatarFallback>{video.owner.userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className="text-base leading-6 font-semibold text-pretty">
            {/* the overlay makes the whole card clickable without nesting links */}
            <Link
              href={watchHref}
              className="line-clamp-2 rounded-sm text-fg after:absolute after:inset-0 after:content-['']"
            >
              {video.title}
            </Link>
          </h3>
          <Link
            href={`/channel/${video.owner.userName}`}
            className="relative z-10 mt-1 block w-fit text-xs leading-4 text-fg-secondary transition-colors duration-120 ease-out hover:text-fg"
          >
            {video.owner.fullName}
          </Link>
          <p className="text-xs leading-4 text-fg-tertiary tabular-nums">
            {formatViews(video.views)} views ·{" "}
            <time
              dateTime={video.createdAt}
              title={formatAbsoluteDate(video.createdAt)}
            >
              {formatTimeAgo(video.createdAt)}
            </time>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${video.title}`}
              // always reachable on touch and by keyboard; it only fades in on
              // pointer devices, where hover tells you the card is live
              className="press relative z-10 -mt-1 -mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-fg-secondary hover:bg-hover hover:text-fg pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100 pointer-fine:data-[state=open]:opacity-100"
            >
              <MoreVertical className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && (
              <DropdownMenuItem onSelect={() => setSaveOpen(true)}>
                <ListPlus aria-hidden />
                Save to playlist
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={copyLink}>
              <Link2 aria-hidden />
              Copy link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {user && saveOpen && (
        <SaveToPlaylistDialog
          videoId={video._id}
          open={saveOpen}
          onOpenChange={setSaveOpen}
        />
      )}
    </article>
  );
}
