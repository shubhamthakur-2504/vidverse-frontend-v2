"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThumbsUp, ThumbsDown, Share2, Bell, ChevronDown, ChevronUp, Eye, Calendar } from 'lucide-react'
import { formatViews, formatTimeAgo } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import reactionApi from '@/lib/api/client/reactionApi'
import subscriptionApi from '@/lib/api/client/subscriptionApi'
import { toast } from 'sonner'
import { WatchVideo } from '@/lib/types/videoType'

interface VideoInfoProps {
  video: WatchVideo
}

export function VideoInfo({ video }: VideoInfoProps) {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  // counts and the viewer's own state come with the server-rendered payload (GET /v2/videos/:id)
  const [isSubscribed, setIsSubscribed] = useState(video.viewer.isSubscribed)
  const [subscriberCount, setSubscriberCount] = useState(video.owner.subscribersCount)
  const [likeStatus, setLikeStatus] = useState<'liked' | 'disliked' | null>(
    video.viewer.reaction === 'like' ? 'liked' : video.viewer.reaction === 'dislike' ? 'disliked' : null
  )
  const [likeCount, setLikeCount] = useState(video.stats.likes)
  const [isSubLoading, setIsSubLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) return toast.error('Login required', { description: 'Please login to subscribe' })
    setIsSubLoading(true)
    try {
      if (isSubscribed) {
        await subscriptionApi.unsubscribe(video.owner._id)
        setIsSubscribed(false)
        setSubscriberCount(p => p - 1)
        toast.success('Unsubscribed')
      } else {
        await subscriptionApi.subscribe(video.owner._id)
        setIsSubscribed(true)
        setSubscriberCount(p => p + 1)
        toast.success('Subscribed!')
      }
    } catch {
      toast.error('Error', { description: 'Failed to update subscription' })
    } finally {
      setIsSubLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) return toast.error('Login required', { description: 'Please login to like videos' })
    try {
      if (likeStatus === 'liked') {
        await reactionApi.removeReaction(video._id, 'Video')
        setLikeStatus(null)
        setLikeCount(p => p - 1)
      } else {
        // a dislike never counted as a like, so switching from dislike to like adds exactly one
        await reactionApi.addReaction(video._id, true, 'Video')
        setLikeStatus('liked')
        setLikeCount(p => p + 1)
      }
    } catch {
      toast.error('Error', { description: 'Failed to update like' })
    }
  }

  const handleDislike = async () => {
    if (!user) return toast.error('Login required', { description: 'Please login to react' })
    try {
      if (likeStatus === 'disliked') {
        await reactionApi.removeReaction(video._id, 'Video')
        setLikeStatus(null)
      } else {
        await reactionApi.addReaction(video._id, false, 'Video')
        if (likeStatus === 'liked') setLikeCount(p => p - 1)
        setLikeStatus('disliked')
      }
    } catch {
      toast.error('Error', { description: 'Failed to update reaction' })
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({ title: video.title, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
        {video.title}
      </h1>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-sm text-white/35">
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          {formatViews(video.views)} views
        </span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatTimeAgo(video.createdAt)}
        </span>
      </div>

      {/* Channel row + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-white/[0.06]">

        {/* Channel info */}
        <div className="flex items-center gap-3">
          <Link href={`/channel/${video.owner.userName}`} className="flex items-center gap-3 group/channel">
            <Avatar className="h-11 w-11 ring-2 ring-white/[0.08]">
              <AvatarImage src={video.owner.avatarUrl} alt={video.owner.userName} />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-semibold">
                {video.owner.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold text-white text-sm group-hover/channel:text-brand-fg transition-colors">
                {video.owner.userName}
              </p>
              <p className="text-xs text-white/35">{formatViews(subscriberCount)} subscribers</p>
            </div>
          </Link>

          {/* Subscribe button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubscribe}
            disabled={isSubLoading || video.viewer.isOwner}
            className={`ml-3 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${isSubscribed
              ? 'btn-subscribed'
              : 'btn-subscribe shadow-lg shadow-violet-500/20'
              }`}
          >
            {isSubscribed && <Bell className="h-3.5 w-3.5" />}
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </motion.button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Like/Dislike pill */}
          <div className="flex items-center rounded-full overflow-hidden bg-white/[0.06] border border-white/[0.08]">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${likeStatus === 'liked'
                ? 'text-violet-400 bg-violet-500/15'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
            >
              <ThumbsUp className={`h-4 w-4 ${likeStatus === 'liked' ? 'fill-violet-400' : ''}`} />
              {likeCount > 0 && <span>{formatViews(likeCount)}</span>}
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button
              onClick={handleDislike}
              className={`flex items-center px-4 py-2 text-sm transition-all ${likeStatus === 'disliked'
                ? 'text-red-400 bg-red-500/15'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
            >
              <ThumbsDown className={`h-4 w-4 ${likeStatus === 'disliked' ? 'fill-red-400' : ''}`} />
            </button>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.09] transition-all"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>

        </div>
      </div>

      {/* Description */}
      {video.description && (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <AnimatePresence initial={false}>
            <motion.p
              key={isExpanded ? 'expanded' : 'collapsed'}
              className={`text-sm text-white/60 whitespace-pre-wrap leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}
            >
              {video.description}
            </motion.p>
          </AnimatePresence>

          {video.description.length > 180 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              {isExpanded ? (
                <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" /> Show more</>
              )}
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}