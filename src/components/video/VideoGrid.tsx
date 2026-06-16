"use client"

import { VideoCard } from './VideoCard'
import { motion } from 'framer-motion'
import { VideoIcon, Sparkles } from 'lucide-react'
import { Video } from '@/lib/types/videoType'

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos }: VideoGridProps) {
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
          <h3 className="text-xl font-bold text-white/80 mb-2">No videos yet</h3>
          <p className="text-sm text-white/35 max-w-xs leading-relaxed">
            Be the first to share something amazing. Upload a video to get started.
          </p>
        </div>
      </motion.div>
    )
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
        <span className="text-xs text-white/25">{videos.length} videos</span>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
        {videos.map((video, index) => (
          <VideoCard key={video._id} video={video} index={index} />
        ))}
      </div>
    </div>
  )
}