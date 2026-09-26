import apiClient from "./apiClient";

type CommentTarget = "Video" | "Tweet";
const basePath = (targetId: string, targetType: CommentTarget) =>
    targetType === "Video" ? `/videos/${targetId}/comments` : `/posts/${targetId}/comments`;

const commentApi = {
    // one page of comments (newest first) with like / dislike counts and the viewer's reaction
    all: (targetId: string, targetType: CommentTarget, cursor?: string) =>
        apiClient.get(basePath(targetId, targetType), { params: cursor ? { cursor } : undefined }),

    post: (targetId: string, content: string, targetType: CommentTarget) =>
        apiClient.post(basePath(targetId, targetType), { content }),

    // a comment is addressed by its own id, wherever it was posted
    edit: (commentId: string, content: string) => apiClient.patch(`/comments/${commentId}`, { content }),
    // allowed for the comment's author and for the owner of the video / post
    delete: (commentId: string) => apiClient.delete(`/comments/${commentId}`),
}

export default commentApi;
