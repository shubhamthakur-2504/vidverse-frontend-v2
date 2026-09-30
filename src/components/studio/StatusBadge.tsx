import { Loader2 } from "lucide-react";
import type { VideoStatus } from "@/lib/types/studioType";

// processing = warning, ready = success, failed = danger (UI guide, studio content table)
export function StatusBadge({ status }: { status: VideoStatus }) {
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Processing
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex rounded-sm bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-sm bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
      Ready
    </span>
  );
}
