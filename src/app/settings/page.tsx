import ServerHero from '@/components/settings/ServerHero'
import SettingsClient from '@/components/settings/SettingsClient'
import type { SettingsClientUser } from '@/components/settings/page.client'
import { serverFetch } from '@/lib/api/server/serverFetch'
import { unwrapApiResponse } from '@/lib/unwrapApiRes'

export default async function SettingsPage() {
  let user: SettingsClientUser = null
  try {
    const res = await serverFetch('/user/getcurrentuser')
    user = unwrapApiResponse<SettingsClientUser>(res)
  } catch {
    user = null
  }

  return (
    <div className="min-h-screen pt-16 pb-10 relative overflow-hidden">
      <div className="relative container mx-auto px-4 space-y-6">
        {/* Server-rendered hero */}
        <ServerHero user={user} />

        {/* Client interactive shell */}
        <SettingsClient user={user} />
      </div>
    </div>
  )
}
