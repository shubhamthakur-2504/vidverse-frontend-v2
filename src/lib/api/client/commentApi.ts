import apiClient from "./apiClient";

const commentApi = {
    // one page of comments, newest first; pass the previous page's nextCursor to get the next one
    all: (targetId: string, targetType: "Video" | "Tweet", cursor?: string) => {
        const route = targetType === "Video"
            ? `/videos/getallcomments/${targetId}`
            : `/tweets/getallcomment/${targetId}`;

        return apiClient.get(route, { params: cursor ? { cursor } : undefined });
    },

    post: (targetId: string, content: string, targetType: "Video" | "Tweet") => {
        const prefix = targetType === "Video" ? "videos" : "tweets";
        return apiClient.post(`/${prefix}/createcomment/${targetId}`, { content });
    },

    delete: (commentId: string, targetType: "Video" | "Tweet") => {
        const prefix = targetType === "Video" ? "videos" : "tweets";
        return apiClient.delete(`/${prefix}/deletecomment/${commentId}`);
    },

    edit: (commentId: string, content: string, targetType: "Video" | "Tweet") => {
        const prefix = targetType === "Video" ? "videos" : "tweets";
        const routeSuffix = targetType === "Video" ? "editcomment" : "updatecomment";
        return apiClient.patch(`/${prefix}/${routeSuffix}/${commentId}`, { content });
    },
}

export default commentApi;