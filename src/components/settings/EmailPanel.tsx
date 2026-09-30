"use client"

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/AuthProvider'
import authApi from '@/lib/api/client/authApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { buttonSecondary, card } from '@/components/studio/styles'

// the account email (read-only for now) and whether it is confirmed, with a way to re-send the link
export function EmailPanel() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!user) return null
  const verified = Boolean(user.emailVerifiedAt)

  const resend = async () => {
    setSending(true)
    try {
      await authApi.requestEmailVerification()
      setSent(true)
    } catch (error: unknown) {
      toast.error("Couldn't send the email.", { description: getApiErrorMessage(error) })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className={`${card} p-6`} aria-labelledby="email-heading">
      <h2 id="email-heading" className="text-lg font-semibold text-fg">Email</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-fg">{user.email}</span>
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded bg-success/15 px-1.5 py-0.5 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Confirmed
          </span>
        ) : (
          <span className="rounded bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning">Not confirmed</span>
        )}
      </div>
      {!verified && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-fg-secondary">
            {sent ? `We sent a new link to ${user.email}. It works for 24 hours.` : 'Confirm your email so you can reset your password if you forget it.'}
          </p>
          {!sent && (
            <button type="button" onClick={resend} disabled={sending} className={buttonSecondary}>
              {sending ? 'Sending...' : 'Send confirmation link'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
