import apiClient from "./apiClient";

const commentApi = {
    all: (targetId: string, targetType: "Video" | "Tweet") => {
        const route = targetType === "Video"
            ? `/videos/getallcomments/${targetId}`
            : `/tweets/getallcomment/${targetId}`;

        return apiClient.get(route);
    },

    post: (targetId: string, content: string, targetType: "Video" | "Tweet") => {
        return apiClient.post(`/${targetType}/createcomment/${targetId}`, { content });
    },

    delete: (commentId: string, targetType: "Video" | "Tweet") => {
        return apiClient.delete(`/${targetType}/deletecomment/${commentId}`);
    },

    edit: (commentId: string, content: string, targetType: "Video" | "Tweet") => {
        return apiClient.patch(`/${targetType}/editcomment/${commentId}`, { content });
    },
}

export default commentApi;