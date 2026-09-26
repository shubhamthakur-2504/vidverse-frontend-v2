type UploadVideoPayload = {
  title: string;
  description?: string;
  videoFile: File;
  thumbnailFile?: File;
}

type UpdateVideoPayload =
  | { title: string; description?: string; thumbnail?: File }
  | { description: string; title?: string; thumbnail?: File }
  | { thumbnail: File; title?: string; description?: string };

type PlayListPayload = {
  title: string;
  description?: string;
  thumbnail?: File;
}

type EditPlayListPayload = {
  playlistId: string;
  videoId: string;
}

export interface Video {
  _id: string
  title: string
  thumbnailUrl: string
  videoFileUrl: string
  description: string
  duration: number
  views: number
  isPublished?: boolean
  status?: 'processing' | 'ready' | 'failed'
  category?: string
  createdAt: string
  owner: {
    _id: string
    userName: string
    fullName: string
    avatarUrl: string
  }
}


// GET /v2/videos/:id: the video with counts and the viewer's own state, for the watch page
export interface WatchVideo extends Omit<Video, 'owner'> {
  relativeTime: string
  owner: Video['owner'] & { subscribersCount: number }
  stats: { likes: number; dislikes: number; comments: number }
  viewer: { reaction: 'like' | 'dislike' | null; isSubscribed: boolean; isOwner: boolean }
}

export type { UploadVideoPayload, UpdateVideoPayload, PlayListPayload, EditPlayListPayload };