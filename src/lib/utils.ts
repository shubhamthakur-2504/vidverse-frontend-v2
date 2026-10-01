import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const exact = new Intl.NumberFormat("en");
const longDate = new Intl.DateTimeFormat("en", { dateStyle: "long" });

/** 1234 becomes "1.2K". For counts shown beside a noun, not in prose. */
export function formatViews(views: number): string {
  return compact.format(views);
}

/** "12,345" — for the one place a view count is spelled out, under the player. */
export function formatCount(value: number): string {
  return exact.format(value);
}

/** "1 comment" / "2 comments", for nouns that pluralise with an "s". */
export function plural(count: number, noun: string): string {
  return `${exact.format(count)} ${noun}${count === 1 ? "" : "s"}`;
}

/** The full date, for the title of a relative timestamp. */
export function formatAbsoluteDate(date: string | Date): string {
  return longDate.format(new Date(date));
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}
