"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  MoreVertical,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import commentApi from "@/lib/api/client/commentApi";
import reactionApi from "@/lib/api/client/reactionApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import type { Comment } from "@/lib/types/commentType";
import type { Page } from "@/lib/types/apiType";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import { cn, formatTimeAgo, formatViews, plural } from "@/lib/utils";

export function CommentSection({
  targetId,
  targetType,
  isContentOwner = false,
  /** The id of whoever owns the video or post, for the "Creator" badge. */
  contentOwnerId,
  /** The server's count, so the heading is right before the list loads. */
  totalComments,
}: {
  targetId: string;
  targetType: "Video" | "Tweet";
  isContentOwner?: boolean;
  contentOwnerId?: string;
  totalComments?: number;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [count, setCount] = useState(totalComments ?? 0);

  const [draft, setDraft] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const composer = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = unwrapApiResponse<Page<Comment>>(
        (await commentApi.all(targetId, targetType)).data
      );
      setComments(page.items);
      setCursor(page.nextCursor);
    } catch (error: unknown) {
      toast.error("Couldn't load the comments", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = unwrapApiResponse<Page<Comment>>(
        (await commentApi.all(targetId, targetType, cursor)).data
      );
      setComments((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (error: unknown) {
      toast.error("Couldn't load more comments", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const closeComposer = () => {
    setDraft("");
    setComposerOpen(false);
  };

  const post = async () => {
    const content = draft.trim();
    if (!content || !user) return;
    setPosting(true);
    try {
      // the new comment is prepended from the response, so the rest of the
      // list keeps its place instead of being refetched
      const created = unwrapApiResponse<Comment>(
        (await commentApi.post(targetId, content, targetType)).data
      );
      setComments((current) => [created, ...current]);
      setCount((n) => n + 1);
      closeComposer();
    } catch (error: unknown) {
      toast.error("Couldn't post your comment", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setPosting(false);
    }
  };

  const saveEdit = async (commentId: string) => {
    const content = editDraft.trim();
    if (!content) return;
    const before = comments;
    setComments((current) =>
      current.map((c) =>
        c._id === commentId ? { ...c, content, editStatus: true } : c
      )
    );
    setEditingId(null);
    try {
      await commentApi.edit(commentId, content);
    } catch (error: unknown) {
      setComments(before);
      toast.error("Couldn't save your edit", {
        description: getApiErrorMessage(error),
      });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await commentApi.delete(pendingDelete._id);
      setComments((current) =>
        current.filter((c) => c._id !== pendingDelete._id)
      );
      setCount((n) => Math.max(0, n - 1));
      setPendingDelete(null);
    } catch (error: unknown) {
      toast.error("Couldn't delete the comment", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setDeleting(false);
    }
  };

  // optimistic: move the counts locally, roll back if the request fails
  const react = async (comment: Comment, value: "like" | "dislike") => {
    if (!user) {
      toast("Sign in to react to comments");
      return;
    }
    const next = comment.viewerReaction === value ? null : value;
    const updated: Comment = {
      ...comment,
      viewerReaction: next,
      likeCount:
        comment.likeCount -
        (comment.viewerReaction === "like" ? 1 : 0) +
        (next === "like" ? 1 : 0),
      dislikeCount:
        comment.dislikeCount -
        (comment.viewerReaction === "dislike" ? 1 : 0) +
        (next === "dislike" ? 1 : 0),
    };
    setComments((current) =>
      current.map((c) => (c._id === comment._id ? updated : c))
    );
    try {
      await (next === null
        ? reactionApi.removeReaction(comment._id, "Comment")
        : reactionApi.addReaction(comment._id, next === "like", "Comment"));
    } catch {
      setComments((current) =>
        current.map((c) => (c._id === comment._id ? comment : c))
      );
      toast.error("Couldn't save your reaction. Try again.");
    }
  };

  const heading = count > 0 ? plural(count, "comment") : "Comments";

  return (
    <section aria-labelledby="comments" className="space-y-5">
      <h2
        id="comments"
        className="text-base font-semibold tracking-tight text-fg"
      >
        {heading}
      </h2>

      <div className="flex gap-3">
        <Avatar className="mt-0.5 size-9 shrink-0">
          <AvatarImage src={user?.avatarUrl} alt="" />
          <AvatarFallback>
            {user ? user.userName.charAt(0) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Textarea
            ref={composer}
            rows={1}
            value={draft}
            disabled={!user}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={() => setComposerOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
                post();
            }}
            placeholder={user ? "Add a comment" : "Sign in to comment"}
            aria-label="Add a comment"
            className="min-h-10 resize-none"
          />
          {composerOpen && (
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="mr-auto hidden text-xs text-fg-tertiary sm:block">
                Ctrl + Enter to post
              </span>
              <Button variant="ghost" size="sm" onClick={closeComposer}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={post}
                loading={posting}
                disabled={!draft.trim()}
                className="rounded-full px-5"
              >
                Comment
              </Button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <ul className="space-y-5">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="flex gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Be the first to say something."
          className="py-10"
        />
      ) : (
        <ul className="space-y-5">
          {comments.map((comment) => {
            const name = comment.author?.userName ?? "Unknown";
            const isAuthor = Boolean(user && user._id === comment.userId);
            // whoever owns the video or post may remove any comment on it
            const canDelete = isAuthor || isContentOwner;
            const isCreator =
              contentOwnerId != null && comment.userId === contentOwnerId;
            const liked = comment.viewerReaction === "like";
            const disliked = comment.viewerReaction === "dislike";

            return (
              <li key={comment._id} className="flex gap-3">
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={comment.author?.avatarUrl} alt="" />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium text-fg">@{name}</span>
                    {isCreator && <Badge tone="brand">Creator</Badge>}
                    <span className="text-xs text-fg-tertiary">
                      {comment.relativeTime ?? formatTimeAgo(comment.createdAt)}
                      {comment.editStatus && " (edited)"}
                    </span>
                  </div>

                  {editingId === comment._id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editDraft}
                        autoFocus
                        aria-label="Edit your comment"
                        onChange={(event) => setEditDraft(event.target.value)}
                        className="resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(comment._id)}
                          disabled={!editDraft.trim()}
                          className="rounded-full px-4"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm whitespace-pre-wrap text-fg-secondary">
                      {comment.content}
                    </p>
                  )}

                  <div className="mt-1.5 flex items-center gap-1">
                    <ReactionButton
                      pressed={liked}
                      label="Like"
                      count={comment.likeCount}
                      onClick={() => react(comment, "like")}
                      icon={ThumbsUp}
                    />
                    <ReactionButton
                      pressed={disliked}
                      label="Dislike"
                      onClick={() => react(comment, "dislike")}
                      icon={ThumbsDown}
                    />

                    {canDelete && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`More actions for the comment by ${name}`}
                            className="press inline-flex size-9 items-center justify-center rounded-full text-fg-tertiary hover:bg-hover hover:text-fg"
                          >
                            <MoreVertical
                              className="size-4"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {isAuthor && (
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditingId(comment._id);
                                setEditDraft(comment.content);
                              }}
                            >
                              <Pencil aria-hidden />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setPendingDelete(comment)}
                          >
                            <Trash2 aria-hidden />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && cursor && (
        <Button variant="ghost" onClick={loadMore} loading={loadingMore}>
          Show more comments
        </Button>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete comment?"
        description="This removes the comment for everyone. It can't be undone."
        busy={deleting}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

function ReactionButton({
  pressed,
  label,
  count,
  onClick,
  icon: Icon,
}: {
  pressed: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  icon: typeof ThumbsUp;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      className={cn(
        "press inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium hover:bg-hover",
        pressed ? "text-brand-fg" : "text-fg-secondary hover:text-fg"
      )}
    >
      <Icon
        key={String(pressed)}
        className={cn("size-4", pressed && "animate-pop fill-current")}
        strokeWidth={1.75}
        aria-hidden
      />
      {count != null && count > 0 && (
        <span className="tabular-nums">{formatViews(count)}</span>
      )}
    </button>
  );
}
