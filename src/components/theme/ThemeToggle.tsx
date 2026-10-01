"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Switches between the light and dark token sets.
 *
 * Which icon to show is decided in CSS by the theme class, not by React state:
 * the server render doesn't know the theme, and a mount flag to find out would
 * flip the icon a frame after hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch between the light and dark theme"
      className={cn(
        "press inline-flex size-10 items-center justify-center rounded-full text-fg hover:bg-hover",
        className
      )}
    >
      <Sun
        className="hidden size-5 dark:block"
        strokeWidth={1.75}
        aria-hidden
      />
      <Moon className="size-5 dark:hidden" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
