import apiClient from "./apiClient";

// the signed-in user's watch history
const historyApi = {
    list: () => apiClient.get("/me/history"),
    remove: (videoId: string) => apiClient.delete(`/me/history/${videoId}`),
    clear: () => apiClient.delete("/me/history"),
};

export default historyApi;
