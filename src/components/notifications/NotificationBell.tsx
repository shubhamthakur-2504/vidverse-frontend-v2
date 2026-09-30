"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import notificationApi from '@/lib/api/client/notificationApi'
import type { AppNotification } from '@/lib/types/notificationType'
import type { Page } from '@/lib/types/apiType'
import { NotificationItem } from './NotificationItem'

const POLL_MS = 60_000
const MENU_SIZE = 8

// navbar bell: unread badge (polled every minute and when the tab regains focus) and the latest notifications
export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<AppNotification[] | null>(null)
  const [open, setOpen] = useState(false)

  const refreshCount = useCallback(async () => {
    try {
      setUnread((await notificationApi.unreadCount()).data.data.count)
    } catch { /* keep the last count; the next poll tries again */ }
  }, [])

  useEffect(() => {
    const first = setTimeout(refreshCount, 0)
    const timer = setInterval(() => { if (document.visibilityState === 'visible') refreshCount() }, POLL_MS)
    window.addEventListener('focus', refreshCount)
    return () => { clearTimeout(first); clearInterval(timer); window.removeEventListener('focus', refreshCount) }
  }, [refreshCount])

  const onOpenChange = async (next: boolean) => {
    setOpen(next)
    if (!next) return
    setItems(null)
    try {
      const page: Page<AppNotification> = (await notificationApi.list({ limit: MENU_SIZE })).data.data
      setItems(page.items)
    } catch {
      setItems([])
    }
  }

  const markOneRead = (n: AppNotification) => {
    setOpen(false)
    if (n.readAt) return
    setUnread((count) => Math.max(0, count - 1))
    notificationApi.markRead([n._id]).catch(() => { /* the badge corrects itself on the next poll */ })
  }

  const markAllRead = async () => {
    setUnread(0)
    setItems((current) => current?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ?? null)
    await notificationApi.markRead().catch(() => refreshCount())
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-fg transition-colors hover:bg-elevated"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-brand px-1 text-center text-[11px] font-semibold leading-[18px] text-white" aria-hidden>
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[360px] max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-surface p-1.5 text-fg">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button type="button" onClick={markAllRead} className="text-xs font-medium text-brand-fg hover:underline">Mark all as read</button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items === null ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-fg-tertiary" aria-label="Loading" /></div>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-fg-secondary">You&apos;re all caught up.</p>
          ) : (
            items.map((n) => <NotificationItem key={n._id} notification={n} onOpen={markOneRead} />)
          )}
        </div>
        <Link href="/notifications" onClick={() => setOpen(false)} className="mt-1 block rounded-md px-3 py-2 text-center text-sm font-medium text-brand-fg hover:bg-elevated">
          See all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
