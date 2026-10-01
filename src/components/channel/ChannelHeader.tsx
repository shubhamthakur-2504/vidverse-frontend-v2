"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, LayoutDashboard, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import subscriptionApi from "@/lib/api/client/subscriptionApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import { formatViews } from "@/lib/utils";
import type { Channel } from "@/lib/types/channelType";

// counts here are approximate by nature, so they stay compact
const compactPlural = (count: number, word: string) =>
  `${formatViews(count)} ${word}${count === 1 ? "" : "s"}`;

export function ChannelHeader({ channel }: { channel: Channel }) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(channel.isSubscribed);
  const [subscribers, setSubscribers] = useState(channel.subscribersCount);

  const toggleSubscription = async () => {
    if (!user) {
      toast("Sign in to subscribe");
      return;
    }
    const next = !subscribed;
    // optimistic: flip now, roll back if the request fails
    setSubscribed(next);
    setSubscribers((count) => count + (next ? 1 : -1));
    try {
      await (next
        ? subscriptionApi.subscribe(channel._id)
        : subscriptionApi.unsubscribe(channel._id));
    } catch (error: unknown) {
      setSubscribed(!next);
      setSubscribers((count) => count + (next ? -1 : 1));
      toast.error("Couldn't update your subscription", {
        description: getApiErrorMessage(error),
      });
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: channel.fullName, url });
        return;
      } catch {
        /* dismissed, or sharing is blocked: fall through to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <header>
      <div className="relative aspect-6/1 min-h-24 overflow-hidden rounded-lg bg-elevated inset-ring inset-ring-line">
        {channel.coverImageUrl && (
          <Image
            src={channel.coverImageUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 1536px) 100vw, 1536px"
            className="object-cover"
          />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar className="size-24 sm:size-32">
          <AvatarImage src={channel.avatarUrl} alt="" />
          <AvatarFallback className="text-3xl">
            {channel.userName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl leading-8 font-semibold tracking-tight text-fg sm:text-4xl sm:leading-11">
            {channel.fullName}
          </h1>
          <p className="mt-1.5 text-sm text-fg-secondary tabular-nums">
            @{channel.userName}
            <span className="mx-2 text-fg-tertiary" aria-hidden>
              ·
            </span>
            {compactPlural(subscribers, "subscriber")}
            <span className="mx-2 text-fg-tertiary" aria-hidden>
              ·
            </span>
            {compactPlural(channel.videosCount, "video")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            onClick={share}
            className="rounded-full"
            aria-label="Share this channel"
          >
            <Share2 strokeWidth={1.75} aria-hidden />
            Share
          </Button>
          {channel.isOwner ? (
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/studio">
                <LayoutDashboard strokeWidth={1.75} aria-hidden />
                Manage videos
              </Link>
            </Button>
          ) : (
            <Button
              variant={subscribed ? "secondary" : "inverse"}
              onClick={toggleSubscription}
              aria-pressed={subscribed}
              className="rounded-full"
            >
              {subscribed && <Bell strokeWidth={1.75} aria-hidden />}
              {subscribed ? "Subscribed" : "Subscribe"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
