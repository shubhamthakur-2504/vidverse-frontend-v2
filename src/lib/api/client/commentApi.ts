import apiClient from "./apiClient";

const commentApi = {
    all: (targetId: string, targetType: "Video" | "Tweet") => {
        const route = targetType === "Video"
            ? `/videos/getallcomments/${targetId}`
            : `/tweets/getallcomment/${targetId}`;

        return apiClient.get(route);
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