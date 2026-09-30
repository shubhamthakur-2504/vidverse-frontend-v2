import { VideoSummary } from "@/lib/types/videoType";
import {
  Channel,
  ChannelPlaylist,
  SubscriptionItem,
} from "@/lib/types/channelType";
import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError, Page } from "@/lib/types/apiType";

const base = (userName: string) => `/channels/${encodeURIComponent(userName)}`;

export const channelApi = {
  // forwards the viewer's cookies, so isSubscribed / isOwner reflect the signed-in user
  getChannel: (userName: string) =>
    serverFetch<ApiSuccess<Channel> | ApiError>(base(userName)),
  getVideos: (userName: string) =>
    serverFetch<ApiSuccess<Page<VideoSummary>> | ApiError>(
      `${base(userName)}/videos`
    ),
  getPlaylists: (userName: string) =>
    serverFetch<ApiSuccess<ChannelPlaylist[]> | ApiError>(
      `${base(userName)}/playlists`
    ),
  // the signed-in user: followed channels and their newest videos
  getMySubscriptions: () =>
    serverFetch<ApiSuccess<Page<SubscriptionItem>> | ApiError>(
      "/me/subscriptions?limit=50"
    ),
  getSubscriptionFeed: () =>
    serverFetch<ApiSuccess<Page<VideoSummary>> | ApiError>(
      "/me/subscriptions/videos"
    ),
};
