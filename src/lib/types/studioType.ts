export type VideoStatus = "processing" | "ready" | "failed";

// one of the signed-in creator's own videos, in any status (GET /v2/me/videos/:id, rows of GET /v2/me/studio)
export interface StudioVideo {
  _id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  videoFileUrl: string;
  duration: number;
  views: number;
  isPublished: boolean;
  status: VideoStatus;
  createdAt: string;
  updatedAt: string;
  likes?: number;
  comments?: number;
}

// GET /v2/me/studio
export interface StudioOverview {
  totals: {
    videos: number;
    views: number;
    likes: number;
    comments: number;
    subscribers: number;
  };
  processing: number;
  videos: StudioVideo[];
}
