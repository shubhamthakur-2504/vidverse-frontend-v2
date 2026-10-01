"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useNav } from "@/components/layout/NavProvider";
import {
  MAIN_NAV,
  SETTINGS_NAV,
  YOU_NAV,
  isActive,
  type NavItem,
} from "@/components/layout/navItems";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const COLLAPSED_CHANNELS = 5;

const rowClass =
  "press flex h-10 items-center gap-4 rounded-md px-3 text-sm hover:bg-hover";

function Row({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          rowClass,
          active ? "bg-elevated font-medium text-fg" : "text-fg"
        )}
      >
        {/* a filled glyph means "you are here" (UI guide section 3.8) */}
        <Icon
          className="size-5 shrink-0"
          strokeWidth={1.75}
          fill={active && item.fillable ? "currentColor" : "none"}
          aria-hidden
        />
        {item.label}
      </Link>
    </li>
  );
}

function Divider() {
  return <hr className="my-3 border-0 border-t border-line" />;
}

// Not a heading: the sidebar sits before the page's own h1 in the document, so
// an h2 here would outrank it in every outline. The list below points back at
// the label instead, which gives the same grouping without the ranking.
function GroupLabel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="px-3 pb-1 text-base font-semibold text-fg">
      {children}
    </p>
  );
}

/**
 * The full navigation list. Rendered both in the fixed desktop sidebar and in
 * the drawer below lg, so it carries no positioning of its own.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { channels } = useNav();
  const [showAllChannels, setShowAllChannels] = useState(false);
  // the sidebar and the drawer can both be in the DOM, so the ids differ
  const labelId = useId();

  const visible = (items: NavItem[]) =>
    items.filter((item) => user || !item.private);

  const shown = showAllChannels
    ? channels
    : channels.slice(0, COLLAPSED_CHANNELS);

  const group = (items: NavItem[]) =>
    items.map((item) => (
      <Row
        key={item.href}
        item={item}
        active={isActive(pathname, item.href)}
        onNavigate={onNavigate}
      />
    ));

  return (
    <nav aria-label="Main" className="p-3">
      <ul>{group(visible(MAIN_NAV))}</ul>

      {user && (
        <>
          <Divider />
          <GroupLabel id={`${labelId}-you`}>You</GroupLabel>
          <ul aria-labelledby={`${labelId}-you`}>{group(YOU_NAV)}</ul>
        </>
      )}

      {channels.length > 0 && (
        <>
          <Divider />
          <GroupLabel id={`${labelId}-subs`}>Subscriptions</GroupLabel>
          <ul aria-labelledby={`${labelId}-subs`}>
            {shown.map(({ channel }) => (
              <li key={channel._id}>
                <Link
                  href={`/channel/${channel.userName}`}
                  onClick={onNavigate}
                  className={cn(rowClass, "gap-3 text-fg")}
                >
                  <Avatar className="size-6">
                    <AvatarImage src={channel.avatarUrl} alt="" />
                    <AvatarFallback className="text-[0.625rem]">
                      {channel.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{channel.fullName}</span>
                </Link>
              </li>
            ))}
            {channels.length > COLLAPSED_CHANNELS && (
              <li>
                <button
                  type="button"
                  onClick={() => setShowAllChannels((open) => !open)}
                  aria-expanded={showAllChannels}
                  className={cn(rowClass, "w-full text-fg-secondary")}
                >
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 transition-transform duration-200 ease-out",
                      showAllChannels && "rotate-180"
                    )}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {showAllChannels ? "Show fewer" : "Show all"}
                </button>
              </li>
            )}
          </ul>
        </>
      )}

      {user && (
        <>
          <Divider />
          <ul>{group(SETTINGS_NAV)}</ul>
        </>
      )}
    </nav>
  );
}
