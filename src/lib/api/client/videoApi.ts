import apiClient from "./apiClient";
import { UpdateVideoPayload } from "@/lib/types/videoType";

const videoApi = {
    update: (data: UpdateVideoPayload | FormData, videoId: string) => apiClient.patch(`/videos/${videoId}`, data),
    setPublished: (videoId: string, isPublished: boolean) => apiClient.patch(`/videos/${videoId}`, { isPublished }),
    delete: (videoId: string) => apiClient.delete(`/videos/${videoId}`),
    getMine: () => apiClient.get("/me/videos"),

    // one page of the public feed; pass the previous page's nextCursor to get the next one
    getAll: (params: { category?: string; query?: string; cursor?: string; limit?: number } = {}) =>
        apiClient.get("/videos", { params }),

    related: (videoId: string, limit = 12) => apiClient.get(`/videos/${videoId}/related`, { params: { limit } }),

    recordView: (videoId: string) => apiClient.post(`/videos/${videoId}/views`),

    // direct upload (see lib/upload/directUpload.ts): signed parameters, then register the uploaded file
    uploadIntent: () => apiClient.post("/videos/upload-intent"),
    registerUpload: (data: FormData | { publicId: string; title: string; description?: string; category?: string }) =>
        apiClient.post("/videos/from-upload", data),
};

export default videoApi;
