"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { AuthCard } from '@/components/auth/AuthCard'
import authApi from '@/lib/api/client/authApi'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { buttonPrimary, buttonSecondary } from '@/components/studio/styles'

type State = { status: 'verifying' } | { status: 'verified' } | { status: 'failed'; message: string }

export function VerifyEmail({ token }: { token: string | null }) {
  const { user, refreshUser } = useAuth()
  const [state, setState] = useState<State>(token ? { status: 'verifying' } : { status: 'failed', message: 'This link is incomplete. Open it from the email again.' })
  const [resent, setResent] = useState(false)
  // the token is single use: run once, even when React re-runs effects in development
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    authApi.verifyEmail(token)
      .then(async () => {
        setState({ status: 'verified' })
        await refreshUser()
      })
      .catch((error: unknown) => setState({ status: 'failed', message: getApiErrorMessage(error, 'This link is invalid or has expired.') }))
  }, [token, refreshUser])

  const resend = async () => {
    try {
      await authApi.requestEmailVerification()
      setResent(true)
    } catch (error: unknown) {
      setState({ status: 'failed', message: getApiErrorMessage(error, "Couldn't send a new link. Try again later.") })
    }
  }

  if (state.status === 'verifying') {
    return (
      <AuthCard title="Confirming your email">
        <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-fg-tertiary" aria-label="Confirming" /></div>
      </AuthCard>
    )
  }

  if (state.status === 'verified') {
    return (
      <AuthCard title="Email confirmed">
        <p className="flex items-center gap-2 text-sm text-fg-secondary">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
          Thanks! Your email address is confirmed.
        </p>
        <Link href="/" className={`${buttonPrimary} mt-6 h-10 w-full`}>Go to VidVerse</Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="We couldn't confirm your email">
      <p className="text-sm text-fg-secondary">{state.message}</p>
      {user && !user.emailVerifiedAt && (
        resent
          ? <p className="mt-4 text-sm text-fg">We sent a new link to {user.email}.</p>
          : <button type="button" onClick={resend} className={`${buttonSecondary} mt-6 w-full`}>Send a new link</button>
      )}
      {!user && (
        <p className="mt-4 text-sm text-fg-secondary">
          <Link href="/auth/login?redirect=/settings" className="font-medium text-brand-fg hover:underline">Sign in</Link> to request a new link from settings.
        </p>
      )}
    </AuthCard>
  )
}
