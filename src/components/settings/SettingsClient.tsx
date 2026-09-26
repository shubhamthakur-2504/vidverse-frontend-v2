"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  PenLine,
  Save,
  Shield,
  Trash2,
  Upload,
  User,
  Video,
  WandSparkles,
  X,
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import authApi from '@/lib/api/client/authApi'
import videoApi from '@/lib/api/client/videoApi'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { Video as VideoType } from '@/lib/types/videoType'
import type { ChangeUserInfo } from '@/lib/types/authType'
import { toast } from 'sonner'
import { getApiErrorMessage as getErrorMessage } from '@/lib/apiErrorMessage'

export type SettingsClientUser = {
  avatarUrl?: string
  userName?: string
  fullName?: string
  email?: string
  coverImageUrl?: string
  _id?: string
} | null

/* ─── Tab definitions ─── */
const TABS = [
  { key: 'profile' as const, label: 'Profile', icon: User },
  { key: 'images' as const, label: 'Channel Assets', icon: Camera },
  { key: 'security' as const, label: 'Security', icon: Shield },
  { key: 'videos' as const, label: 'My Videos', icon: Video },
]
type TabKey = (typeof TABS)[number]['key']

export default function SettingsPageClient({ user: serverUser }: { user?: SettingsClientUser }) {
  const { user: authUser, refreshUser } = useAuth()
  const user = authUser ?? serverUser ?? null
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

  // ─── Profile state ───
  const [userName, setUserName] = useState('')
  const [fullName, setFullName] = useState('')
  const [savingIdentity, setSavingIdentity] = useState(false)

  // ─── Assets state ───
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [savingAssets, setSavingAssets] = useState(false)

  // ─── Security state ───
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // ─── Videos state ───
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null)
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState('')
  const [savingVideo, setSavingVideo] = useState(false)
  const [togglingVideo, setTogglingVideo] = useState(false)
  const [deletingVideo, setDeletingVideo] = useState(false)

  const selectedVideo = useMemo(
    () => videos.find((video) => video._id === selectedVideoId) || null,
    [videos, selectedVideoId]
  )
  const avatarSrc = avatarPreview || user?.avatarUrl || ''
  const heroCoverSrc = coverPreview || user?.coverImageUrl || ''

  // ─── Effects ───
  useEffect(() => {
    if (!user) return
    setUserName(user.userName || '')
    setFullName(user.fullName || '')
    setAvatarPreview(user.avatarUrl || '')
    setCoverPreview(user.coverImageUrl || '')
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchVideos = async () => {
      try {
        setLoadingVideos(true)
        const response = await videoApi.getMine()
        const data = unwrapApiResponse<VideoType[]>(response.data)
        setVideos(data)
        setSelectedVideoId(null)
      } catch {
        setVideos([])
      } finally {
        setLoadingVideos(false)
      }
    }

    void fetchVideos()
  }, [user])

  useEffect(() => {
    if (!selectedVideo) {
      setVideoTitle('')
      setVideoDescription('')
      setVideoThumbnail(null)
      setVideoThumbnailPreview('')
      return
    }

    setVideoTitle(selectedVideo.title || '')
    setVideoDescription(selectedVideo.description || '')
    setVideoThumbnail(null)
    setVideoThumbnailPreview('')
  }, [selectedVideo])

  useEffect(() => {
    if (!avatarFile) return
    const objectUrl = URL.createObjectURL(avatarFile)
    setAvatarPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [avatarFile])

  useEffect(() => {
    if (!coverFile) return
    const objectUrl = URL.createObjectURL(coverFile)
    setCoverPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [coverFile])

  useEffect(() => {
    if (!videoThumbnail) return
    const objectUrl = URL.createObjectURL(videoThumbnail)
    setVideoThumbnailPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [videoThumbnail])

  // ─── Handlers ───
  const handleIdentitySave = async () => {
    const updates: ChangeUserInfo[] = []

    if (userName.trim() && userName.trim() !== user?.userName) {
      updates.push({ userName: userName.trim() })
    }
    if (fullName.trim() && fullName.trim() !== user?.fullName) {
      updates.push({ fullName: fullName.trim() })
    }

    if (updates.length === 0) {
      toast.info('Nothing to update', {
        description: 'Your channel name and display name are already up to date.',
      })
      return
    }

    setSavingIdentity(true)
    try {
      for (const payload of updates) {
        await authApi.changeUserInfo(payload)
      }
      await refreshUser()
      toast.success('Profile details saved')
    } catch (error: unknown) {
      toast.error('Could not save profile details', {
        description: getErrorMessage(error),
      })
    } finally {
      setSavingIdentity(false)
    }
  }

  const handleAssetsSave = async () => {
    if (!avatarFile && !coverFile) {
      toast.info('Nothing to update', {
        description: 'Choose a new avatar or cover image first.',
      })
      return
    }

    setSavingAssets(true)
    try {
      if (avatarFile) {
        const avatarForm = new FormData()
        avatarForm.append('avatar', avatarFile)
        await authApi.changeAvatar(avatarForm)
      }

      if (coverFile) {
        const coverForm = new FormData()
        coverForm.append('cover', coverFile)
        await authApi.changeCover(coverForm)
      }

      setAvatarFile(null)
      setCoverFile(null)
      await refreshUser()
      toast.success('Profile images updated')
    } catch (error: unknown) {
      toast.error('Could not update images', {
        description: getErrorMessage(error),
      })
    } finally {
      setSavingAssets(false)
    }
  }

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Missing password fields', {
        description: 'Enter your current password and the new password.',
      })
      return
    }

    setSavingPassword(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Password updated')
    } catch (error: unknown) {
      toast.error('Could not change password', {
        description: getErrorMessage(error),
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleVideoSave = async () => {
    if (!selectedVideo) return
    if (!videoTitle.trim()) {
      toast.error('Title required', {
        description: 'Your video needs a title before it can be saved.',
      })
      return
    }

    setSavingVideo(true)
    try {
      const payload = videoThumbnail
        ? (() => {
            const formData = new FormData()
            formData.append('title', videoTitle.trim())
            formData.append('description', videoDescription.trim())
            formData.append('thumbnail', videoThumbnail)
            return formData
          })()
        : {
            title: videoTitle.trim(),
            description: videoDescription.trim(),
          }

      await videoApi.update(payload, selectedVideo._id)
      const response = await videoApi.getMine()
      const data = unwrapApiResponse<VideoType[]>(response.data)
      setVideos(data)
      setSelectedVideoId(selectedVideo._id)
      toast.success('Video saved')
    } catch (error: unknown) {
      toast.error('Could not save video', {
        description: getErrorMessage(error),
      })
    } finally {
      setSavingVideo(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!selectedVideo) return

    setTogglingVideo(true)
    try {
      await videoApi.togglePublish(selectedVideo._id)
      const response = await videoApi.getMine()
      const data = unwrapApiResponse<VideoType[]>(response.data)
      setVideos(data)
      setSelectedVideoId(selectedVideo._id)
      toast.success(selectedVideo.isPublished ? 'Video hidden from public view' : 'Video published')
    } catch (error: unknown) {
      toast.error('Could not update publish state', {
        description: getErrorMessage(error),
      })
    } finally {
      setTogglingVideo(false)
    }
  }

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return

    const confirmed = window.confirm(
      `Delete "${selectedVideo.title}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setDeletingVideo(true)
    try {
      await videoApi.delete(selectedVideo._id)
      const response = await videoApi.getMine()
      const data = unwrapApiResponse<VideoType[]>(response.data)
      setVideos(data)
      setSelectedVideoId(data[0]?._id || null)
      toast.success('Video deleted')
    } catch (error: unknown) {
      toast.error('Could not delete video', {
        description: getErrorMessage(error),
      })
    } finally {
      setDeletingVideo(false)
    }
  }

  const hasIdentityChanges =
    userName.trim() !== (user?.userName || '') || fullName.trim() !== (user?.fullName || '')
  const hasAssetChanges = Boolean(avatarFile || coverFile)
  const hasPasswordChanges = Boolean(currentPassword && newPassword)
  const hasVideoChanges = Boolean(
    selectedVideo &&
      (videoTitle.trim() !== (selectedVideo.title || '') ||
        videoDescription.trim() !== (selectedVideo.description || '') ||
        videoThumbnail)
  )

  // ─── Render ───
  return (
    <div className="space-y-6">
      {/* ─── Tab navigation ─── */}
      <nav className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-1.5 backdrop-blur-xl scrollbar-none">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium
              transition-all duration-200
              ${activeTab === key
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* ─── Tab Content ─── */}
      <div className="max-w-3xl">
        {/* ─── PROFILE TAB ─── */}
        {activeTab === 'profile' && (
          <section className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {/* Identity card */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-blue-500/15 p-2.5">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Channel Identity</h2>
                  <p className="text-sm text-muted-foreground">Update your public channel name and display name</p>
                </div>
              </div>

              <div className="flex items-start gap-5 mb-6">
                <Avatar className="h-16 w-16 shrink-0 ring-4 ring-blue-500/20 shadow-lg shadow-black/30">
                  {avatarSrc ? <AvatarImage src={avatarSrc} alt={user?.userName || 'User'} /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-xl font-bold">
                    {user?.userName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-xl font-bold truncate">{user?.fullName || 'Creator'}</h3>
                  <p className="text-sm text-muted-foreground">@{user?.userName || 'unknown'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mb-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="username" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Display name" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleIdentitySave}
                  disabled={savingIdentity || !hasIdentityChanges}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {savingIdentity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ─── CHANNEL ASSETS TAB ─── */}
        {activeTab === 'images' && (
          <section className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-purple-500/15 p-2.5">
                  <Camera className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Channel Assets</h2>
                  <p className="text-sm text-muted-foreground">Update your avatar and cover banner</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Avatar upload */}
                <label className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 transition-all hover:border-white/30 hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500/15 p-2 text-blue-400">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Avatar</p>
                      <p className="text-xs text-muted-foreground">Square crop works best</p>
                    </div>
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {avatarSrc ? (
                      <Image src={avatarSrc} alt="Avatar preview" fill className="object-cover" sizes="240px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur-md">
                        <PenLine className="h-4 w-4" />
                        Change
                      </span>
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{avatarFile ? avatarFile.name : 'No file selected'}</span>
                    {avatarFile && (
                      <button type="button" onClick={(e) => { e.preventDefault(); setAvatarFile(null) }} className="text-blue-400 hover:text-blue-300">
                        Clear
                      </button>
                    )}
                  </div>
                </label>

                {/* Cover upload */}
                <label className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 transition-all hover:border-white/30 hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-500/15 p-2 text-purple-400">
                      <WandSparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Cover Image</p>
                      <p className="text-xs text-muted-foreground">Wide banner for best fit</p>
                    </div>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {heroCoverSrc ? (
                      <Image src={heroCoverSrc} alt="Cover preview" fill className="object-cover" sizes="480px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Camera className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur-md">
                        <WandSparkles className="h-4 w-4" />
                        Change
                      </span>
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{coverFile ? coverFile.name : 'No file selected'}</span>
                    {coverFile && (
                      <button type="button" onClick={(e) => { e.preventDefault(); setCoverFile(null) }} className="text-purple-400 hover:text-purple-300">
                        Clear
                      </button>
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  onClick={handleAssetsSave}
                  disabled={savingAssets || !hasAssetChanges}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {savingAssets ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Save Images
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ─── SECURITY TAB ─── */}
        {activeTab === 'security' && (
          <section className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-rose-500/15 p-2.5">
                  <Lock className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Password</h2>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Current password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">New password</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Choose a stronger password"
                  />
                </div>

                <Button
                  onClick={handlePasswordSave}
                  disabled={savingPassword || !hasPasswordChanges}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
                >
                  {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Update Password
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ─── VIDEOS TAB ─── */}
        {activeTab === 'videos' && (
          <section className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl bg-blue-500/15 p-2.5">
                <Video className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Your Videos</h2>
                <p className="text-sm text-muted-foreground">
                  {videos.length > 0
                    ? `${videos.length} upload${videos.length > 1 ? 's' : ''} — click a card to edit`
                    : 'Manage your uploads'}
                </p>
              </div>
            </div>

            {loadingVideos ? (
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading your videos...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-14 text-center">
                <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">No uploads yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Upload your first video to manage it here.</p>
                <Button asChild className="mt-5 bg-gradient-to-r from-blue-500 to-purple-500">
                  <Link href="/"><span>Go to Home</span></Link>
                </Button>
              </div>
            ) : (
              <>
                {/* ── Full-width thumbnail grid — always 4 columns ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {videos.map((video) => {
                    const isSelected = selectedVideoId === video._id
                    return (
                      <button
                        key={video._id}
                        onClick={() => setSelectedVideoId(video._id)}
                        className={`group relative rounded-2xl overflow-hidden text-left transition-all duration-200 border ${
                          isSelected
                            ? 'border-violet-500/70 ring-2 ring-violet-500/30 shadow-xl shadow-violet-500/15'
                            : 'border-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-black/40'
                        }`}
                      >
                        <div className="relative aspect-video bg-black/40">
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="320px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                          <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${
                            video.isPublished ? 'bg-emerald-500/80 text-white' : 'bg-yellow-500/80 text-black'
                          }`}>
                            {video.isPublished ? 'Public' : 'Private'}
                          </span>
                          <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white/80 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                            {Math.round(video.duration || 0)}s
                          </span>
                          {isSelected && (
                            <div className="absolute inset-0 ring-2 ring-inset ring-violet-500/70 rounded-2xl pointer-events-none" />
                          )}
                        </div>
                        <div className="p-3 bg-black/40">
                          <p className="text-sm font-semibold line-clamp-2 leading-snug">{video.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{video.views} views</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* ── Centered modal edit panel — only mounts on card click ── */}
                {selectedVideo && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedVideoId(null) }}
                  >
                    <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f0f17] shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                      {/* Modal header */}
                      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-2 min-w-0">
                          <PenLine className="h-4 w-4 text-purple-400 shrink-0" />
                          <p className="font-semibold text-sm truncate">{selectedVideo.title}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVideoId(null)}
                          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Modal body */}
                      <div className="p-6 grid sm:grid-cols-[220px_1fr] gap-5 max-h-[80vh] overflow-y-auto">
                        {/* Left: thumbnail */}
                        <div className="space-y-3">
                          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40">
                            <Image
                              src={videoThumbnailPreview || selectedVideo.thumbnailUrl}
                              alt={selectedVideo.title}
                              fill
                              className="object-cover"
                              sizes="220px"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <div className="flex items-center justify-between text-[10px] text-white/80">
                                <span className={`rounded-full px-2 py-0.5 backdrop-blur-sm ${
                                  selectedVideo.isPublished ? 'bg-emerald-500/30 text-emerald-200' : 'bg-yellow-500/30 text-yellow-200'
                                }`}>
                                  {selectedVideo.isPublished ? 'Public' : 'Private'}
                                </span>
                                <span>{selectedVideo.views} views</span>
                              </div>
                            </div>
                          </div>
                          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-2 transition-all hover:border-white/25 hover:bg-white/[0.06]">
                            <div>
                              <p className="font-medium text-xs">Replace Thumbnail</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {videoThumbnail ? videoThumbnail.name : 'Click to upload'}
                              </p>
                            </div>
                            <div className="rounded-full bg-blue-500/15 p-1.5 text-blue-400">
                              <Upload className="h-3.5 w-3.5" />
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setVideoThumbnail(e.target.files?.[0] ?? null)} />
                          </label>
                        </div>

                        {/* Right: fields */}
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Title</label>
                            <Input
                              value={videoTitle}
                              onChange={(e) => setVideoTitle(e.target.value)}
                              placeholder="Video title"
                              className="text-sm h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                            <Textarea
                              value={videoDescription}
                              onChange={(e) => setVideoDescription(e.target.value)}
                              placeholder="What this video is about"
                              className="min-h-[120px] resize-none text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Modal footer */}
                      <div className="flex flex-wrap gap-2 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
                        <Button
                          onClick={handleVideoSave}
                          disabled={savingVideo || !hasVideoChanges}
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                          {savingVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          <span>Save Changes</span>
                        </Button>
                        <Button
                          onClick={handleTogglePublish}
                          disabled={togglingVideo}
                          size="sm"
                          variant="outline"
                          className="border-white/10"
                        >
                          {togglingVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                          <span>{selectedVideo.isPublished ? 'Unpublish' : 'Publish'}</span>
                        </Button>
                        <Button
                          onClick={handleDeleteVideo}
                          disabled={deletingVideo}
                          size="sm"
                          variant="destructive"
                          className="ml-auto"
                        >
                          {deletingVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          <span>Delete Video</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
