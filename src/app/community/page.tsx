import type { Metadata } from "next";
import { postApi } from "@/lib/api/server/postApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { Page } from "@/lib/types/apiType";
import type { Post } from "@/lib/types/postType";
import { PostFeed } from "@/components/posts/PostFeed";

export const metadata: Metadata = { title: "Community · VidVerse" };

export default async function CommunityPage() {
  let posts: Page<Post> = { items: [], nextCursor: null };
  try {
    posts = unwrapApiResponse<Page<Post>>(await postApi.getFeed());
  } catch {
    /* shows the empty state */
  }

  return (
    <div className="min-h-screen bg-bg pt-16">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Community
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          Updates, questions and behind-the-scenes posts from creators.
        </p>
        <div className="mt-8">
          {/* the composer shows a sign-in prompt to visitors */}
          <PostFeed
            source={{ kind: "all" }}
            initial={posts}
            showComposer
            emptyMessage="No posts yet. Be the first to share something."
          />
        </div>
      </div>
    </div>
  );
}
