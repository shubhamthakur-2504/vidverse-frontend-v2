"use client";

import Link from "next/link";
import {
  History,
  LayoutDashboard,
  ListVideo,
  LogOut,
  Rss,
  Settings,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/studio", label: "Studio", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: Rss },
  { href: "/history", label: "History", icon: History },
  { href: "/playlists", label: "Your playlists", icon: ListVideo },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AccountMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="press inline-flex size-10 items-center justify-center rounded-full"
        >
          <Avatar className="size-8">
            <AvatarImage src={user.avatarUrl} alt="" />
            <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar className="size-10">
            <AvatarImage src={user.avatarUrl} alt="" />
            <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-fg-tertiary">
              @{user.userName}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/channel/${user.userName}`}>
            <UserRound aria-hidden />
            Your channel
          </Link>
        </DropdownMenuItem>
        {LINKS.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}>
              <Icon aria-hidden />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
