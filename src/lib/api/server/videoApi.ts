import { Video, VideoSummary, WatchVideo } from "@/lib/types/videoType";
import { SearchFilters, searchApiParams } from "@/lib/search";
import { StudioOverview, StudioVideo } from "@/lib/types/studioType";
import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError, Page } from "@/lib/types/apiType";

export const videoApi = {
    getAllVideos: (category?: string, query?: string) => {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (query) params.set("query", query);
        const queryString = params.toString() ? `?${params.toString()}` : "";
        return serverFetch<ApiSuccess<Page<Video>> | ApiError>(`/videos${queryString}`);
    },
    // first page of search results
    search: (filters: SearchFilters) => {
        const params = new URLSearchParams(searchApiParams(filters));
        return serverFetch<ApiSuccess<Page<VideoSummary>> | ApiError>(`/videos?${params.toString()}`);
    },
    // the watch-page payload: video, owner, counts and the viewer's own state (from the forwarded cookies)
    getVideoDetails: (videoId: string) => {
        return serverFetch<ApiSuccess<WatchVideo> | ApiError>(`/videos/${videoId}`);
    },
    getRelated: (videoId: string, limit = 12) => {
        return serverFetch<ApiSuccess<Video[]> | ApiError>(`/videos/${videoId}/related?limit=${limit}`);
    },
    getCategories: () => {
        return serverFetch<ApiSuccess<string[]> | ApiError>("/videos/categories");
    },
    // every allowed category (upload / edit forms)
    getAllCategories: () => {
        return serverFetch<ApiSuccess<string[]> | ApiError>("/videos/categories?all=true");
    },
    getStudio: () => {
        return serverFetch<ApiSuccess<StudioOverview> | ApiError>("/me/studio");
    },
    getMyVideo: (videoId: string) => {
        return serverFetch<ApiSuccess<StudioVideo> | ApiError>(`/me/videos/${videoId}`);
    },
};