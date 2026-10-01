import type { Metadata } from "next";
import { Suspense } from "react";
import { Clapperboard } from "lucide-react";
import Link from "next/link";

import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoInfo } from "@/components/video/VideoInfo";
import { CommentSection } from "@/components/video/CommentSection";
import { RelatedVideos } from "@/components/video/RelatedVideos";
import { VideoPlayerSkeleton } from "@/components/video/VideoPlayerSkeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { videoApi } from "@/lib/api/server/videoApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import { Video, WatchVideo } from "@/lib/types/videoType";

type WatchPageProps = { params: Promise<{ videoId: string }> };

const loadVideo = async (videoId: string): Promise<WatchVideo | null> => {
  try {
    return unwrapApiResponse<WatchVideo>(
      await videoApi.getVideoDetails(videoId)
    );
  } catch {
    return null;
  }
};

// shared links show the title, description and thumbnail
export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await loadVideo(videoId);
  if (!video) return { title: "Video not found · VidVerse" };

  const description = video.description?.slice(0, 200) || undefined;
  return {
    title: `${video.title} · VidVerse`,
    description,
    openGraph: {
      type: "video.other",
      title: video.title,
      description,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : undefined,
    },
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;

  // the watch payload and "up next" are fetched in parallel on the server
  const [videoData, relatedRes] = await Promise.all([
    loadVideo(videoId),
    videoApi.getRelated(videoId).catch(() => null),
  ]);

  let relatedVideos: Video[] = [];
  try {
    if (relatedRes)
      relatedVideos = unwrapApiResponse<Video[]>(relatedRes) ?? [];
  } catch {
    /* the sidebar shows its own empty state */
  }

  if (videoData == null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <EmptyState
          icon={Clapperboard}
          title="Video not found"
          description="It may have been removed, made private, or the link may be wrong."
          action={
            <Button asChild>
              <Link href="/">Go to home</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-400 px-4 py-4 pb-12 md:px-6 xl:px-8">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
        <div className="min-w-0 space-y-4">
          <Suspense fallback={<VideoPlayerSkeleton />}>
            <div className="overflow-hidden rounded-lg bg-black">
              <VideoPlayer
                key={videoId}
                videoUrl={videoData.videoFileUrl}
                thumbnail={videoData.thumbnailUrl}
                videoId={videoId}
              />
            </div>

            <VideoInfo video={videoData} />

            <hr className="border-0 border-t border-line" />

            <CommentSection
              targetId={videoId}
              targetType="Video"
              isContentOwner={videoData.viewer.isOwner}
              contentOwnerId={videoData.owner._id}
              totalComments={videoData.stats.comments}
            />
          </Suspense>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-[calc(var(--header-h)+1rem)] xl:self-start">
          <RelatedVideos videos={relatedVideos} />
        </aside>
      </div>
    </div>
  );
}
