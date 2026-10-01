import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { serverFetch } from "@/lib/api/server/serverFetch";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import { formatViews } from "@/lib/utils";

type ServerUser = {
  avatarUrl?: string;
  coverImageUrl?: string;
  userName?: string;
  fullName?: string;
  email?: string;
} | null;

/** Who you are signed in as, above the settings forms. */
export default async function ServerHero({ user }: { user: ServerUser }) {
  let stats = { subscribersCount: 0, subscriptionsCount: 0 };
  try {
    const data = unwrapApiResponse<{
      subscribersCount?: number;
      subscriptionsCount?: number;
    }>(await serverFetch("/me/stats"));
    stats = {
      subscribersCount: data.subscribersCount || 0,
      subscriptionsCount: data.subscriptionsCount || 0,
    };
  } catch {
    // the counts are context, not the point of the page: show zeros
  }

  return (
    <section className="overflow-hidden rounded-lg bg-surface inset-ring inset-ring-line">
      <div className="relative h-28 bg-elevated sm:h-36">
        {user?.coverImageUrl && (
          <Image
            src={user.coverImageUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
        <Avatar className="-mt-10 size-20 ring-4 ring-surface">
          <AvatarImage src={user?.avatarUrl} alt="" />
          <AvatarFallback className="text-2xl">
            {user?.userName?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 pb-0.5">
          <h1 className="truncate text-xl leading-7 font-semibold tracking-tight text-fg">
            {user?.fullName || "Your channel"}
          </h1>
          <p className="truncate text-sm text-fg-secondary">
            @{user?.userName || "unknown"}
            {user?.email && (
              <span className="hidden sm:inline"> · {user.email}</span>
            )}
          </p>
        </div>

        <dl className="flex gap-6 pb-0.5 text-sm">
          <div>
            <dt className="text-xs text-fg-tertiary">Subscribers</dt>
            <dd className="font-medium text-fg tabular-nums">
              {formatViews(stats.subscribersCount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fg-tertiary">Subscriptions</dt>
            <dd className="font-medium text-fg tabular-nums">
              {formatViews(stats.subscriptionsCount)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
