import type { Metadata } from "next";
import { libraryApi } from "@/lib/api/server/libraryApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { MyPlaylist } from "@/lib/types/libraryType";
import { PlaylistGrid } from "@/components/library/PlaylistGrid";

export const metadata: Metadata = { title: "Your playlists · VidVerse" };

// protected in src/proxy.ts (only this list; /playlists/:id is public)
export default async function PlaylistsPage() {
  let playlists: MyPlaylist[] = [];
  try {
    playlists = unwrapApiResponse<MyPlaylist[]>(
      await libraryApi.getMyPlaylists()
    );
  } catch {
    /* shows the empty state */
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Your playlists
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          Save videos from the watch page to add them to a playlist.
        </p>
        <div className="mt-8">
          <PlaylistGrid
            playlists={playlists}
            emptyMessage="You have no playlists yet."
          />
        </div>
      </div>
    </div>
  );
}
