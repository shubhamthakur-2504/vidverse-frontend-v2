"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ListPlus, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { SaveToPlaylistDialog } from "@/components/library/SaveToPlaylistDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import reactionApi from "@/lib/api/client/reactionApi";
import subscriptionApi from "@/lib/api/client/subscriptionApi";
import type { WatchVideo } from "@/lib/types/videoType";
import {
  formatAbsoluteDate,
  formatCount,
  formatViews,
  formatTimeAgo,
  cn,
} from "@/lib/utils";

type Reaction = "like" | "dislike" | null;

export function VideoInfo({ video }: { video: WatchVideo }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [expanded, setExpanded] = useState(false);
  // counts and the viewer's own state arrive with the server-rendered payload
  const [subscribed, setSubscribed] = useState(video.viewer.isSubscribed);
  const [subscribers, setSubscribers] = useState(video.owner.subscribersCount);
  const [reaction, setReaction] = useState<Reaction>(video.viewer.reaction);
  const [likes, setLikes] = useState(video.stats.likes);
  const [saveOpen, setSaveOpen] = useState(false);

  /** Returns false and nudges the visitor when the action needs an account. */
  const requireAccount = (what: string) => {
    if (user) return true;
    toast(`Sign in to ${what}`, {
      action: {
        label: "Sign in",
        onClick: () =>
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`),
      },
    });
    return false;
  };

  // Each action applies at once and rolls back if the request fails: the
  // change in the UI is the confirmation, so none of them raise a toast.
  const toggleSubscribe = async () => {
    if (!requireAccount("subscribe")) return;
    const next = !subscribed;
    setSubscribed(next);
    setSubscribers((count) => count + (next ? 1 : -1));
    try {
      await (next
        ? subscriptionApi.subscribe(video.owner._id)
        : subscriptionApi.unsubscribe(video.owner._id));
    } catch {
      setSubscribed(!next);
      setSubscribers((count) => count + (next ? -1 : 1));
      toast.error("Couldn't update your subscription. Try again.");
    }
  };

  const react = async (next: Exclude<Reaction, null>) => {
    if (!requireAccount(next === "like" ? "like videos" : "react")) return;
    const previous = reaction;
    const previousLikes = likes;
    const clearing = previous === next;

    setReaction(clearing ? null : next);
    // a dislike never counted as a like, so the like total only moves when
    // "like" is on one side of the change
    setLikes(
      (count) =>
        count +
        (next === "like" ? (clearing ? -1 : 1) : previous === "like" ? -1 : 0)
    );

    try {
      await (clearing
        ? reactionApi.removeReaction(video._id, "Video")
        : reactionApi.addReaction(video._id, next === "like", "Video"));
    } catch {
      setReaction(previous);
      setLikes(previousLikes);
      toast.error("Couldn't save your reaction. Try again.");
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url });
        return;
      } catch {
        /* dismissed, or sharing is blocked: fall through to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const pill =
    "press flex h-9 items-center gap-2 px-4 text-sm font-medium text-fg";

  return (
    <div className="space-y-4">
      <h1 className="text-lg leading-7 font-semibold tracking-tight text-fg sm:text-2xl sm:leading-8">
        {video.title}
      </h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/channel/${video.owner.userName}`}
            className="flex items-center gap-3 rounded-sm"
          >
            <Avatar className="size-10">
              <AvatarImage src={video.owner.avatarUrl} alt="" />
              <AvatarFallback>{video.owner.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="block">
              <span className="block text-sm font-medium text-fg">
                {video.owner.fullName}
              </span>
              <span className="block text-xs text-fg-tertiary tabular-nums">
                {formatViews(subscribers)} subscribers
              </span>
            </span>
          </Link>

          {!video.viewer.isOwner && (
            <Button
              variant={subscribed ? "secondary" : "inverse"}
              onClick={toggleSubscribe}
              aria-pressed={subscribed}
              className="ml-2 rounded-full"
            >
              {subscribed && <Bell strokeWidth={1.75} aria-hidden />}
              {subscribed ? "Subscribed" : "Subscribe"}
            </Button>
          )}
        </div>

        {/* a scrolling row rather than a wrapping one, so the player stays put */}
        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-line-default bg-elevated">
            <button
              type="button"
              onClick={() => react("like")}
              aria-pressed={reaction === "like"}
              aria-label={`Like${likes > 0 ? `, ${formatCount(likes)} so far` : ""}`}
              className={cn(pill, "hover:bg-hover")}
            >
              <ThumbsUp
                key={`like-${reaction === "like"}`}
                className={cn(
                  "size-4",
                  reaction === "like" &&
                    "animate-pop fill-current text-brand-fg"
                )}
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="tabular-nums">{formatViews(likes)}</span>
            </button>
            <span className="h-6 w-px bg-line-default" aria-hidden />
            <button
              type="button"
              onClick={() => react("dislike")}
              aria-pressed={reaction === "dislike"}
              aria-label="Dislike"
              className={cn(pill, "hover:bg-hover")}
            >
              <ThumbsDown
                key={`dislike-${reaction === "dislike"}`}
                className={cn(
                  "size-4",
                  reaction === "dislike" && "animate-pop fill-current"
                )}
                strokeWidth={1.75}
                aria-hidden
              />
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={share}
            className="shrink-0 rounded-full"
          >
            <Share2 strokeWidth={1.75} aria-hidden />
            Share
          </Button>
          <Button
            variant="secondary"
            onClick={() => requireAccount("save videos") && setSaveOpen(true)}
            className="shrink-0 rounded-full"
          >
            <ListPlus strokeWidth={1.75} aria-hidden />
            Save
          </Button>
          {user && saveOpen && (
            <SaveToPlaylistDialog
              videoId={video._id}
              open={saveOpen}
              onOpenChange={setSaveOpen}
            />
          )}
        </div>
      </div>

      <Description video={video} expanded={expanded} onExpand={setExpanded} />
    </div>
  );
}

/** The meta line and description in one box, collapsed to two lines. */
function Description({
  video,
  expanded,
  onExpand,
}: {
  video: WatchVideo;
  expanded: boolean;
  onExpand: (expanded: boolean) => void;
}) {
  const meta = (
    <p className="text-sm font-medium text-fg">
      {formatCount(video.views)} views ·{" "}
      <time
        dateTime={video.createdAt}
        title={formatAbsoluteDate(video.createdAt)}
      >
        {formatTimeAgo(video.createdAt)}
      </time>
      {video.category && ` · ${video.category}`}
    </p>
  );

  // Two lines at this width is roughly 160 characters. Measuring the real
  // overflow would be exact, but it would also mean a layout read on every
  // render to decide whether to show one word.
  const clamps =
    video.description.length > 160 || video.description.includes("\n");

  if (!video.description) {
    return <div className="rounded-lg bg-surface p-3">{meta}</div>;
  }

  if (!clamps) {
    return (
      <div className="rounded-lg bg-surface p-3">
        {meta}
        <p className="mt-2 text-sm whitespace-pre-wrap text-fg-secondary">
          {video.description}
        </p>
      </div>
    );
  }

  return (
    // the whole box is the target, which is a much bigger hit area than "more"
    <button
      type="button"
      onClick={() => onExpand(!expanded)}
      aria-expanded={expanded}
      className="block w-full cursor-pointer rounded-lg bg-surface p-3 text-left transition-colors duration-120 ease-out hover:bg-elevated"
    >
      {meta}
      <p
        className={cn(
          "mt-2 text-sm whitespace-pre-wrap text-fg-secondary",
          !expanded && "line-clamp-2"
        )}
      >
        {video.description}
      </p>
      <span className="mt-2 inline-block text-sm font-medium text-fg">
        {expanded ? "Show less" : "…more"}
      </span>
    </button>
  );
}
