import apiClient from "./apiClient";

const subscriptionApi = {
    // PUT is idempotent: subscribing twice is not an error
    subscribe: (channelId: string) => apiClient.put(`/channels/${channelId}/subscription`),
    unsubscribe: (channelId: string) => apiClient.delete(`/channels/${channelId}/subscription`),
    mySubscriptions: (cursor?: string) => apiClient.get("/me/subscriptions", { params: cursor ? { cursor } : undefined }),
    // public channel page: profile, counts and whether the viewer is subscribed
    channel: (userName: string) => apiClient.get(`/channels/${encodeURIComponent(userName)}`),
};

export default subscriptionApi;
