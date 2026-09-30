"use client";

import { useState } from "react";
import { VideoCard } from "./VideoCard";
import { motion } from "framer-motion";
import { VideoIcon, Sparkles, Loader2 } from "lucide-react";
import { Video } from "@/lib/types/videoType";
import { Page } from "@/lib/types/apiType";
import videoApi from "@/lib/api/client/videoApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import { toast } from "sonner";

interface VideoGridProps {
  initialVideos: Video[];
  initialCursor: string | null;
  category?: string;
}

export function VideoGrid({
  initialVideos,
  initialCursor,
  category,
}: VideoGridProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await videoApi.getAll({ category, cursor });
      const page: Page<Video> = res.data.data;
      setVideos((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (error: unknown) {
      toast.error("Could not load more videos", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-28 space-y-5"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl scale-150" />
          <div className="relative w-24 h-24 rounded-3xl glass-card flex items-center justify-center">
            <VideoIcon className="h-10 w-10 text-white/30" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white/80 mb-2">
            No videos yet
          </h3>
          <p className="text-sm text-white/35 max-w-xs leading-relaxed">
            Be the first to share something amazing. Upload a video to get
            started.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Recommended
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
        {videos.map((video, index) => (
          <VideoCard key={video._id} video={video} index={index} />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.09] transition-colors disabled:opacity-60"
          >
            {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
