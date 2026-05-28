"use client"

import { VideoCard } from './VideoCard'
import { motion } from 'framer-motion'
import { Video } from 'lucide-react'
import { Video as VideoType } from '@/lib/types/videoType'

interface VideoGridProps {
  videos: VideoType[]
}

export function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <div className="glass rounded-full p-8">
          <Video className="h-16 w-16 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold">No videos yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Be the first to share your story! Upload a video to get started.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <VideoCard key={video._id} video={video} index={index} />
      ))}
    </div>
  )
}