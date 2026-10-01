"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { MAX_QUERY_LENGTH, resultsHref } from "@/lib/search";
import { cn } from "@/lib/utils";

// Shows the current search on /results and empties the box everywhere else.
// useSearchParams needs its own Suspense boundary, or every page using the
// header opts out of static rendering.
function SyncSearchValue({ onChange }: { onChange: (value: string) => void }) {
  const pathname = usePathname();
  const q = useSearchParams().get("q");
  useEffect(() => {
    onChange(pathname === "/results" ? (q ?? "") : "");
  }, [pathname, q, onChange]);
  return null;
}

export function SearchBar({
  className,
  autoFocus = false,
  onSubmitted,
}: {
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search box, as the hint in the field advertises
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      )
        return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    // a new search starts without filters
    router.push(q ? resultsHref({ q }) : "/");
    inputRef.current?.blur();
    onSubmitted?.();
  };

  const sync = useCallback((next: string) => setValue(next), []);

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn("flex w-full max-w-160", className)}
    >
      <Suspense fallback={null}>
        <SyncSearchValue onChange={sync} />
      </Suspense>
      <div className="relative flex-1">
        <label htmlFor="site-search" className="sr-only">
          Search videos
        </label>
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          autoFocus={autoFocus}
          enterKeyHint="search"
          maxLength={MAX_QUERY_LENGTH}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search"
          className={cn(
            "h-10 w-full rounded-l-full border border-r-0 border-line-default bg-surface pr-11 pl-4.5 text-sm text-fg outline-none",
            "placeholder:text-fg-tertiary",
            "transition-colors duration-120 ease-out focus:border-brand-fg",
            // the native clear affordance would sit under our own button
            "[&::-webkit-search-cancel-button]:hidden"
          )}
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="press absolute top-1 right-1 inline-flex size-8 items-center justify-center rounded-full text-fg-tertiary hover:bg-hover hover:text-fg"
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        ) : (
          <kbd
            aria-hidden
            className="pointer-events-none absolute top-2.5 right-3 hidden rounded-sm border border-line-default px-1.5 text-xs leading-4 text-fg-tertiary lg:block"
          >
            /
          </kbd>
        )}
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="press inline-flex h-10 w-16 shrink-0 items-center justify-center rounded-r-full border border-line-default bg-elevated text-fg hover:bg-hover"
      >
        <Search className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </button>
    </form>
  );
}
