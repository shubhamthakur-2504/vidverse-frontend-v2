import { videoApi } from "@/lib/api/server/videoApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import { UploadForm } from "@/components/studio/UploadForm";

const FALLBACK_CATEGORIES = ["General"];

export default async function StudioUploadPage() {
  let categories = FALLBACK_CATEGORIES;
  try {
    categories = unwrapApiResponse<string[]>(await videoApi.getAllCategories());
  } catch {
    categories = FALLBACK_CATEGORIES;
  }
  return <UploadForm categories={categories} />;
}
