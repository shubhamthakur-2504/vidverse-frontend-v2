// ServerHero: server-rendered hero with banner + avatar for settings
import { unwrapApiResponse } from '@/lib/unwrapApiRes'
import { serverFetch } from '@/lib/api/server/serverFetch'

type ServerUser = {
  avatarUrl?: string
  coverImageUrl?: string
  userName?: string
  fullName?: string
  email?: string
} | null

export default async function ServerHero({ user }: { user: ServerUser }) {
  let stats = { subscribersCount: 0, subscriptionsCount: 0 }
  try {
    const res = await serverFetch('/me/stats')
    const data = unwrapApiResponse<{ subscribersCount?: number; subscriptionsCount?: number }>(res)
    stats = { subscribersCount: data.subscribersCount || 0, subscriptionsCount: data.subscriptionsCount || 0 }
  } catch {
    // swallow — show zeros
  }

  const coverSrc = user?.coverImageUrl || ''
  const avatarSrc = user?.avatarUrl || ''
  const initials = user?.userName?.charAt(0)?.toUpperCase() || '?'

  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30 shadow-2xl shadow-black/30">
      {/* Banner / Cover Image */}
      <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt="Channel banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-indigo-900/50" />
        )}
        {/* Gradient overlay at bottom so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Profile info area */}
      <div className="relative px-6 pb-6 md:px-8 md:pb-8">
        {/* Avatar — overlapping the banner */}
        <div className="relative -mt-14 mb-4 flex items-end gap-5">
          <div className="h-24 w-24 shrink-0 rounded-full border-4 border-black/60 overflow-hidden shadow-xl shadow-black/40 ring-2 ring-white/10">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt={user?.userName || 'User'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">
              {user?.fullName || 'Creator'}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{user?.userName || 'unknown'}
              {user?.email && (
                <span className="ml-2 hidden sm:inline">
                  · {user.email}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-md">
            <span className="font-bold">{stats.subscribersCount}</span>
            <span className="text-muted-foreground">Subscribers</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-md">
            <span className="font-bold">{stats.subscriptionsCount}</span>
            <span className="text-muted-foreground">Subscriptions</span>
          </div>
        </div>
      </div>
    </section>
  )
}
