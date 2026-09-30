import apiClient from "./apiClient";

// the signed-in user's notifications
const notificationApi = {
  list: (params: { cursor?: string; limit?: number } = {}) =>
    apiClient.get("/me/notifications", { params }),
  unreadCount: () => apiClient.get("/me/notifications/unread-count"),
  // without ids, every notification is marked read
  markRead: (ids?: string[]) =>
    apiClient.post("/me/notifications/read", ids ? { ids } : {}),
};

export default notificationApi;
