"use client";
import apiClient, { noAuthRedirectClient } from "./apiClient";
import { Login, ChangePassword, ChangeUserInfo } from "@/lib/types/authType";

const authApi = {
  login: (data: Login) => apiClient.post("/auth/login", data),
  register: (data: FormData) => apiClient.post("/auth/register", data),
  logout: () => apiClient.post("/auth/logout"),
  refreshToken: () => apiClient.post("/auth/refresh"),
  // live check on the register form (the format is validated by the API too)
  checkUserName: (userName: string) =>
    noAuthRedirectClient.get("/auth/username-availability", {
      params: { userName },
    }),

  // email verification and password reset (links with one-time tokens, sent by email)
  requestEmailVerification: () => apiClient.post("/auth/email-verification"),
  verifyEmail: (token: string) =>
    noAuthRedirectClient.post("/auth/verify-email", { token }),
  forgotPassword: (email: string) =>
    noAuthRedirectClient.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    noAuthRedirectClient.post("/auth/reset-password", { token, password }),

  // devices signed in to this account
  listSessions: () => apiClient.get("/auth/sessions"),
  revokeSession: (sessionId: string) =>
    apiClient.delete(`/auth/sessions/${sessionId}`),
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
