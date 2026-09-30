import type { Metadata } from "next";
import { libraryApi } from "@/lib/api/server/libraryApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { HistoryVideo } from "@/lib/types/libraryType";
import { HistoryList } from "@/components/library/HistoryList";

export const metadata: Metadata = { title: "History · VidVerse" };

// protected in src/proxy.ts
export default async function HistoryPage() {
  let videos: HistoryVideo[] = [];
  try {
    videos = unwrapApiResponse<HistoryVideo[]>(await libraryApi.getHistory());
  } catch {
    /* shows the empty state */
  }

  return (
    <div className="min-h-screen bg-bg pt-16">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          History
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          Videos you watched, most recent first.
        </p>
        <div className="mt-8">
          <HistoryList initial={videos} />
        </div>
      </div>
    </div>
  );
}
