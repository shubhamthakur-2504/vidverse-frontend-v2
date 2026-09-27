"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bell, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/auth/AuthProvider'
import subscriptionApi from '@/lib/api/client/subscriptionApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { formatViews } from '@/lib/utils'
import type { Channel } from '@/lib/types/channelType'
import { buttonPrimary, buttonSecondary } from '@/components/studio/styles'

const plural = (count: number, word: string) => `${formatViews(count)} ${word}${count === 1 ? '' : 's'}`

export function ChannelHeader({ channel }: { channel: Channel }) {
  const { user } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(channel.isSubscribed)
  const [subscribers, setSubscribers] = useState(channel.subscribersCount)
  const [busy, setBusy] = useState(false)

  const toggleSubscription = async () => {
    if (!user) return toast.error('Sign in to subscribe')
    const next = !isSubscribed
    // optimistic: flip now, roll back if the request fails
    setIsSubscribed(next)
    setSubscribers((count) => count + (next ? 1 : -1))
    setBusy(true)
    try {
      await (next ? subscriptionApi.subscribe(channel._id) : subscriptionApi.unsubscribe(channel._id))
    } catch (error: unknown) {
      setIsSubscribed(!next)
      setSubscribers((count) => count + (next ? -1 : 1))
      toast.error('Could not update the subscription', { description: getApiErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <header>
      <div className="relative aspect-[6/1] min-h-24 overflow-hidden rounded-lg border border-line bg-elevated">
        {channel.coverImageUrl && (
          <Image src={channel.coverImageUrl} alt="" fill priority sizes="(max-width: 1536px) 100vw, 1536px" className="object-cover" />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20 border border-line-default sm:h-24 sm:w-24">
          <AvatarImage src={channel.avatarUrl} alt={channel.userName} />
          <AvatarFallback className="bg-elevated text-2xl font-semibold text-fg">
            {channel.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-fg">{channel.fullName}</h1>
          <p className="mt-1 text-sm text-fg-secondary">
            @{channel.userName}
            <span className="mx-2 text-fg-tertiary" aria-hidden>·</span>
            {plural(subscribers, 'subscriber')}
            <span className="mx-2 text-fg-tertiary" aria-hidden>·</span>
            {plural(channel.videosCount, 'video')}
          </p>
        </div>

        {channel.isOwner ? (
          <Link href="/studio" className={buttonSecondary}>
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Manage videos
          </Link>
        ) : (
          <button
            type="button"
            onClick={toggleSubscription}
            disabled={busy}
            aria-pressed={isSubscribed}
            className={isSubscribed ? buttonSecondary : buttonPrimary}
          >
            {isSubscribed && <Bell className="h-4 w-4" aria-hidden />}
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>
    </header>
  )
}
