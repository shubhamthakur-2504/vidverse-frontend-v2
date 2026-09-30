"use client"

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { AuthCard, FormError } from '@/components/auth/AuthCard'
import { PasswordField } from '@/components/auth/PasswordField'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { buttonPrimary, fieldInput, fieldLabel } from '@/components/studio/styles'

// only same-site paths: an absolute ?redirect= must not send people to another site after signing in
const safeRedirect = (value: string | null) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/')

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = safeRedirect(searchParams.get('redirect'))

  useEffect(() => {
    if (!loading && user) router.replace(redirectTo)
  }, [loading, user, router, redirectTo])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!identifier.trim() || !password) {
      setError('Enter your email or username and your password.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await login(identifier.trim(), password)
      router.replace(redirectTo)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Incorrect email or password.'))
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Sign in to VidVerse"
      footer={<>New here? <Link href="/auth/register" className="font-medium text-brand-fg hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="identifier" className={fieldLabel}>Email or username</label>
          <input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            autoFocus
            className={`${fieldInput} h-10`}
          />
        </div>
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          labelAction={<Link href="/auth/forgot-password" className="text-xs font-medium text-brand-fg hover:underline">Forgot password?</Link>}
        />
        <FormError message={error} />
        <button type="submit" disabled={isSubmitting} className={`${buttonPrimary} h-10 w-full`}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <LoginForm />
    </Suspense>
  )
}
