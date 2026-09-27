import apiClient from "./apiClient";

const channelPath = (userName: string) => `/channels/${encodeURIComponent(userName)}`;

const subscriptionApi = {
    // PUT is idempotent: subscribing twice is not an error
    subscribe: (channelId: string) => apiClient.put(`/channels/${channelId}/subscription`),
    unsubscribe: (channelId: string) => apiClient.delete(`/channels/${channelId}/subscription`),
    mySubscriptions: (cursor?: string) => apiClient.get("/me/subscriptions", { params: cursor ? { cursor } : undefined }),
    // public channel page: profile, counts and whether the viewer is subscribed
    channel: (userName: string) => apiClient.get(channelPath(userName)),
    // one page of a channel's public videos; pass the previous page's nextCursor
    channelVideos: (userName: string, cursor?: string) =>
        apiClient.get(`${channelPath(userName)}/videos`, { params: cursor ? { cursor } : undefined }),
};

export default subscriptionApi;
