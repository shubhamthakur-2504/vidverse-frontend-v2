"use client"

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import notificationApi from '@/lib/api/client/notificationApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import type { AppNotification } from '@/lib/types/notificationType'
import type { Page } from '@/lib/types/apiType'
import { buttonSecondary } from '@/components/studio/styles'
import { NotificationItem } from './NotificationItem'

// the full list on /notifications: "Load more" and "Mark all as read"
export function NotificationList({ initial }: { initial: Page<AppNotification> }) {
  const [items, setItems] = useState(initial.items)
  const [cursor, setCursor] = useState(initial.nextCursor)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const page: Page<AppNotification> = (await notificationApi.list({ cursor })).data.data
      setItems((current) => [...current, ...page.items])
      setCursor(page.nextCursor)
    } catch (error: unknown) {
      toast.error("Couldn't load more notifications.", { description: getApiErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  const markRead = (ids?: string[]) => {
    const now = new Date().toISOString()
    setItems((current) => current.map((n) => (!ids || ids.includes(n._id) ? { ...n, readAt: n.readAt ?? now } : n)))
    notificationApi.markRead(ids).catch(() => { /* shown as unread again on the next visit */ })
  }

  if (items.length === 0) {
    return <p className="py-16 text-center text-sm text-fg-secondary">No notifications yet. New subscribers, comments and uploads from channels you follow show up here.</p>
  }

  const anyUnread = items.some((n) => !n.readAt)

  return (
    <div>
      {anyUnread && (
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={() => markRead()} className={buttonSecondary}>Mark all as read</button>
        </div>
      )}
      <div className="space-y-1">
        {items.map((n) => (
          <NotificationItem key={n._id} notification={n} onOpen={(item) => { if (!item.readAt) markRead([item._id]) }} />
        ))}
      </div>
      {cursor && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={loadMore} disabled={loading} className={buttonSecondary}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
