"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import historyApi from "@/lib/api/client/historyApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import type { HistoryVideo } from "@/lib/types/libraryType";
import { ConfirmDialog } from "@/components/ui/dialog";
import { buttonGhost, buttonSecondary } from "@/components/studio/styles";
import { VideoRow } from "./VideoRow";

export function HistoryList({ initial }: { initial: HistoryVideo[] }) {
  const [videos, setVideos] = useState(initial);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const remove = async (video: HistoryVideo) => {
    const before = videos;
    setVideos((current) => current.filter((v) => v._id !== video._id));
    try {
      await historyApi.remove(video._id);
    } catch (error: unknown) {
      setVideos(before);
      toast.error("Could not remove the video from your history", {
        description: getApiErrorMessage(error),
      });
    }
  };

  const clear = async () => {
    setClearing(true);
    try {
      await historyApi.clear();
      setVideos([]);
      setConfirmingClear(false);
      toast.success("Watch history cleared");
    } catch (error: unknown) {
      toast.error("Could not clear your history", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setClearing(false);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-fg-secondary">
          Videos you watch will show up here.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-brand-fg hover:underline"
        >
          Browse videos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setConfirmingClear(true)}
          className={buttonSecondary}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Clear history
        </button>
      </div>
      <ul className="space-y-1">
        {videos.map((video) => (
          <VideoRow
            key={video._id}
            video={video}
            action={
              <button
                type="button"
                onClick={() => remove(video)}
                className={buttonGhost}
                aria-label={`Remove ${video.title} from history`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            }
          />
        ))}
      </ul>
      <ConfirmDialog
        open={confirmingClear}
        onOpenChange={setConfirmingClear}
        title="Clear watch history?"
        description="Every video will be removed from your history. This cannot be undone."
        confirmLabel="Clear history"
        busy={clearing}
        onConfirm={clear}
      />
    </div>
  );
}
