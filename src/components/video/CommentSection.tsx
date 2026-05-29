"use client"

import { useState, useEffect, useCallback, ChangeEvent } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ThumbsUp, ThumbsDown, Trash2, Edit2, Send } from 'lucide-react'
import { formatTimeAgo, formatViews } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import commentApi from '@/lib/api/client/commentApi'
import { commentApi as readComment } from '@/lib/api/server/commentApi'
import reactionApi from '@/lib/api/client/reactionApi'
import { Comment } from '@/lib/types/commentType'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { toast } from 'sonner'

export function CommentSection({ targetId, targetType }: { targetId: string, targetType: "Video" | "Tweet" }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await readComment.all(targetId, targetType)
      const data = unwrapApiResponse<Comment[]>(response)
      if (user != null && Array.isArray(data)) {
        for (const comment of data) {
          try {
            const res = await reactionApi.status(comment._id, 'Comment')
            const status = unwrapApiResponse<{ isLiked?: boolean; isDisliked?: boolean }>(res.data)
            comment.isLiked = !!status.isLiked
            comment.isDisliked = !!status.isDisliked
          } catch {
            // Ignore reaction fetch errors
          }
        }
      }
      setComments(data || [])
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load comments'
      toast.error('Error', {
        description: message
      })
    } finally {
      setIsLoading(false)
    }
  }, [targetId, targetType, user])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('Login required', {
        description: 'Please login to comment'
      })
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await commentApi.post(targetId, newComment, targetType)
      setNewComment('')
      await fetchComments() 
      toast.success('Comment posted successfully')
    } catch {
      toast.error('Error', {
        description: 'Failed to post comment'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.delete(commentId, targetType)
      await fetchComments() // Reload comments
      toast.success('Comment deleted successfully')
    } catch {
      toast.error('Error', {
        description: 'Failed to delete comment'
      })
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await commentApi.edit(commentId, editContent, targetType)
      setEditingId(null)
      setEditContent('')
      await fetchComments()
      toast.success('Comment updated successfully')
    } catch {
      toast.error('Error', {
        description: 'Failed to update comment'
      })
    }
  }

  const handleCommentReaction = async (commentId: string, isLike: boolean, currentStatus: string | null) => {
    if (!user) {
      toast.error('Login required', {
        description: 'Please login to react to comments'
      })
      return
    }

    try {
      // need to test
      if (currentStatus === (isLike ? 'liked' : 'disliked')) {
        await reactionApi.removeReaction(commentId, 'Comment')
      } else {
        await reactionApi.addReaction(commentId, isLike, 'Comment')
      }
      await fetchComments()
    } catch {
      toast.error('Error', {
        description: 'Failed to update reaction'
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl p-6 space-y-6"
    >
      {/* Header */}
      <h2 className="text-xl font-bold">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Add Comment */}
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 ring-2 ring-blue-500/50">
          <AvatarImage src={user?.avatarUrl} alt={user?.userName || 'Guest'} />
          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500">
            {user ? user.userName.charAt(0).toUpperCase() : 'G'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
            placeholder={user ? 'Share your thoughts...' : 'Login to comment'}
            disabled={!user}
            className="glass border-white/10 focus-visible:ring-blue-500/50 resize-none min-h-20 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {!user && (
            <p className="text-sm text-muted-foreground">
              Sign in to share your thoughts and join the conversation.
            </p>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setNewComment('')}
              disabled={!user || !newComment.trim() || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitComment}
              disabled={!user || !newComment.trim() || isSubmitting}
              className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isSubmitting ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full glass" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 glass rounded w-32" />
                  <div className="h-3 glass rounded w-full" />
                  <div className="h-3 glass rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 group"
              >
                {(() => {
                  const commenterName = comment.userName ?? comment.userDetails?.userName ?? 'Unknown user'
                  const commenterAvatar = comment.avatarUrl ?? comment.userDetails?.avatarUrl ?? ''
                  const commenterTime = comment.relativeTime ?? (comment.createdAt ? formatTimeAgo(comment.createdAt) : 'just now')
                  const canManageComment = Boolean(user && comment.userId && user._id === comment.userId)

                  return (
                    <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={commenterAvatar} alt={commenterName} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500">
                    {commenterName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{commenterName}</span>
                    <span className="text-sm text-muted-foreground">
                      {commenterName}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {commenterTime}
                    </span>
                  </div>

                  {/* Content */}
                  {editingId === comment._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                        className="glass border-white/10 resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null)
                            setEditContent('')
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment._id)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Like/Dislike */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentReaction(
                          comment._id,
                          true,
                          comment.isLiked ? 'liked' : comment.isDisliked ? 'disliked' : null
                        )}
                        className={comment.isLiked ? 'text-blue-400' : ''}
                      >
                        <ThumbsUp className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likesCount && comment.likesCount > 0 && (
                          <span className="ml-1 text-xs">{formatViews(comment.likesCount)}</span>
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentReaction(
                          comment._id,
                          false,
                          comment.isLiked ? 'liked' : comment.isDisliked ? 'disliked' : null
                        )}
                        className={comment.isDisliked ? 'text-blue-400' : ''}
                      >
                        <ThumbsDown className={`h-4 w-4 ${comment.isDisliked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    {/* Edit/Delete (only for comment owner) */}
                    {canManageComment && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(comment._id)
                            setEditContent(comment.content)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                    </>
                  )
                })()}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}