"use client"

import { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ThumbsUp, ThumbsDown, Trash2, Edit2, Send, MessageSquare, ChevronDown } from 'lucide-react'
import { formatTimeAgo, formatViews } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import commentApi from '@/lib/api/client/commentApi'
import reactionApi from '@/lib/api/client/reactionApi'
import { Comment } from '@/lib/types/commentType'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { Page } from '@/lib/types/apiType'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { toast } from 'sonner'

export function CommentSection({ targetId, targetType }: { targetId: string, targetType: 'Video' | 'Tweet' }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // adds the signed-in user's like/dislike state to each comment
  const withReactionStatus = useCallback(async (items: Comment[]) => {
    if (user == null) return items
    for (const comment of items) {
      try {
        const res = await reactionApi.status(comment._id, 'Comment')
        const statusObj = unwrapApiResponse<{ status: 'like' | 'dislike' | 'none' }>(res.data)
        comment.isLiked = statusObj.status === 'like'
        comment.isDisliked = statusObj.status === 'dislike'
      } catch { /* ignore */ }
    }
    return items
  }, [user])

  // (re)loads the first page, newest first
  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await commentApi.all(targetId, targetType)
      const page = unwrapApiResponse<Page<Comment>>(response.data)
      setComments(await withReactionStatus(page.items))
      setCursor(page.nextCursor)
    } catch (error: unknown) {
      toast.error('Error', { description: getApiErrorMessage(error, 'Failed to load comments') })
    } finally {
      setIsLoading(false)
    }
  }, [targetId, targetType, withReactionStatus])

  const loadMoreComments = async () => {
    if (!cursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const response = await commentApi.all(targetId, targetType, cursor)
      const page = unwrapApiResponse<Page<Comment>>(response.data)
      const items = await withReactionStatus(page.items)
      setComments((current) => [...current, ...items])
      setCursor(page.nextCursor)
    } catch (error: unknown) {
      toast.error('Error', { description: getApiErrorMessage(error, 'Failed to load more comments') })
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => { fetchComments() }, [fetchComments])

  const handleSubmitComment = async () => {
    if (!user) return toast.error('Login required', { description: 'Please login to comment' })
    if (!newComment.trim()) return
    setIsSubmitting(true)
    try {
      await commentApi.post(targetId, newComment, targetType)
      setNewComment('')
      setIsFocused(false)
      await fetchComments()
      toast.success('Comment posted!')
    } catch {
      toast.error('Error', { description: 'Failed to post comment' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.delete(commentId, targetType)
      await fetchComments()
      toast.success('Comment deleted')
    } catch {
      toast.error('Error', { description: 'Failed to delete comment' })
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return
    try {
      await commentApi.edit(commentId, editContent, targetType)
      setEditingId(null)
      setEditContent('')
      await fetchComments()
      toast.success('Comment updated')
    } catch {
      toast.error('Error', { description: 'Failed to update comment' })
    }
  }

  const handleCommentReaction = async (commentId: string, isLike: boolean, currentStatus: string | null) => {
    if (!user) return toast.error('Login required', { description: 'Please login to react' })
    try {
      if (currentStatus === (isLike ? 'liked' : 'disliked')) {
        await reactionApi.removeReaction(commentId, 'Comment')
      } else {
        await reactionApi.addReaction(commentId, isLike, 'Comment')
      }
      await fetchComments()
    } catch {
      toast.error('Error', { description: 'Failed to update reaction' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-violet-400" strokeWidth={1.75} />
        <h2 className="text-lg font-bold text-white">
          {/* the total is unknown until the last page is loaded */}
          {comments.length > 0
            ? `${comments.length}${cursor ? '+' : ''} ${comments.length === 1 && !cursor ? 'Comment' : 'Comments'}`
            : 'Comments'}
        </h2>
      </div>

      {/* Add comment box */}
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 ring-1 ring-white/[0.08] flex-shrink-0 mt-0.5">
          <AvatarImage src={user?.avatarUrl} alt={user?.userName || 'Guest'} />
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-500 text-white text-sm font-semibold">
            {user ? user.userName.charAt(0).toUpperCase() : 'G'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className={`relative rounded-xl border transition-all duration-200 ${
            isFocused
              ? 'border-violet-500/50 shadow-lg shadow-violet-500/10 bg-white/[0.05]'
              : 'border-white/[0.07] bg-white/[0.03]'
          }`}>
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
              placeholder={user ? 'Add a comment...' : 'Login to join the conversation'}
              disabled={!user}
              onFocus={() => setIsFocused(true)}
              onBlur={() => !newComment && setIsFocused(false)}
              className="bg-transparent border-0 focus-visible:ring-0 resize-none min-h-[80px] text-sm text-white/80 placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <AnimatePresence>
            {(isFocused || newComment) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-end gap-2 overflow-hidden"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setNewComment(''); setIsFocused(false) }}
                  className="text-white/40 hover:text-white rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!user || !newComment.trim() || isSubmitting}
                  className="flex items-center gap-2 rounded-full px-5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 border-0 disabled:opacity-40 shadow-md shadow-violet-500/20"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {isSubmitting ? 'Posting...' : 'Comment'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-white/[0.06]" />

      {/* Comment list */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-9 w-9 rounded-full shimmer-container flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 shimmer-container rounded-md w-36" />
                  <div className="h-3 shimmer-container rounded-md w-full" />
                  <div className="h-3 shimmer-container rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="h-10 w-10 text-white/10 mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm text-white/30">No comments yet — be the first!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => {
              const commenterName = comment.userName ?? comment.userDetails?.userName ?? 'Unknown'
              const commenterAvatar = comment.avatarUrl ?? comment.userDetails?.avatarUrl ?? ''
              const commenterTime = comment.relativeTime ?? (comment.createdAt ? formatTimeAgo(comment.createdAt) : 'just now')
              const canManage = Boolean(user && comment.userId && user._id === comment.userId)
              const reactionStatus = comment.isLiked ? 'liked' : comment.isDisliked ? 'disliked' : null

              return (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex gap-3 group"
                >
                  <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-white/[0.06]">
                    <AvatarImage src={commenterAvatar} alt={commenterName} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-700 to-cyan-600 text-white text-xs font-semibold">
                      {commenterName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Name + time */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-white/90">{commenterName}</span>
                      <span className="text-xs text-white/25">{commenterTime}</span>
                    </div>

                    {/* Content or edit mode */}
                    {editingId === comment._id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                          className="bg-white/[0.05] border-white/[0.08] focus-visible:ring-violet-500/40 resize-none text-sm text-white/80 rounded-xl"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingId(null); setEditContent('') }}
                            className="text-white/40 hover:text-white rounded-full text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment._id)}
                            className="bg-violet-600 hover:bg-violet-500 text-white rounded-full text-xs px-4"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-white/65 leading-relaxed">{comment.content}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-2.5">
                      <button
                        onClick={() => handleCommentReaction(comment._id, true, reactionStatus)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          comment.isLiked
                            ? 'text-violet-400 bg-violet-500/15'
                            : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                        }`}
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-violet-400' : ''}`} />
                        {comment.likesCount && comment.likesCount > 0 && formatViews(comment.likesCount)}
                      </button>

                      <button
                        onClick={() => handleCommentReaction(comment._id, false, reactionStatus)}
                        className={`flex items-center px-2.5 py-1 rounded-full text-xs transition-all ${
                          comment.isDisliked
                            ? 'text-red-400 bg-red-500/15'
                            : 'text-white/35 hover:text-white/70 hover:bg-white/[0.06]'
                        }`}
                      >
                        <ThumbsDown className={`h-3.5 w-3.5 ${comment.isDisliked ? 'fill-red-400' : ''}`} />
                      </button>

                      {/* Owner controls */}
                      {canManage && (
                        <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingId(comment._id); setEditContent(comment.content) }}
                            className="p-1.5 rounded-full text-white/25 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="p-1.5 rounded-full text-white/25 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {!isLoading && cursor && (
        <button
          onClick={loadMoreComments}
          disabled={isLoadingMore}
          className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-60"
        >
          {isLoadingMore ? 'Loading...' : 'Show more comments'}
        </button>
      )}
    </motion.div>
  )
}