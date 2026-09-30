import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { channelApi } from "@/lib/api/server/channelApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { Channel, ChannelPlaylist } from "@/lib/types/channelType";
import type { VideoSummary } from "@/lib/types/videoType";
import type { Page } from "@/lib/types/apiType";
import { ChannelHeader } from "@/components/channel/ChannelHeader";
import { PagedVideoGrid } from "@/components/video/PagedVideoGrid";
import { PlaylistGrid } from "@/components/library/PlaylistGrid";
import { PostFeed } from "@/components/posts/PostFeed";
import { postApi } from "@/lib/api/server/postApi";
import type { Post } from "@/lib/types/postType";

type ChannelPageProps = {
  params: Promise<{ userName: string }>;
  searchParams: Promise<{ tab?: string }>;
};

// shared by generateMetadata and the page, so the header is fetched once per request
const loadChannel = cache(async (userName: string): Promise<Channel | null> => {
  try {
    return unwrapApiResponse<Channel>(await channelApi.getChannel(userName));
  } catch {
    return null;
  }
});

const TABS = [
  { id: "videos", label: "Videos" },
  { id: "playlists", label: "Playlists" },
  { id: "posts", label: "Posts" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const isTab = (value: string | undefined): value is TabId =>
  TABS.some((t) => t.id === value);

export async function generateMetadata({
  params,
}: ChannelPageProps): Promise<Metadata> {
  const { userName } = await params;
  const channel = await loadChannel(decodeURIComponent(userName));
  return {
    title: channel
      ? `${channel.fullName} (@${channel.userName}) · VidVerse`
      : "Channel not found · VidVerse",
  };
}

export default async function ChannelPage({
  params,
  searchParams,
}: ChannelPageProps) {
  const { userName: rawUserName } = await params;
  const userName = decodeURIComponent(rawUserName);
  const requested = (await searchParams).tab;
  const tab: TabId = isTab(requested) ? requested : "videos";

  const channel = await loadChannel(userName);
  if (!channel) notFound();

  let videos: Page<VideoSummary> = { items: [], nextCursor: null };
  let playlists: ChannelPlaylist[] = [];
  let posts: Page<Post> = { items: [], nextCursor: null };
  try {
    if (tab === "videos")
      videos = unwrapApiResponse<Page<VideoSummary>>(
        await channelApi.getVideos(channel.userName)
      );
    else if (tab === "playlists")
      playlists = unwrapApiResponse<ChannelPlaylist[]>(
        await channelApi.getPlaylists(channel.userName)
      );
    else
      posts = unwrapApiResponse<Page<Post>>(
        await postApi.getChannelPosts(channel.userName)
      );
  } catch {
    /* the tab shows its empty state */
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pb-16 pt-24">
      <ChannelHeader key={channel._id} channel={channel} />

      <nav
        aria-label="Channel sections"
        className="mt-8 flex gap-6 border-b border-line"
      >
        {TABS.map(({ id, label }) => (
          <Link
            key={id}
            href={
              id === "videos"
                ? `/channel/${channel.userName}`
                : `/channel/${channel.userName}?tab=${id}`
            }
            aria-current={tab === id ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${tab === id ? "border-brand-fg text-fg" : "border-transparent text-fg-secondary hover:text-fg"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <section className="mt-8">
        {tab === "videos" && (
          <PagedVideoGrid
            key={channel.userName}
            source={{ kind: "channel", userName: channel.userName }}
            initial={videos}
            emptyMessage="This channel has no public videos yet."
          />
        )}
        {tab === "playlists" && (
          <PlaylistGrid
            playlists={playlists}
            emptyMessage="This channel has no playlists yet."
          />
        )}
        {tab === "posts" && (
          <div className="max-w-2xl">
            {/* only the channel owner gets a composer here */}
            <PostFeed
              key={channel.userName}
              source={{ kind: "channel", userName: channel.userName }}
              initial={posts}
              showComposer={channel.isOwner}
              emptyMessage={
                channel.isOwner
                  ? "Share your first post with your subscribers."
                  : "This channel has not posted anything yet."
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
