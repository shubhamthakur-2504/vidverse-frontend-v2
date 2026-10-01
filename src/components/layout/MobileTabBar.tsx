"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { TAB_BAR_NAV, isActive } from "@/components/layout/navItems";
import { cn } from "@/lib/utils";

/**
 * The phone navigation. It replaces the sidebar below md, where a rail would
 * take a third of the width.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = TAB_BAR_NAV.filter((item) => user || !item.private);
  // Create sits in the middle, which only works with an odd number of slots
  const middle = Math.ceil(items.length / 2);

  const link = (item: (typeof items)[number]) => {
    const active = isActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 text-xs leading-4",
          active ? "font-semibold text-fg" : "font-medium text-fg-secondary"
        )}
      >
        <span
          className={cn(
            "flex h-7.5 w-13 items-center justify-center rounded-full transition-colors duration-200 ease-out",
            active && "bg-elevated"
          )}
        >
          <Icon
            className="size-5.5"
            strokeWidth={1.75}
            fill={active && item.fillable ? "currentColor" : "none"}
            aria-hidden
          />
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid h-(--mobilebar-h) auto-cols-fr grid-flow-col border-t border-line bg-(--header-bg) pb-1 backdrop-blur-md md:hidden"
    >
      {items.slice(0, middle).map(link)}
      {user && (
        <Link
          href="/studio/upload"
          aria-label="Upload a video"
          className="flex items-center justify-center"
        >
          <span className="press flex h-8 w-11 items-center justify-center rounded-full bg-brand text-white">
            <Plus className="size-5.5" strokeWidth={2} aria-hidden />
          </span>
        </Link>
      )}
      {items.slice(middle).map(link)}
    </nav>
  );
}
