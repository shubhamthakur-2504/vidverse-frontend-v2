import apiClient from "./apiClient";

const commentApi = {
    post: (videoId: string, content: string) => {
        return apiClient.post(`/videos/createcomment/${videoId}`, { content });
    },

    delete: (commentId: string) => {
        return apiClient.delete(`/videos/deletecomment/${commentId}`);
    },

    edit: (commentId: string, content: string) => {
        return apiClient.patch(`/videos/editcomment/${commentId}`, { content });
    },
}

export default commentApi;