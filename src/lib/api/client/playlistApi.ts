import apiClient from "./apiClient";
import { PlayListPayload, EditPlayListPayload } from "@/lib/types/videoType";

const creatorPlaylist = {
    create: (data: PlayListPayload, videoId: string) => {
        return apiClient.post(`/videos/creatorplaylist/create/${videoId}`, data);
    },

    addVideo: (data: EditPlayListPayload) => {
        return apiClient.post(`/videos/creatorplaylist/addvideotoplaylist`, data);
    },

    removeVideo: (data: EditPlayListPayload) => {
        return apiClient.post(`/videos/creatorplaylist/removevideofromplaylist`, data);
    },

    update: (playlistId: string, data: PlayListPayload) => {
        return apiClient.patch(`/videos/creatorplaylist/updateplaylist/${playlistId}`, data);
    },

    mine: () => {
        return apiClient.get("/videos/creatorplaylist/myplaylists");
    },

    getAll: () => {
        return apiClient.get("/videos/creatorplaylist/getallplaylist");
    },

    getById: (playlistId: string) => {
        return apiClient.get(`/videos/creatorplaylist/getplaylist/${playlistId}`);
    },

    delete: (playlistId: string) => {
        return apiClient.delete(`/videos/creatorplaylist/deleteplaylist/${playlistId}`);
    }
}

const userPlaylists = {
    create: (data: PlayListPayload, videoId: string) => {
        return apiClient.post(`/videos/userplaylist/create/${videoId}`, data);
    },

    addVideo: (data: EditPlayListPayload) => {
        return apiClient.post(`/videos/userplaylist/addvideotoplaylist`, data);
    },

    removeVideo: (data: EditPlayListPayload) => {
        return apiClient.post(`/videos/userplaylist/removevideofromplaylist`, data);
    },

    update: (playlistId: string, data: PlayListPayload) => {
        return apiClient.patch(`/videos/userplaylist/updateplaylist/${playlistId}`, data);
    },

    mine: () => {
        return apiClient.get("/videos/userplaylist/myplaylists");
    },

    getAll: () => {
        return apiClient.get("/videos/userplaylist/getallplaylist");
    },

    getById: (playlistId: string) => {
        return apiClient.get(`/videos/userplaylist/getplaylist/${playlistId}`);
    },
    
    delete: (playlistId: string) => {
        return apiClient.delete(`/videos/userplaylist/deleteplaylist/${playlistId}`);
    }
}

export { creatorPlaylist, userPlaylists };