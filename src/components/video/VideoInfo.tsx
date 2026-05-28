"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, Share2, MoreVertical } from 'lucide-react'
import { formatViews, formatTimeAgo } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import reactionApi from '@/lib/api/client/reactionApi'
import subscriptionApi from '@/lib/api/client/subscriptionApi'
import { toast } from 'sonner'
import { Video } from '@/lib/types/videoType'
interface VideoInfoProps {
  video: Video
}

export function VideoInfo({ video }: VideoInfoProps) {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [likeStatus, setLikeStatus] = useState<'liked' | 'disliked' | null>(null)
  const [likeCount, setLikeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchVideoStats()
  }, [video._id, user])

  const fetchVideoStats = async () => {
    try {
      // Fetch subscription status
      const subStatus = await subscriptionApi.status(video.owner._id)
      setIsSubscribed(subStatus.data.data.isSubscribed)

      // Fetch subscriber count
      const subCount = await subscriptionApi.count(video.owner._id)
      setSubscriberCount(subCount.data.data.count)

      // Fetch like status and count
      if (user) {
        const likeStatusRes = await reactionApi.status(video._id, 'Video')
        setLikeStatus(
          likeStatusRes.data.data.isLiked 
            ? 'liked' 
            : likeStatusRes.data.data.isDisliked 
            ? 'disliked' 
            : null
        )
      }

      const likeCountRes = await reactionApi.countLikes(video._id, 'Video')
      setLikeCount(likeCountRes.data.data.likesCount)
    } catch (error) {
      console.error('Error fetching video stats:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Login required', {
        description: 'Please login to subscribe to channels'
      })
      return
    }

    setIsLoading(true)
    try {
      if (isSubscribed) {
        await subscriptionApi.unsubscribe(video.owner._id)
        setIsSubscribed(false)
        setSubscriberCount(prev => prev - 1)
        toast.success('Unsubscribed successfully')
      } else {
        await subscriptionApi.subscribe(video.owner._id)
        setIsSubscribed(true)
        setSubscriberCount(prev => prev + 1)
        toast.success('Subscribed successfully')
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update subscription'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Login required', {
        description: 'Please login to like videos'
      })
      return
    }

    try {
      if (likeStatus === 'liked') {
        await reactionApi.removeReaction(video._id, 'Video')
        setLikeStatus(null)
        setLikeCount(prev => prev - 1)
      } else {
        await reactionApi.addReaction(video._id, true, 'Video')
        if (likeStatus === 'disliked') setLikeCount(prev => prev + 1)
        setLikeStatus('liked')
        setLikeCount(prev => prev + 1)
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update like'
      })
    }
  }

  const handleDislike = async () => {
    if (!user) {
      toast.error('Login required', {
        description: 'Please login to dislike videos'
      })
      return
    }

    try {
      if (likeStatus === 'disliked') {
        await reactionApi.removeReaction(video._id, 'Video')
        setLikeStatus(null)
      } else {
        await reactionApi.addReaction(video._id, false, 'Video')
        if (likeStatus === 'liked') setLikeCount(prev => prev - 1)
        setLikeStatus('disliked')
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update dislike'
      })
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video.title,
        url: window.location.href
      })
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 space-y-4"
    >
      {/* Title */}
      <h1 className="text-2xl font-bold">{video.title}</h1>

      {/* Stats and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Channel Info */}
        <div className="flex items-center gap-4 flex-1">
          <Link href={`/channel/${video.owner.userName}`}>
            <Avatar className="h-12 w-12 ring-2 ring-blue-500/50 cursor-pointer hover:ring-blue-500 transition-all">
              <AvatarImage src={video.owner.avatarUrl} alt={video.owner.userName} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500">
                {video.owner.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1">
            <Link href={`/channel/${video.owner.userName}`}>
              <h3 className="font-semibold hover:text-blue-400 transition-colors cursor-pointer">
                {video.owner.fullName}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatViews(subscriberCount)} subscribers
            </p>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={isLoading || video.owner._id === user?._id}
            className={
              isSubscribed
                ? "glass-hover"
                : "bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            }
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Like/Dislike */}
          <div className="flex items-center glass rounded-full overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`rounded-none ${likeStatus === 'liked' ? 'text-blue-400' : ''}`}
            >
              <ThumbsUp className={`h-5 w-5 mr-2 ${likeStatus === 'liked' ? 'fill-current' : ''}`} />
              {likeCount > 0 && formatViews(likeCount)}
            </Button>
            <div className="w-px h-6 bg-white/10" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={`rounded-none ${likeStatus === 'disliked' ? 'text-blue-400' : ''}`}
            >
              <ThumbsDown className={`h-5 w-5 ${likeStatus === 'disliked' ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Share */}
          <Button variant="ghost" size="sm" onClick={handleShare} className="glass rounded-full">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>

          {/* More */}
          <Button variant="ghost" size="icon" className="glass rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Description */}
      {video.description && (
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
          
          <p className={`whitespace-pre-wrap ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {video.description}
          </p>
          
          {video.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold mt-2 hover:text-blue-400 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}