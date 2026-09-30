"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import postApi from "@/lib/api/client/postApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import type { Page } from "@/lib/types/apiType";
import type { Post } from "@/lib/types/postType";
import { buttonSecondary } from "@/components/studio/styles";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";

export type PostSource =
  | { kind: "all" }
  | { kind: "channel"; userName: string };

const fetchPage = (source: PostSource, cursor: string) =>
  source.kind === "channel"
    ? postApi.channel(source.userName, cursor)
    : postApi.feed(cursor);

// a server-rendered first page of posts with "Load more"; the composer (when shown) adds new posts on top
export function PostFeed({
  source,
  initial,
  showComposer,
  emptyMessage,
}: {
  source: PostSource;
  initial: Page<Post>;
  showComposer: boolean;
  emptyMessage: string;
}) {
  const [posts, setPosts] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const page: Page<Post> = (await fetchPage(source, cursor)).data.data;
      setPosts((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (error: unknown) {
      toast.error("Couldn't load more posts.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showComposer && (
        <PostComposer
          onCreated={(post) => setPosts((current) => [post, ...current])}
        />
      )}
      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-fg-secondary">
          {emptyMessage}
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDeleted={(id) =>
              setPosts((current) => current.filter((p) => p._id !== id))
            }
          />
        ))
      )}
      {cursor && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className={buttonSecondary}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
