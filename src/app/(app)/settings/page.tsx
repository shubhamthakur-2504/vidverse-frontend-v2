import type { Metadata } from "next";

import ServerHero from "@/components/settings/ServerHero";
import SettingsClient from "@/components/settings/SettingsClient";
import type {
  SettingsClientUser,
  SettingsTab,
} from "@/components/settings/SettingsClient";
import { Tabs } from "@/components/ui/tabs";
import { serverFetch } from "@/lib/api/server/serverFetch";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";

export const metadata: Metadata = { title: "Settings · VidVerse" };

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "assets", label: "Channel images" },
  { id: "security", label: "Account & security" },
] as const;

const isTab = (value: string | undefined): value is SettingsTab =>
  TABS.some((tab) => tab.id === value);

// protected in src/proxy.ts
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const requested = (await searchParams).tab;
  const tab: SettingsTab = isTab(requested) ? requested : "profile";

  let user: SettingsClientUser = null;
  try {
    user = unwrapApiResponse<SettingsClientUser>(await serverFetch("/me"));
  } catch {
    user = null;
  }

  // the forms read better narrow; the guide caps them at 720px
  return (
    <div className="mx-auto max-w-180 space-y-6 px-4 py-6 pb-16 md:px-6">
      <ServerHero user={user} />

      <Tabs
        label="Settings sections"
        current={tab === "profile" ? "/settings" : `/settings?tab=${tab}`}
        items={TABS.map(({ id, label }) => ({
          href: id === "profile" ? "/settings" : `/settings?tab=${id}`,
          label,
        }))}
      />

      <SettingsClient user={user} tab={tab} />
    </div>
  );
}
