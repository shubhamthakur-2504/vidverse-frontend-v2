import { HistoryVideo, MyPlaylist, PlaylistDetails } from "@/lib/types/libraryType";
import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError } from "@/lib/types/apiType";

export const libraryApi = {
    getHistory: () => serverFetch<ApiSuccess<HistoryVideo[]> | ApiError>("/me/history"),
    getMyPlaylists: () => serverFetch<ApiSuccess<MyPlaylist[]> | ApiError>("/playlists"),
    // public; the forwarded cookies decide isOwner and whether the viewer's own private videos show
    getPlaylist: (playlistId: string) => serverFetch<ApiSuccess<PlaylistDetails> | ApiError>(`/playlists/${playlistId}`),
};
