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
  status?: 'processing' | 'ready' | 'failed'
  createdAt: string
  owner: {
    _id: string
    userName: string
    fullName: string
    avatarUrl: string
  }
}


export type { UploadVideoPayload, UpdateVideoPayload, PlayListPayload, EditPlayListPayload };