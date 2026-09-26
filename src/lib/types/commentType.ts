// GET /v2/videos/:id/comments (and /v2/posts/:id/comments): one comment with its counts and the viewer's reaction
export interface Comment {
    _id: string;
    content: string;
    userId: string;
    author: { _id: string; userName: string; fullName?: string; avatarUrl?: string } | null;
    createdAt: string;
    relativeTime: string;
    editStatus: boolean;
    likeCount: number;
    dislikeCount: number;
    viewerReaction: "like" | "dislike" | null;
}