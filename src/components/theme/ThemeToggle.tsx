"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Switches between the light and dark token sets. Before hydration we don't know
 * which one is active, so the button renders disabled at the same size rather
 * than guessing an icon and swapping it a moment later.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const base = cn(
    "press inline-flex size-10 items-center justify-center rounded-full text-fg hover:bg-hover",
    className
  );

  if (!mounted) {
    return <span className={base} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        isDark ? "Switch to the light theme" : "Switch to the dark theme"
      }
      title={isDark ? "Light theme" : "Dark theme"}
      className={base}
    >
      {isDark ? (
        <Sun className="size-5" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="size-5" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
