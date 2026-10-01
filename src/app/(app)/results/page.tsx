import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchX } from "lucide-react";
import { videoApi } from "@/lib/api/server/videoApi";
import { unwrapApiResponse } from "@/lib/unwrapApiRes";
import { parseSearchFilters, resultsHref } from "@/lib/search";
import type { VideoSummary } from "@/lib/types/videoType";
import type { Page } from "@/lib/types/apiType";
import { PagedVideoGrid } from "@/components/video/PagedVideoGrid";
import { SearchFilterBar } from "@/components/search/SearchFilterBar";

type ResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: ResultsPageProps): Promise<Metadata> {
  const { q } = parseSearchFilters(await searchParams);
  return { title: q ? `${q} · VidVerse` : "Search · VidVerse" };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const filters = parseSearchFilters(await searchParams);
  // an empty search has no results page (same as YouTube): go back to the feed
  if (!filters.q) redirect("/");

  let results: Page<VideoSummary> = { items: [], nextCursor: null };
  let failed = false;
  try {
    results = unwrapApiResponse<Page<VideoSummary>>(
      await videoApi.search(filters)
    );
  } catch {
    failed = true;
  }
  const hasFilters = Boolean(
    filters.sort || filters.uploaded || filters.duration
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold tracking-tight text-fg">
          Showing results for <span className="break-words">“{filters.q}”</span>
        </h1>
        <div className="mt-4">
          <SearchFilterBar filters={filters} />
        </div>

        <div className="mt-8">
          {/* keyed by the URL so a new search or filter starts over from its first page */}
          <PagedVideoGrid
            key={resultsHref(filters)}
            source={{ kind: "search", filters }}
            initial={results}
            layout="list"
            emptyMessage={
              <div className="flex flex-col items-center">
                <SearchX
                  className="h-12 w-12 text-fg-tertiary"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <h2 className="mt-4 text-base font-semibold text-fg">
                  {failed
                    ? "Search is not available right now"
                    : "No results found"}
                </h2>
                <p className="mt-1">
                  {failed
                    ? "Try again in a moment."
                    : hasFilters
                      ? "Try removing some filters or searching for something else."
                      : "Try different keywords."}
                </p>
                {hasFilters && !failed ? (
                  <Link
                    href={resultsHref({ q: filters.q })}
                    className="mt-4 font-medium text-brand-fg hover:underline"
                  >
                    Clear filters
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="mt-4 font-medium text-brand-fg hover:underline"
                  >
                    Clear search
                  </Link>
                )}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
