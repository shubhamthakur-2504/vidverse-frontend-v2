import apiClient from "./apiClient";
import { UpdateVideoPayload } from "@/lib/types/videoType";
import { SearchFilters, searchApiParams } from "@/lib/search";

const videoApi = {
  update: (data: UpdateVideoPayload | FormData, videoId: string) =>
    apiClient.patch(`/videos/${videoId}`, data),
  setPublished: (videoId: string, isPublished: boolean) =>
    apiClient.patch(`/videos/${videoId}`, { isPublished }),
  delete: (videoId: string) => apiClient.delete(`/videos/${videoId}`),
  getMine: () => apiClient.get("/me/videos"),
  // creator studio: overview with totals, one own video in any status, retry failed processing
  studio: () => apiClient.get("/me/studio"),
  getMyVideo: (videoId: string) => apiClient.get(`/me/videos/${videoId}`),
  reprocess: (videoId: string) =>
    apiClient.post(`/videos/${videoId}/reprocess`),

  // one page of the public feed; pass the previous page's nextCursor to get the next one
  getAll: (
    params: {
      category?: string;
      query?: string;
      cursor?: string;
      limit?: number;
    } = {}
  ) => apiClient.get("/videos", { params }),
  // one page of search results with the /results filters
  search: (filters: SearchFilters, cursor?: string) =>
    apiClient.get("/videos", {
      params: { ...searchApiParams(filters), ...(cursor && { cursor }) },
    }),

  related: (videoId: string, limit = 12) =>
    apiClient.get(`/videos/${videoId}/related`, { params: { limit } }),

  recordView: (videoId: string) => apiClient.post(`/videos/${videoId}/views`),

  // direct upload (see lib/upload/directUpload.ts): signed parameters, then register the uploaded file
  uploadIntent: () => apiClient.post("/videos/upload-intent"),
  registerUpload: (
    data:
      | FormData
      | {
          publicId: string;
          title: string;
          description?: string;
          category?: string;
        }
  ) => apiClient.post("/videos/from-upload", data),
};

export default videoApi;
