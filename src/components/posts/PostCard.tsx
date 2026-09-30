"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/dialog";
import { CommentSection } from "@/components/video/CommentSection";
import { useAuth } from "@/components/auth/AuthProvider";
import postApi from "@/lib/api/client/postApi";
import reactionApi from "@/lib/api/client/reactionApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import { formatViews } from "@/lib/utils";
import type { Post } from "@/lib/types/postType";
import {
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  card,
} from "@/components/studio/styles";

type Reaction = Post["viewerReaction"];

// counts after switching from one reaction to another (null = none)
const recount = (
  post: Pick<Post, "likeCount" | "dislikeCount">,
  from: Reaction,
  to: Reaction
) => ({
  likeCount:
    post.likeCount - (from === "like" ? 1 : 0) + (to === "like" ? 1 : 0),
  dislikeCount:
    post.dislikeCount -
    (from === "dislike" ? 1 : 0) +
    (to === "dislike" ? 1 : 0),
});

export function PostCard({
  post: initial,
  onDeleted,
  defaultShowComments = false,
}: {
  post: Post;
  onDeleted: (postId: string) => void;
  // the single-post page opens the comments straight away
  defaultShowComments?: boolean;
}) {
  const { user } = useAuth();
  const [post, setPost] = useState(initial);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial.content);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const react = async (value: "like" | "dislike") => {
    if (!user) return toast.error("Sign in to react to posts");
    const from = post.viewerReaction;
    const to = from === value ? null : value;
    // optimistic, rolled back if the request fails
    setPost((current) => ({
      ...current,
      ...recount(current, from, to),
      viewerReaction: to,
    }));
    try {
      await (to
        ? reactionApi.addReaction(post._id, to === "like", "Tweet")
        : reactionApi.removeReaction(post._id, "Tweet"));
    } catch (error: unknown) {
      setPost((current) => ({
        ...current,
        ...recount(current, to, from),
        viewerReaction: from,
      }));
      toast.error("Couldn't save your reaction. Try again.", {
        description: getApiErrorMessage(error),
      });
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setSaving(true);
    try {
      await postApi.update(post._id, content);
      setPost((current) => ({ ...current, content, isEdited: true }));
      setEditing(false);
    } catch (error: unknown) {
      toast.error("Couldn't save your changes.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await postApi.delete(post._id);
      setConfirmingDelete(false);
      onDeleted(post._id);
    } catch (error: unknown) {
      toast.error("Couldn't delete the post.", {
        description: getApiErrorMessage(error),
      });
      setDeleting(false);
    }
  };

  const channelHref = `/channel/${post.owner.userName}`;

  return (
    <article className={`${card} p-4`}>
      <header className="flex items-start gap-3">
        <Link
          href={channelHref}
          className="shrink-0"
          aria-label={`${post.owner.userName} channel`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.owner.avatarUrl} alt="" />
            <AvatarFallback className="bg-elevated font-semibold text-fg">
              {post.owner.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={channelHref}
            className="text-sm font-semibold text-fg hover:text-brand-fg"
          >
            {post.owner.fullName}
          </Link>
          <p className="text-xs text-fg-tertiary">
            @{post.owner.userName} ·{" "}
            <time dateTime={post.createdAt}>{post.relativeTime}</time>
            {post.isEdited && " · edited"}
          </p>
        </div>
        {post.isOwner && !editing && (
          <div className="flex shrink-0 gap-1">
            {post.canEdit && (
              <button
                type="button"
                onClick={() => {
                  setDraft(post.content);
                  setEditing(true);
                }}
                className={buttonGhost}
                aria-label="Edit post"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className={`${buttonGhost} hover:text-danger`}
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </header>

      {editing ? (
        <form onSubmit={save} className="mt-3 space-y-2">
          <label htmlFor={`edit-${post._id}`} className="sr-only">
            Edit post
          </label>
          <textarea
            id={`edit-${post._id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            rows={3}
            autoFocus
            className="w-full resize-y rounded-md border border-line-default bg-bg px-3 py-2 text-sm text-fg focus:border-brand-fg focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={buttonSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!draft.trim() || saving}
              className={buttonPrimary}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg">
          {post.content}
        </p>
      )}

      {post.image && (
        <div className="relative mt-3 aspect-video overflow-hidden rounded-md border border-line bg-elevated">
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain"
          />
        </div>
      )}

      <footer className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => react("like")}
          aria-pressed={post.viewerReaction === "like"}
          aria-label="Like"
          className={`${buttonGhost} ${post.viewerReaction === "like" ? "text-brand-fg" : ""}`}
        >
          <ThumbsUp
            className={`h-4 w-4 ${post.viewerReaction === "like" ? "fill-current" : ""}`}
            aria-hidden
          />
          {post.likeCount > 0 && (
            <span className="tabular-nums">{formatViews(post.likeCount)}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => react("dislike")}
          aria-pressed={post.viewerReaction === "dislike"}
          aria-label="Dislike"
          className={`${buttonGhost} ${post.viewerReaction === "dislike" ? "text-danger" : ""}`}
        >
          <ThumbsDown
            className={`h-4 w-4 ${post.viewerReaction === "dislike" ? "fill-current" : ""}`}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={() => setShowComments((open) => !open)}
          aria-expanded={showComments}
          className={buttonGhost}
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          <span className="tabular-nums">
            {post.commentCount > 0 ? formatViews(post.commentCount) : ""}
          </span>
          {showComments ? "Hide comments" : "Comments"}
        </button>
      </footer>

      {showComments && (
        <div className="mt-4 border-t border-line pt-4">
          <CommentSection
            targetId={post._id}
            targetType="Tweet"
            isContentOwner={post.isOwner}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete post?"
        description="The post, its comments and reactions will be removed permanently."
        busy={deleting}
        onConfirm={remove}
      />
    </article>
  );
}
