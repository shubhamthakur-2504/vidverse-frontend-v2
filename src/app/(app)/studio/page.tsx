import { videoApi } from "@/lib/api/server/videoApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import type { StudioOverview } from "@/lib/types/studioType";
import { StudioDashboard } from "@/components/studio/StudioDashboard";

export default async function StudioPage() {
  let overview: StudioOverview | null = null;
  try {
    overview = unwrapApiResponse<StudioOverview>(await videoApi.getStudio());
  } catch {
    overview = null;
  }

  if (!overview) {
    return (
      <p className="text-sm text-fg-secondary">
        Your studio could not be loaded. Refresh the page to try again.
      </p>
    );
  }
  return <StudioDashboard initial={overview} />;
}
