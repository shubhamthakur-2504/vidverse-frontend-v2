"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { useNav } from "@/components/layout/NavProvider";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { RAIL_NAV, isActive } from "@/components/layout/navItems";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** The 80px icon-and-label rail: five destinations, no channel list. */
function RailNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav aria-label="Main" className="px-1 py-2">
      <ul>
        {RAIL_NAV.filter((item) => user || !item.private).map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press flex h-18 flex-col items-center justify-center gap-1.5 rounded-md text-xs leading-4 font-medium hover:bg-hover",
                  active ? "text-fg" : "text-fg-secondary"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-200 ease-out",
                    active && "bg-elevated"
                  )}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={1.75}
                    fill={active ? "currentColor" : "none"}
                    aria-hidden
                  />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Fixed navigation beside the content. It is a rail from md to lg, where 240px
 * would eat the grid, and follows the collapse preference above that. Below md
 * there is no sidebar at all: the drawer and the tab bar cover it.
 */
export function AppSidebar() {
  const { collapsed, drawerOpen, setDrawerOpen } = useNav();

  return (
    <>
      <aside
        className={cn(
          "fixed bottom-0 left-0 z-30 hidden overflow-y-auto overscroll-contain border-r border-line bg-bg md:block",
          "top-(--header-h)",
          "transition-[width] duration-200 ease-out",
          collapsed ? "w-20" : "w-20 lg:w-60"
        )}
      >
        <div className={cn(collapsed ? "block" : "block lg:hidden")}>
          <RailNav />
        </div>
        {!collapsed && (
          <div className="hidden lg:block">
            <SidebarNav />
          </div>
        )}
      </aside>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen} title="VidVerse">
        <SidebarNav onNavigate={() => setDrawerOpen(false)} />
      </Sheet>
    </>
  );
}
