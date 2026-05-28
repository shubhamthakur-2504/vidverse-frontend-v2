"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, FileImage, Lock, Mail, Sparkles, Upload, User } from 'lucide-react'
import authApi from '@/lib/api/client/authApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handleDrop = (event: DragEvent) => {
      event.preventDefault()
    }
    window.addEventListener('dragover', handleDrop)
    window.addEventListener('drop', handleDrop)
    return () => {
      window.removeEventListener('dragover', handleDrop)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fullName.trim() || !userName.trim() || !email.trim() || !password.trim()) {
      toast.error('Missing fields', {
        description: 'Fill in your name, username, email, and password.'
      })
      return
    }

    if (!avatar || !cover) {
      toast.error('Missing images', {
        description: 'Avatar and cover image are required by the backend.'
      })
      return
    }

    const formData = new FormData()
    formData.append('fullName', fullName.trim())
    formData.append('userName', userName.trim())
    formData.append('email', email.trim())
    formData.append('password', password)
    formData.append('avatar', avatar)
    formData.append('cover', cover)

    setIsSubmitting(true)
    try {
      await authApi.register(formData)
      toast.success('Account created', {
        description: 'You can sign in now.'
      })
      router.replace('/auth/login')
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error?.response?.data?.message || error?.message || 'Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]" />
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[0.8fr_1.2fr] gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-6 p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Build your channel identity
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            Create your
            <span className="block bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              VidVerse account
            </span>
          </h1>
          <p className="max-w-xl text-muted-foreground text-lg">
            Join the platform, upload a channel avatar and cover, and start sharing videos with your audience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl shadow-black/20">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">Create account</CardTitle>
              <CardDescription>
                The backend expects both avatar and cover uploads during registration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Full name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="pl-10" autoComplete="name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="your_handle" className="pl-10" autoComplete="username" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" autoComplete="email" />
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
                        placeholder="Choose a password"
                        className="pl-10 pr-10"
                        autoComplete="new-password"
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 p-4 transition-colors hover:border-white/25 hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-500/15 p-2 text-blue-300">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Avatar</p>
                        <p className="text-xs text-muted-foreground">Square image recommended</p>
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileImage className="h-4 w-4" />
                      {avatar ? avatar.name : 'Choose avatar image'}
                    </div>
                  </label>

                  <label className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 p-4 transition-colors hover:border-white/25 hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-500/15 p-2 text-purple-300">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Cover image</p>
                        <p className="text-xs text-muted-foreground">Wide banner image</p>
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileImage className="h-4 w-4" />
                      {cover ? cover.name : 'Choose cover image'}
                    </div>
                  </label>
                </div>

                <Button type="submit" className="w-full bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
