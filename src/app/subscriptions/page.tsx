import type { Metadata } from "next";
import Link from "next/link";
import { channelApi } from "@/lib/api/server/channelApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { SubscriptionItem } from "@/lib/types/channelType";
import type { VideoSummary } from "@/lib/types/videoType";
import type { Page } from "@/lib/types/apiType";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PagedVideoGrid } from "@/components/video/PagedVideoGrid";

export const metadata: Metadata = { title: "Subscriptions · VidVerse" };

const emptyPage = <T,>(): Page<T> => ({ items: [], nextCursor: null });

// protected in src/proxy.ts
export default async function SubscriptionsPage() {
  const [channelsRes, feedRes] = await Promise.allSettled([
    channelApi.getMySubscriptions(),
    channelApi.getSubscriptionFeed(),
  ]);

  let channels = emptyPage<SubscriptionItem>();
  let feed = emptyPage<VideoSummary>();
  try {
    if (channelsRes.status === "fulfilled")
      channels = unwrapApiResponse<Page<SubscriptionItem>>(channelsRes.value);
  } catch {
    /* no channel strip */
  }
  try {
    if (feedRes.status === "fulfilled")
      feed = unwrapApiResponse<Page<VideoSummary>>(feedRes.value);
  } catch {
    /* shows the empty state */
  }

  return (
    <div className="min-h-screen bg-bg pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Subscriptions
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          The newest videos from channels you follow.
        </p>

        {channels.items.length > 0 && (
          <nav
            aria-label="Channels you follow"
            className="mt-6 -mx-4 overflow-x-auto px-4"
          >
            <ul className="flex gap-6 pb-2">
              {channels.items.map(({ channel }) => (
                <li key={channel._id} className="shrink-0">
                  <Link
                    href={`/channel/${channel.userName}`}
                    className="group flex w-16 flex-col items-center gap-2"
                  >
                    <Avatar className="h-14 w-14 border border-line-default transition-colors group-hover:border-brand-fg">
                      <AvatarImage src={channel.avatarUrl} alt="" />
                      <AvatarFallback className="bg-elevated font-semibold text-fg">
                        {channel.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="w-full truncate text-center text-xs text-fg-secondary group-hover:text-fg">
                      {channel.userName}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-8">
          <PagedVideoGrid
            source={{ kind: "subscriptions" }}
            initial={feed}
            emptyMessage={
              channels.items.length === 0 ? (
                <>
                  <p>Subscribe to channels to see their newest videos here.</p>
                  <Link
                    href="/"
                    className="mt-4 inline-block font-medium text-brand-fg hover:underline"
                  >
                    Find channels to follow
                  </Link>
                </>
              ) : (
                "The channels you follow have not posted any videos yet."
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
