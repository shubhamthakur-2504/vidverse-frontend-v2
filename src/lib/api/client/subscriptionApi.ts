import apiClient from "./apiClient";

const subscriptionApi = {
    subscribe: (channelId: string) => {
        return apiClient.post(`/subscription/subscribe/${channelId}`);
    },

    unsubscribe: (channelId: string) => {
        return apiClient.delete(`/subscription/unsubscribe/${channelId}`);
    },

    status: (channelId: string) => {
        return apiClient.get(`/subscription/issubscribed/${channelId}`);
    },

    count: (channelId: string) => {
        return apiClient.get(`/subscription/subscriberscount/${channelId}`);
    },

    mySubscriptions: () => {
        return apiClient.get(`/subscription/mysubscriptions`);
    }
};

export default subscriptionApi;