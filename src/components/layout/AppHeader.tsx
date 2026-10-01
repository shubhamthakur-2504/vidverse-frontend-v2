"use client";

import Link from "next/link";
import { ArrowLeft, Menu, Play, Plus, Search } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { SearchBar } from "@/components/layout/SearchBar";
import { useNav } from "@/components/layout/NavProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-sm text-fg"
      aria-label="VidVerse home"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-brand">
        <Play className="size-3.5 fill-white text-white" aria-hidden />
      </span>
      <span className="hidden text-lg leading-6 font-semibold tracking-tight sm:block">
        VidVerse
      </span>
    </Link>
  );
}

/**
 * Sticky 56px bar. It stays still on scroll: the page beneath it moves, so
 * animating it in on every navigation would be noise, not feedback.
 */
export function AppHeader() {
  const { user } = useAuth();
  const { toggleCollapsed, collapsed, setDrawerOpen } = useNav();
  // below md the search box has no room, so it takes over the bar when opened
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-(--header-h) border-b border-line bg-(--header-bg) backdrop-blur-md">
      <div className="flex h-full items-center gap-2 px-2 sm:px-4">
        {searchOpen ? (
          <>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="press inline-flex size-10 shrink-0 items-center justify-center rounded-full text-fg hover:bg-hover md:hidden"
            >
              <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden />
            </button>
            <SearchBar autoFocus onSubmitted={() => setSearchOpen(false)} />
          </>
        ) : (
          <>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
                className="press inline-flex size-10 items-center justify-center rounded-full text-fg hover:bg-hover lg:hidden"
              >
                <Menu className="size-5" strokeWidth={1.75} aria-hidden />
              </button>
              <Tooltip label={collapsed ? "Expand menu" : "Collapse menu"}>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  aria-label={
                    collapsed ? "Expand navigation" : "Collapse navigation"
                  }
                  aria-expanded={!collapsed}
                  className="press hidden size-10 items-center justify-center rounded-full text-fg hover:bg-hover lg:inline-flex"
                >
                  <Menu className="size-5" strokeWidth={1.75} aria-hidden />
                </button>
              </Tooltip>
              <Logo />
            </div>

            <div className="hidden flex-1 justify-center md:flex">
              <SearchBar />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="press inline-flex size-10 items-center justify-center rounded-full text-fg hover:bg-hover md:hidden"
              >
                <Search className="size-5" strokeWidth={1.75} aria-hidden />
              </button>

              {user ? (
                <>
                  <Button
                    asChild
                    variant="secondary"
                    className="mr-1 hidden rounded-full sm:inline-flex"
                  >
                    <Link href="/studio/upload">
                      <Plus strokeWidth={1.75} aria-hidden />
                      Create
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-lg"
                    className="sm:hidden"
                  >
                    <Link href="/studio/upload" aria-label="Upload a video">
                      <Plus strokeWidth={1.75} aria-hidden />
                    </Link>
                  </Button>
                  <NotificationBell />
                  <ThemeToggle />
                  <AccountMenu />
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Button
                    asChild
                    variant="secondary"
                    className="ml-1 rounded-full"
                  >
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
