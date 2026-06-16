"use client"

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo)
    }
  }, [loading, user, router, redirectTo])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!identifier.trim() || !password.trim()) {
      toast.error('Missing fields', {
        description: 'Enter your username/email and password.'
      })
      return
    }

    setIsSubmitting(true)
    try {
      await login(identifier.trim(), password)
      toast.success('Welcome back')
      router.replace(redirectTo)
    } catch (error: any) {
      toast.error('Login failed', {
        description: error?.response?.data?.message || error?.message || 'Please check your credentials.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]" />
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-6 p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Watch, create, and connect
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            Welcome back to
            <span className="block bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VidVerse
            </span>
          </h1>
          <p className="max-w-xl text-muted-foreground text-lg">
            Sign in to keep watching, comment, and manage your channel without losing your place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl shadow-black/20">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Use your username or email address to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Username or email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@example.com or username"
                      className="pl-10"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                New here?{' '}
                <Link href="/auth/register" className="font-medium text-blue-400 hover:text-blue-300">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0f]">
        <div className="text-white/50 text-sm animate-pulse">Loading login details...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
