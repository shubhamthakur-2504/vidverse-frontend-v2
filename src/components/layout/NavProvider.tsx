"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import subscriptionApi from "@/lib/api/client/subscriptionApi";
import type { SubscriptionItem } from "@/lib/types/channelType";

const STORAGE_KEY = "vv:sidebar-collapsed";

// The collapse preference lives in localStorage, which is outside React, so it
// is read with useSyncExternalStore rather than copied into state in an effect.
const listeners = new Set<() => void>();
let cached: boolean | null = null;

function getCollapsed() {
  if (cached === null) {
    try {
      cached = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      cached = false; // private mode: the sidebar just starts expanded
    }
  }
  return cached;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function writeCollapsed(next: boolean) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* the preference just doesn't survive the tab */
  }
  for (const onChange of listeners) onChange();
}

type NavState = {
  /** Desktop only: the 240px sidebar shrinks to the 80px rail. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Below lg, the same navigation opens as a drawer instead. */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  /** Channels for the sidebar list. Fetched here so the sidebar and the
      drawer, which can both be mounted, share one request. */
  channels: SubscriptionItem[];
};

const NavContext = createContext<NavState | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, getCollapsed, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fetched, setFetched] = useState<SubscriptionItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    subscriptionApi
      .mySubscriptions()
      .then((response) => {
        if (!cancelled) setFetched(response.data.data.items ?? []);
      })
      .catch(() => {
        /* the sidebar simply has no channel list */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleCollapsed = useCallback(() => writeCollapsed(!cached), []);

  return (
    <NavContext.Provider
      value={{
        collapsed,
        toggleCollapsed,
        drawerOpen,
        setDrawerOpen,
        // signing out leaves the last fetch behind, so gate on the user
        channels: user ? fetched : [],
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNav must be used within a NavProvider");
  return context;
}
