// GET /v2/channels/:userName: the channel header, with counts and the viewer's own state
export interface Channel {
  _id: string
  userName: string
  fullName: string
  avatarUrl: string
  coverImageUrl?: string
  createdAt: string
  subscribersCount: number
  videosCount: number
  isSubscribed: boolean
  isOwner: boolean
}

// GET /v2/channels/:userName/playlists
export interface ChannelPlaylist {
  _id: string
  title: string
  description?: string
  thumbnailUrl?: string
  updatedAt: string
  videoCount: number
}

// GET /v2/me/subscriptions: one followed channel, most recently followed first
export interface SubscriptionItem {
  _id: string
  createdAt: string
  channel: { _id: string; userName: string; fullName: string; avatarUrl: string }
}
