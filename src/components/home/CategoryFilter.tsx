"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CategoryFilterProps {
  categories: string[]; // actual categories from DB
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const active = searchParams.get("category"); // null = "All"

  const handleSelect = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("category", id);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Build tab list: "All" first, then real categories
  const tabs = [
    { id: null, label: "All" },
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  return (
    <div className="relative">
      {/* Fade edges for scroll hint */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-0.5">
        {tabs.map((tab, i) => {
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id ?? "__all__"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => handleSelect(tab.id)}
              className={`relative category-pill flex-shrink-0 ${isActive ? "active" : ""}`}
            >
              {tab.id === null && (
                <Sparkles
                  className={`h-3.5 w-3.5 ${isActive ? "text-violet-300" : "text-white/30"}`}
                />
              )}
              {tab.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
