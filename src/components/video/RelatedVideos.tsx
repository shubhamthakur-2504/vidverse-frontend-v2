"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Video } from 'lucide-react'

interface RelatedVideo {
  _id: string
  title: string
  thumbnail: string
  duration: number
  views: number
  createdAt: string
  owner: {
    _id: string
    username: string
    fullName: string
    avatar: string
  }
}

export function RelatedVideos({ currentVideoId }: { currentVideoId: string }) {
  const [videos, setVideos] = useState<RelatedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRelatedVideos()
  }, [currentVideoId])

  const fetchRelatedVideos = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call for related videos
      // const response = await videoApi.getRelated(currentVideoId)
      // setVideos(response.data.data)
      
      // Mock data for now
      setVideos([])
    } catch (error) {
      console.error('Error fetching related videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Related Videos</h3>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-40 aspect-video rounded-lg glass" />
            <div className="flex-1 space-y-2">
              <div className="h-4 glass rounded w-full" />
              <div className="h-3 glass rounded w-24" />
              <div className="h-3 glass rounded w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center space-y-4">
        <div className="glass rounded-full p-6 inline-block">
          <Video className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No related videos found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold sticky top-20 glass rounded-lg p-3 backdrop-blur-xl">
        Related Videos
      </h3>

      <div className="space-y-3">
        {videos.map((video, index) => (
          <motion.div
            key={video._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/watch/${video._id}`}>
              <div className="flex gap-3 group cursor-pointer">
                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden glass flex-shrink-0">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Duration */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-xs font-semibold">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors text-sm">
                    {video.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {video.owner.fullName}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{formatViews(video.views)} views</span>
                    <span>•</span>
                    <span>{formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}