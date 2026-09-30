// GET /v2/me/notifications: one notification with the actor and a short preview of what it is about
export interface AppNotification {
  _id: string
  type: 'subscribe' | 'video' | 'comment'
  actor: { _id: string; userName: string; fullName: string; avatarUrl: string } | null
  video: { _id: string; title: string; thumbnailUrl?: string } | null
  post: { _id: string; content: string } | null
  comment: { _id: string; content: string } | null
  readAt: string | null
  createdAt: string
}
