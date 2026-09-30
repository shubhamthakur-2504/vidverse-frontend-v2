import { Post } from "@/lib/types/postType";
import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError, Page } from "@/lib/types/apiType";

// first pages for server rendering; the forwarded cookies decide the viewer's reaction and ownership
export const postApi = {
  getFeed: () => serverFetch<ApiSuccess<Page<Post>> | ApiError>("/posts"),
  getPost: (postId: string) =>
    serverFetch<ApiSuccess<Post> | ApiError>(`/posts/${postId}`),
  getChannelPosts: (userName: string) =>
    serverFetch<ApiSuccess<Page<Post>> | ApiError>(
      `/channels/${encodeURIComponent(userName)}/posts`
    ),
};
