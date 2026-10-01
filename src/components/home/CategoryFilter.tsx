"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The category bar. Chips are links, so a category is a real URL that back,
 * forward and sharing all understand.
 */
export function CategoryFilter({ categories }: { categories: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category"); // null is "All"

  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    setAtStart(element.scrollLeft <= 1);
    setAtEnd(element.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure]);

  const scrollBy = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const href = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const chips = [
    { id: null, label: "All" },
    ...categories.map((category) => ({ id: category, label: category })),
  ];

  const arrow =
    "press absolute top-1/2 z-20 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-line-default bg-elevated text-fg hover:bg-hover md:inline-flex";
  const fade = "pointer-events-none absolute inset-y-0 z-10 w-20";

  return (
    <div className="relative">
      <div
        ref={scroller}
        onScroll={measure}
        role="toolbar"
        aria-label="Categories"
        className="no-scrollbar flex items-center gap-2 overflow-x-auto"
      >
        {chips.map((chip) => {
          const selected = active === chip.id;
          return (
            <Link
              key={chip.id ?? "__all__"}
              href={href(chip.id)}
              scroll={false}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "press flex h-8 shrink-0 items-center rounded-full px-3 text-xs leading-4 font-medium",
                selected
                  ? "bg-fg text-bg"
                  : "bg-elevated text-fg hover:bg-hover"
              )}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      {!atStart && (
        <>
          <div
            aria-hidden
            className={cn(fade, "left-0 bg-linear-to-r from-bg to-transparent")}
          />
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous categories"
            className={cn(arrow, "left-0")}
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </>
      )}
      {!atEnd && (
        <>
          <div
            aria-hidden
            className={cn(
              fade,
              "right-0 bg-linear-to-l from-bg to-transparent"
            )}
          />
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="More categories"
            className={cn(arrow, "right-0")}
          >
            <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
