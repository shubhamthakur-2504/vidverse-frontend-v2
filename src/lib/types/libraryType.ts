import type { Video, VideoSummary } from './videoType'

// GET /v2/playlists[?videoId=]: one of my playlists; hasVideo is set only when a videoId was passed
export interface MyPlaylist {
  _id: string
  title: string
  description?: string
  thumbnailUrl?: string
  updatedAt: string
  videoCount: number
  hasVideo?: boolean
}

// GET /v2/playlists/:id: a public playlist with the videos the viewer may see, in playlist order
export interface PlaylistDetails {
  _id: string
  title: string
  description?: string
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  owner: Video['owner']
  videos: VideoSummary[]
  isOwner: boolean
}

// GET /v2/me/history: most recently watched first
export type HistoryVideo = VideoSummary
