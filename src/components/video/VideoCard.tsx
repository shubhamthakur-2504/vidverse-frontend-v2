"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatViews, formatTimeAgo, formatDuration } from "@/lib/utils";
import { motion } from "framer-motion";
import { Play, Eye } from "lucide-react";
import { useState } from "react";
import { VideoSummary } from "@/lib/types/videoType";

interface VideoCardProps {
  video: VideoSummary;
  index?: number;
}

export function VideoCard({ video, index = 0 }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const watchHref = `/watch/${video._id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // keyboard focus on any link in the card shows the same hover state
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group video-card-hover"
    >
      {/* real links (M13): middle-click, open in new tab, prefetch and keyboard access. Links cannot nest, so the
          thumbnail and the title each link to the video, and the channel links sit beside them */}
      <div className="space-y-3">
        {/* Thumbnail: a pointer target only; the title link below is the keyboard stop */}
        <Link
          href={watchHref}
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-video rounded-2xl overflow-hidden bg-[#111118] border border-white/[0.06]"
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Dark gradient overlay on hover */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          />

          {/* Play button */}
          <motion.div
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.7,
            }}
            transition={{ duration: 0.2, ease: "backOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              <Play className="h-6 w-6 fill-white text-white ml-0.5" />
            </div>
          </motion.div>

          {/* Duration badge */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded-md text-xs font-semibold text-white tracking-wide">
            {formatDuration(video.duration)}
          </div>

          {/* Views badge on hover */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded-md text-xs text-white/80"
          >
            <Eye className="h-3 w-3" />
            {formatViews(video.views)}
          </motion.div>
        </Link>

        {/* Info */}
        <div className="flex gap-3 px-0.5">
          <Link
            href={`/channel/${video.owner.userName}`}
            className="flex-shrink-0"
            aria-label={`${video.owner.userName} channel`}
          >
            <Avatar className="h-8 w-8 ring-1 ring-white/[0.08] group-hover:ring-violet-500/40 transition-all duration-300 flex-shrink-0 mt-0.5">
              <AvatarImage
                src={video.owner.avatarUrl}
                alt={video.owner.userName}
              />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-500 text-white text-xs font-semibold">
                {video.owner.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 text-white/90 group-hover:text-white transition-colors leading-snug mb-1">
              <Link
                href={watchHref}
                className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-fg"
              >
                {video.title}
              </Link>
            </h3>
            <Link
              href={`/channel/${video.owner.userName}`}
              className="block w-fit text-xs text-fg-tertiary hover:text-fg-secondary transition-colors mb-0.5"
            >
              {video.owner.userName}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <span>{formatViews(video.views)} views</span>
              <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
