import apiClient from "./apiClient";
import { UploadVideoPayload, UpdateVideoPayload } from "@/lib/types/videoType";

const videoApi = {
    upload: (data: UploadVideoPayload) => {
        return apiClient.post("/videos/upload", data);
    },

    update: (data: UpdateVideoPayload | FormData, videoId: string) => {
        return apiClient.patch(`/videos/update/${videoId}`, data);
    },

    delete: (videoId: string) => {
        return apiClient.delete(`/videos/delete/${videoId}`);
    },

    togglePublish: (videoId: string) => {
        return apiClient.patch(`/videos/toggle/${videoId}`);
    },

    getMine: () => {
        return apiClient.get("/videos/getmyvideos");
    },

    // one page of the public feed; pass the previous page's nextCursor to get the next one
    getAll: (params: { category?: string; query?: string; cursor?: string; limit?: number } = {}) => {
        return apiClient.get("/videos/getallvideos", { params });
    },

    recordView: (videoId: string) => {
        return apiClient.post(`/videos/${videoId}/view`);
    },

};

export default videoApi;

