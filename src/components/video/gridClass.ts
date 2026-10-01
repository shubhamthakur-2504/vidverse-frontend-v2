/**
 * The video grid columns.
 *
 * It fills by card width rather than by breakpoint, because the sidebar's own
 * width changes how much room the grid actually has: at 1440px it is four
 * columns beside the sidebar and five beside the rail, with no media queries
 * that would have to know about either.
 */
export const VIDEO_GRID_CLASS =
  "grid grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-x-4 gap-y-8";
