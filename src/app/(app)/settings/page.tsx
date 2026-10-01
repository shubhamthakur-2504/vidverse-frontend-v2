import ServerHero from "@/components/settings/ServerHero";
import SettingsClient from "@/components/settings/SettingsClient";
import type { SettingsClientUser } from "@/components/settings/SettingsClient";
import { serverFetch } from "@/lib/api/server/serverFetch";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";

export default async function SettingsPage() {
  let user: SettingsClientUser = null;
  try {
    const res = await serverFetch("/me");
    user = unwrapApiResponse<SettingsClientUser>(res);
  } catch {
    user = null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-10">
      <div className="relative container mx-auto px-4 space-y-6">
        {/* Server-rendered hero */}
        <ServerHero user={user} />

        {/* Client interactive shell */}
        <SettingsClient user={user} />
      </div>
    </div>
  );
}
