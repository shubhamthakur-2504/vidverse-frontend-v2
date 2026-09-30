import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/utils";
import type { AppNotification } from "@/lib/types/notificationType";

// where a notification leads
export function notificationHref(n: AppNotification): string {
  if (n.type === "subscribe")
    return n.actor ? `/channel/${n.actor.userName}` : "/";
  if (n.video) return `/watch/${n.video._id}`;
  if (n.post) return `/posts/${n.post._id}`;
  return "/notifications";
}

function Message({ n }: { n: AppNotification }) {
  const who = (
    <span className="font-semibold text-fg">
      {n.actor?.fullName ?? "Someone"}
    </span>
  );
  if (n.type === "subscribe") return <>{who} subscribed to your channel</>;
  if (n.type === "video")
    return (
      <>
        {who} uploaded{" "}
        {n.video ? (
          <span className="text-fg">{n.video.title}</span>
        ) : (
          "a new video"
        )}
      </>
    );
  const where = n.video ? (
    <span className="text-fg">{n.video.title}</span>
  ) : (
    "your post"
  );
  return (
    <>
      {who} commented on {where}
      {n.comment && <>: &ldquo;{n.comment.content}&rdquo;</>}
    </>
  );
}

// one row, shared by the navbar menu and the notifications page; unread rows get a dot
export function NotificationItem({
  notification: n,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
}) {
  const unread = !n.readAt;
  return (
    <Link
      href={notificationHref(n)}
      onClick={() => onOpen(n)}
      className={`flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-elevated ${unread ? "bg-brand-subtle/40" : ""}`}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={n.actor?.avatarUrl} alt="" />
        <AvatarFallback className="bg-elevated text-sm font-semibold text-fg">
          {n.actor?.userName.charAt(0).toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-fg-secondary">
          <Message n={n} />
        </p>
        <p className="mt-0.5 text-xs text-fg-tertiary">
          {formatTimeAgo(n.createdAt)}
        </p>
      </div>
      {unread && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand"
          aria-label="Unread"
        />
      )}
    </Link>
  );
}
