"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Upload } from "lucide-react";

const ITEMS = [
  { href: "/studio", label: "Content", icon: LayoutGrid, exact: true },
  { href: "/studio/upload", label: "Upload", icon: Upload, exact: false },
];

// underline tabs (UI guide section 5: tabs), active tab marked with aria-current
export function StudioNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Studio" className="flex gap-6 border-b border-line">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href || pathname.startsWith("/studio/videos")
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              active
                ? "border-fg text-fg"
                : "border-transparent text-fg-secondary hover:text-fg"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
