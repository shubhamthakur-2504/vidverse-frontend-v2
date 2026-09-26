"use client";
import apiClient, { noAuthRedirectClient } from "./apiClient";
import { Login, ChangePassword, ChangeUserInfo } from "@/lib/types/authType";

const authApi = {
    login: (data: Login) => apiClient.post("/auth/login", data),
    register: (data: FormData) => apiClient.post("/auth/register", data),
    logout: () => apiClient.post("/auth/logout"),
    refreshToken: () => apiClient.post("/auth/refresh"),

    // devices signed in to this account
    listSessions: () => apiClient.get("/auth/sessions"),
    revokeSession: (sessionId: string) => apiClient.delete(`/auth/sessions/${sessionId}`),
    revokeOtherSessions: () => apiClient.delete("/auth/sessions/others"),

    changePassword: (data: ChangePassword) => apiClient.put("/me/password", data),
    changeAvatar: (data: FormData) => apiClient.put("/me/avatar", data),
    changeCover: (data: FormData) => apiClient.put("/me/cover", data),
    changeUserInfo: (data: ChangeUserInfo) => apiClient.patch("/me", data),
    getUserDetails: () => apiClient.get("/me/stats"),
    getWatchHistory: () => apiClient.get("/me/history"),
    // "who am I" on page load: refreshes an expired session but never redirects to login
    getCurrentUser: () => noAuthRedirectClient.get("/me"),
};

export default authApi;
