import Link from "next/link";

import { cn } from "@/lib/utils";

export type TabItem = {
  href: string;
  label: string;
  /** Rendered after the label, e.g. a count. */
  badge?: React.ReactNode;
};

/**
 * Page-level section tabs. They are links, so the active tab lives in the URL
 * and survives reload, back and sharing (UI guide section 5).
 */
export function Tabs({
  items,
  current,
  label,
  className,
}: {
  items: TabItem[];
  /** The href of the active tab. */
  current: string;
  /** Names the tab list for screen readers, e.g. "Channel sections". */
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "no-scrollbar overflow-x-auto border-b border-line",
        className
      )}
    >
      <ul className="flex min-w-max gap-1">
        {items.map((item) => {
          const active = item.href === current;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center gap-2 px-4 text-sm font-medium",
                  "transition-colors duration-120 ease-out",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                  "after:origin-center after:transition-transform after:duration-200 after:ease-out",
                  active
                    ? "text-fg after:scale-x-100 after:bg-fg"
                    : "text-fg-secondary after:scale-x-0 after:bg-line-strong hover:text-fg hover:after:scale-x-100"
                )}
              >
                {item.label}
                {item.badge != null && (
                  <span className="text-xs text-fg-tertiary tabular-nums">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
