import type { Metadata } from "next";
import { serverFetch } from "@/lib/api/server/serverFetch";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { ApiError, ApiSuccess, Page } from "@/lib/types/apiType";
import type { AppNotification } from "@/lib/types/notificationType";
import { NotificationList } from "@/components/notifications/NotificationList";

export const metadata: Metadata = { title: "Notifications · VidVerse" };

// protected in src/proxy.ts
export default async function NotificationsPage() {
  let page: Page<AppNotification> = { items: [], nextCursor: null };
  try {
    page = unwrapApiResponse<Page<AppNotification>>(
      await serverFetch<ApiSuccess<Page<AppNotification>> | ApiError>(
        "/me/notifications"
      )
    );
  } catch {
    /* shows the empty state */
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          New subscribers, comments on your content and uploads from channels
          you follow.
        </p>
        <div className="mt-8">
          <NotificationList initial={page} />
        </div>
      </div>
    </div>
  );
}
