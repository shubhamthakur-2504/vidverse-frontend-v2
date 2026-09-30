"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Post } from "@/lib/types/postType";
import { buttonGhost } from "@/components/studio/styles";
import { PostCard } from "./PostCard";

export function SinglePost({ post }: { post: Post }) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <Link href="/community" className={`${buttonGhost} -ml-2.5`}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Community
      </Link>
      {/* after a delete there is nothing left to show here */}
      <PostCard
        post={post}
        defaultShowComments
        onDeleted={() => router.replace("/community")}
      />
    </div>
  );
}
