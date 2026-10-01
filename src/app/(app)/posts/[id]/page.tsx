import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { postApi } from "@/lib/api/server/postApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { Post } from "@/lib/types/postType";
import { SinglePost } from "@/components/posts/SinglePost";

type PostPageProps = { params: Promise<{ id: string }> };

// shared by generateMetadata and the page, so the post is fetched once per request
const loadPost = cache(async (id: string): Promise<Post | null> => {
  try {
    return unwrapApiResponse<Post>(await postApi.getPost(id));
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await loadPost((await params).id);
  return {
    title: post
      ? `${post.owner.fullName} on VidVerse: "${post.content.slice(0, 60)}"`
      : "Post not found · VidVerse",
  };
}

// a single community post with its comments open (linked from notifications)
export default async function PostPage({ params }: PostPageProps) {
  const post = await loadPost((await params).id);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <SinglePost post={post} />
      </div>
    </div>
  );
}
