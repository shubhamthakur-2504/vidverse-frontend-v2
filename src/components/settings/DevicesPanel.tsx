"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Laptop, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/AuthProvider'
import authApi from '@/lib/api/client/authApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { describeUserAgent } from '@/lib/userAgent'
import { formatTimeAgo } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/dialog'
import { buttonGhost, buttonSecondary, card } from '@/components/studio/styles'

// GET /v2/auth/sessions: one signed-in device
type Session = { _id: string; userAgent?: string; ip?: string; createdAt: string; lastUsedAt: string; current: boolean }

// "Your devices": every active session, with sign-out per device and for all other devices
export function DevicesPanel() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [confirmingOthers, setConfirmingOthers] = useState(false)
  const [signingOutOthers, setSigningOutOthers] = useState(false)

  useEffect(() => {
    authApi.listSessions()
      .then((res) => setSessions(res.data.data))
      .catch((error: unknown) => {
        setSessions([])
        toast.error("Couldn't load your devices.", { description: getApiErrorMessage(error) })
      })
  }, [])

  const signOut = async (session: Session) => {
    setPending(session._id)
    try {
      await authApi.revokeSession(session._id)
      if (session.current) {
        // the API cleared this device's cookies: drop the signed-in state, then go to the login page
        await refreshUser()
        router.push('/auth/login')
        router.refresh()
        return
      }
      setSessions((current) => current?.filter((s) => s._id !== session._id) ?? null)
    } catch (error: unknown) {
      toast.error("Couldn't sign that device out.", { description: getApiErrorMessage(error) })
    } finally {
      setPending(null)
    }
  }

  const signOutOthers = async () => {
    setSigningOutOthers(true)
    try {
      await authApi.revokeOtherSessions()
      setSessions((current) => current?.filter((s) => s.current) ?? null)
      setConfirmingOthers(false)
    } catch (error: unknown) {
      toast.error("Couldn't sign the other devices out.", { description: getApiErrorMessage(error) })
    } finally {
      setSigningOutOthers(false)
    }
  }

  const others = sessions?.filter((s) => !s.current).length ?? 0

  return (
    <section className={`${card} p-6`} aria-labelledby="devices-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="devices-heading" className="text-lg font-semibold text-fg">Your devices</h2>
          <p className="mt-1 text-sm text-fg-secondary">Browsers and devices signed in to your account.</p>
        </div>
        {others > 0 && (
          <button type="button" onClick={() => setConfirmingOthers(true)} className={buttonSecondary}>
            Sign out other devices
          </button>
        )}
      </div>

      {sessions === null ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-fg-tertiary" aria-label="Loading" /></div>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {sessions.map((session) => (
            <li key={session._id} className="flex items-center gap-4 py-3">
              <Laptop className="h-5 w-5 shrink-0 text-fg-tertiary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {describeUserAgent(session.userAgent)}
                  {session.current && <span className="ml-2 rounded bg-brand-subtle px-1.5 py-0.5 text-xs font-medium text-brand-fg">This device</span>}
                </p>
                <p className="text-xs text-fg-tertiary">
                  {session.ip ? `${session.ip} · ` : ''}Active {formatTimeAgo(session.lastUsedAt)} · Signed in {formatTimeAgo(session.createdAt)}
                </p>
              </div>
              <button type="button" onClick={() => signOut(session)} disabled={pending === session._id} className={buttonGhost}>
                {pending === session._id ? 'Signing out...' : 'Sign out'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmingOthers}
        onOpenChange={setConfirmingOthers}
        title="Sign out other devices?"
        description={`${others} other ${others === 1 ? 'device' : 'devices'} will need to sign in again. This device stays signed in.`}
        confirmLabel="Sign out"
        busy={signingOutOthers}
        onConfirm={signOutOthers}
      />
    </section>
  )
}
