import apiClient from "./apiClient";

// the signed-in user's playlists
const playlistApi = {
    mine: () => apiClient.get("/playlists"),
    getById: (playlistId: string) => apiClient.get(`/playlists/${playlistId}`),
    // a playlist starts with one video
    create: (data: { videoId: string; title?: string; description?: string } | FormData) => apiClient.post("/playlists", data),
    update: (playlistId: string, data: { title?: string; description?: string } | FormData) => apiClient.patch(`/playlists/${playlistId}`, data),
    delete: (playlistId: string) => apiClient.delete(`/playlists/${playlistId}`),
    addVideo: (playlistId: string, videoId: string) => apiClient.put(`/playlists/${playlistId}/videos/${videoId}`),
    removeVideo: (playlistId: string, videoId: string) => apiClient.delete(`/playlists/${playlistId}/videos/${videoId}`),
};

export default playlistApi;
