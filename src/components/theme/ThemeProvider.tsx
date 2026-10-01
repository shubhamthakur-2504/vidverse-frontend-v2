"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

// next-themes writes `light` or `dark` on <html> from a blocking script in the
// head, so the first paint already has the right tokens.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
