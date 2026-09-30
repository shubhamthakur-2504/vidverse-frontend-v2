"use client";

import Link from "next/link";
import Image from "next/image";
import { formatViews, formatTimeAgo, formatDuration } from "@/lib/utils";
import { motion } from "framer-motion";
import { VideoIcon } from "lucide-react";
import { Video } from "@/lib/types/videoType";

// "up next": the watch page fetches these server-side (GET /v2/videos/:id/related) and passes them in
export function RelatedVideos({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center">
          <VideoIcon className="h-6 w-6 text-white/25" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-white/30">No related videos found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">Up Next</h3>
      </div>

      {/* Video list */}
      <div className="space-y-2">
        {videos.map((video, index) => (
          <motion.div
            key={video._id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <Link href={`/watch/${video._id}`}>
              <div className="flex gap-3 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200">
                {/* Thumbnail */}
                <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-[#111118] flex-shrink-0 border border-white/[0.05]">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="144px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Duration */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[10px] font-semibold text-white">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="text-sm font-semibold text-white/85 group-hover:text-white line-clamp-2 leading-snug transition-colors mb-1">
                    {video.title}
                  </h4>
                  <p className="text-xs text-white/35 hover:text-white/60 transition-colors truncate mb-1">
                    {video.owner.fullName}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-white/25">
                    <span>{formatViews(video.views)} views</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                    <span>{formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
