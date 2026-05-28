"use client";
import apiClient, { noAuthRedirectClient } from "./apiClient";
import { Login, ChangePassword, ChangeFiles, ChangeUserInfo } from "@/lib/types/authType";

const authApi = {
    login: (data: Login) => {
        return apiClient.post("/user/login", data);
    },
    register: (data: FormData) => {
        return apiClient.post("/user/register", data);
    },

    logout: () => {
        return apiClient.post("/user/logout");
    },

    refreshToken: () => {
        return apiClient.post("/user/refreshaccess");
    },

    changePassword: (data: ChangePassword) => {
        return apiClient.patch("/user/changepassword", data);
    },

    changeAvatar: (data: ChangeFiles) => {
        return apiClient.patch("/user/changeavatar", data);
    },

    changeCover: (data: ChangeFiles) => {
        return apiClient.patch("/user/changecover", data);
    },

    changeUserInfo: (data: ChangeUserInfo) => {
        return apiClient.patch("/user/updatedetails", data);
    },

    getUserDetails: () => {
        return apiClient.get("/user/getuserdetails");
    },

    getWatchHistory: () => {
        return apiClient.get("/user/getwatchhistory");
    },

    getCurrentUser: () => {
        return noAuthRedirectClient.get("/user/getcurrentuser");
    }
};

export default authApi;