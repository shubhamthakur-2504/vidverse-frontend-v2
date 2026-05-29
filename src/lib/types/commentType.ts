export interface Comment {
    _id: string;
    content: string;
    userId?: string;
    userName?: string;
    avatarUrl?: string;
    createdAt?: string;
    editStatus: boolean;
    relativeTime?: string;
    userDetails?: {
        userName?: string;
        avatarUrl?: string;
    };
    owner?: {
        _id: string;
    };
    likesCount?: number;
    isLiked?: boolean;
    isDisliked?: boolean;
    // legacy status field kept for compatibility (no trailing spaces)
    status?: "like" | "dislike" | "none";
}