import { Video } from "@/lib/types/videoType";
import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError, Page } from "@/lib/types/apiType";

export const videoApi = {
    getAllVideos: (category?: string, query?: string) => {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (query) params.set("query", query);
        const queryString = params.toString() ? `?${params.toString()}` : "";
        return serverFetch<ApiSuccess<Page<Video>> | ApiError>(`/videos/getallvideos${queryString}`);
    },
    getVideoDetails: (videoId: string) => {
        return serverFetch<ApiSuccess<Video> | ApiError>(`/videos/getvideodetails/${videoId}`);
    },
    getCategories: () => {
        return serverFetch<ApiSuccess<string[]> | ApiError>("/videos/getcategories");
    },
};