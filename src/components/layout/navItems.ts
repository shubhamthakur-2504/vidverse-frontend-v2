import {
  History,
  House,
  LayoutDashboard,
  Library,
  ListVideo,
  MessageSquare,
  Rss,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Shorter wording for the 80px rail and the mobile tab bar. */
  short?: string;
  icon: LucideIcon;
  /** Hidden from signed-out visitors, who would only get bounced to login. */
  private?: boolean;
  /**
   * Whether the active state fills the glyph. Only solid-looking shapes read
   * as "on" when filled: a filled gear or list is an unreadable blob.
   */
  fillable?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: House, fillable: true },
  {
    href: "/subscriptions",
    label: "Subscriptions",
    short: "Subs",
    icon: Rss,
    private: true,
  },
  {
    href: "/community",
    label: "Community",
    icon: MessageSquare,
    fillable: true,
  },
];

export const YOU_NAV: NavItem[] = [
  { href: "/history", label: "History", icon: History, private: true },
  { href: "/playlists", label: "Playlists", icon: ListVideo, private: true },
  { href: "/studio", label: "Studio", icon: LayoutDashboard, private: true },
];

export const SETTINGS_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings, private: true },
];

/** The five slots in the phone tab bar. "Create" is injected in the middle. */
export const TAB_BAR_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: House, fillable: true },
  { href: "/subscriptions", label: "Subs", icon: Rss, private: true },
  {
    href: "/community",
    label: "Community",
    icon: MessageSquare,
    fillable: true,
  },
  { href: "/playlists", label: "Library", icon: Library, private: true },
];

/** The five slots in the 80px rail. */
export const RAIL_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: House, fillable: true },
  { href: "/subscriptions", label: "Subs", icon: Rss, private: true },
  {
    href: "/community",
    label: "Community",
    icon: MessageSquare,
    fillable: true,
  },
  { href: "/playlists", label: "Library", icon: Library, private: true },
  { href: "/studio", label: "Studio", icon: LayoutDashboard, private: true },
];

/** "/" is only active on "/" itself; the rest also match their subpages. */
export function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
