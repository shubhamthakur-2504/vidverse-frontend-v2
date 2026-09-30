import Image from "next/image";
import Link from "next/link";
import { ListVideo } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

type PlaylistCard = {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  updatedAt: string;
  videoCount: number;
};

// a channel's playlists and "your playlists" share this grid
export function PlaylistGrid({
  playlists,
  emptyMessage,
}: {
  playlists: PlaylistCard[];
  emptyMessage: string;
}) {
  if (playlists.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-fg-secondary">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {playlists.map((playlist) => (
        <li key={playlist._id}>
          <Link
            href={`/playlists/${playlist._id}`}
            className="group block space-y-3"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-elevated">
              {playlist.thumbnailUrl && (
                <Image
                  src={playlist.thumbnailUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-bg/80 px-2 py-0.5 text-xs font-medium text-fg">
                <ListVideo className="h-3.5 w-3.5" aria-hidden />
                {playlist.videoCount}{" "}
                {playlist.videoCount === 1 ? "video" : "videos"}
              </span>
            </div>
            <div>
              <h3 className="line-clamp-2 text-sm font-semibold text-fg group-hover:text-brand-fg">
                {playlist.title}
              </h3>
              <p className="mt-1 text-xs text-fg-tertiary">
                Updated {formatTimeAgo(playlist.updatedAt)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
