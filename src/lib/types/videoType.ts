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

export type { UploadVideoPayload, UpdateVideoPayload, PlayListPayload, EditPlayListPayload };