"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import postApi from "@/lib/api/client/postApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import type { Post } from "@/lib/types/postType";
import { buttonGhost, buttonPrimary, card } from "@/components/studio/styles";

const MAX_LENGTH = 500;
const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export function PostComposer({
  onCreated,
}: {
  onCreated: (post: Post) => void;
}) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  if (!user) {
    return (
      <div className={`${card} p-4 text-sm text-fg-secondary`}>
        <Link
          href="/auth/login?redirect=/community"
          className="font-medium text-brand-fg hover:underline"
        >
          Sign in
        </Link>{" "}
        to share a post with the community.
      </div>
    );
  }

  const clearImage = () => {
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = content.trim();
    if (!text) return;
    setPosting(true);
    try {
      const form = new FormData();
      form.append("content", text);
      if (image) form.append("image", image);
      const created = (await postApi.create(form)).data.data;
      // read it back in the list shape (author, counts, edit window)
      onCreated((await postApi.get(created._id)).data.data);
      setContent("");
      clearImage();
    } catch (error: unknown) {
      toast.error("Couldn't publish your post. Try again.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${card} p-4`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.avatarUrl} alt="" />
          <AvatarFallback className="bg-elevated font-semibold text-fg">
            {user.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <label htmlFor="post-content" className="sr-only">
            Write a post
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            placeholder="Share an update with your subscribers"
            className="w-full resize-y rounded-md border border-line-default bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-tertiary focus:border-brand-fg focus:outline-none"
          />
          {preview && (
            <div className="relative mt-3 w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object url preview */}
              <img
                src={preview}
                alt="Attached image preview"
                className="max-h-60 rounded-md border border-line"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove image"
                className="absolute right-2 top-2 rounded-full bg-bg/80 p-1 text-fg hover:bg-bg"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <input
              ref={fileRef}
              id="post-image"
              type="file"
              accept={IMAGE_TYPES}
              className="sr-only"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="post-image"
              className={`${buttonGhost} cursor-pointer`}
            >
              <ImagePlus className="h-4 w-4" aria-hidden />
              Image
            </label>
            <span className="ml-auto text-xs tabular-nums text-fg-tertiary">
              {content.length}/{MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={!content.trim() || posting}
              className={buttonPrimary}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
