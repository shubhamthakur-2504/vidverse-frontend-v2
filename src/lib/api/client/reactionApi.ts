import apiClient from "./apiClient";

const reactionApi = {
    addReaction: (targetId: string, isLike: boolean, targetType: "Video" | "Comment" | "Tweet") => {
        return apiClient.post(`/reaction/${targetId}`, { targetType, isLike });
    },

    removeReaction: (targetId: string, targetType: "Video" | "Comment" | "Tweet") => {
        return apiClient.delete(`/reaction/${targetId}`, { data: { targetType } });
    },

    countLikes: (targetId: string, targetType: "Video" | "Comment" | "Tweet") => {
        return apiClient.get(`/reaction/${targetId}/count`, { params: { targetType } });
    },

    status: (targetId: string, targetType: "Video" | "Comment" | "Tweet") => {
        return apiClient.get(`/reaction/${targetId}`, { params: { targetType } });
    }
};

export default reactionApi;