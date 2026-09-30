// GET /v2/posts, /v2/posts/:id and /v2/channels/:userName/posts: a community post with counts and the viewer's state
export interface Post {
  _id: string;
  content: string;
  image: string | null;
  owner: { _id: string; userName: string; fullName: string; avatarUrl: string };
  createdAt: string;
  relativeTime: string;
  isEdited: boolean;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewerReaction: "like" | "dislike" | null;
  isOwner: boolean;
  // the author can edit for 15 minutes after posting
  canEdit: boolean;
}
