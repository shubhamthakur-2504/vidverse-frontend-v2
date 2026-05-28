import apiClient from "./apiClient";

const commentApi = {
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