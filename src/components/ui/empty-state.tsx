import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The one shape for "nothing here", "that failed" and "not found": an icon, a
 * title, one line of explanation and at most one action (UI guide section 5).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      <Icon
        className="size-12 text-fg-tertiary"
        strokeWidth={1.75}
        aria-hidden
      />
      <h3 className="mt-4 text-base font-semibold text-fg">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-fg-secondary">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
