"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { Video } from '@/lib/types/videoType'
import { useRouter } from 'next/navigation'

interface VideoCardProps {
  video: Video
  index?: number
}

export function VideoCard({ video, index = 0 }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div className="space-y-3" onClick={() => router.push(`/watch/${video._id}`)}>

        <div className="relative aspect-video rounded-xl overflow-hidden glass">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw,
                   (max-width: 1024px) 50vw,
                   25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent 
                       flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-full glass flex items-center justify-center"
            >
              <Play className="h-8 w-8 fill-white text-white ml-1" />
            </motion.div>
          </motion.div>


          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm 
                          rounded text-xs font-semibold">
            {formatDuration(video.duration)}
          </div>
          
        </div>


        <div className="flex gap-3">

          <Link href={`/channel/${video.owner.userName}`} onClick={(e) => e.stopPropagation()}>
            <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all">
              <AvatarImage src={video.owner.avatarUrl} alt={video.owner.userName} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500">
                {video.owner.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>
            <Link
              href={`/channel/${video.owner.userName}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {video.owner.userName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}