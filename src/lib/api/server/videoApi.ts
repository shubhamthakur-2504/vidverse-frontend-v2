import { Video } from "@/lib/types/videoType";
import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError } from "@/lib/types/apiType";

export const videoApi = {
    getAllVideos: () => {
        return serverFetch<ApiSuccess<Video[]> | ApiError>("/videos/getallvideos");
    },
    getVideoDetails: (videoId: string) => {
        return serverFetch<ApiSuccess<Video> | ApiError>(`/videos/getvideodetails/${videoId}`);
    }
};