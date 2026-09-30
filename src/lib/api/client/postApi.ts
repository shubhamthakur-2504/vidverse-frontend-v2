import apiClient from "./apiClient";

const params = (cursor?: string) => (cursor ? { cursor } : undefined);

// community posts (stored as tweets by the API)
const postApi = {
  feed: (cursor?: string) =>
    apiClient.get("/posts", { params: params(cursor) }),
  channel: (userName: string, cursor?: string) =>
    apiClient.get(`/channels/${encodeURIComponent(userName)}/posts`, {
      params: params(cursor),
    }),
  get: (postId: string) => apiClient.get(`/posts/${postId}`),
  // FormData with `content` and an optional `image`
  create: (data: FormData) => apiClient.post("/posts", data),
  update: (postId: string, content: string) =>
    apiClient.patch(`/posts/${postId}`, { content }),
  delete: (postId: string) => apiClient.delete(`/posts/${postId}`),
};

export default postApi;
