"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { NavProvider, useNav } from "@/components/layout/NavProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function Shell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useNav();

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-elevated px-4 py-2 text-sm font-medium text-fg shadow-menu focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AppHeader />
      <AppSidebar />
      <div
        className={cn(
          "pt-(--header-h) pb-(--mobilebar-h) md:pt-(--header-h) md:pb-0 md:pl-20",
          // moves in step with the sidebar's own width transition
          "transition-[padding] duration-200 ease-out",
          !collapsed && "lg:pl-60"
        )}
      >
        <main id="main">{children}</main>
      </div>
      <MobileTabBar />
    </>
  );
}

/** Header, sidebar and tab bar around every page except the auth screens. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <TooltipProvider>
        <Shell>{children}</Shell>
      </TooltipProvider>
    </NavProvider>
  );
}
