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
        return apiClient.get("/videos/myvideos");
    },

    getAll: () => {
        return apiClient.get("/videos/getallvideos");
    },

};

export default videoApi;

