"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A panel that slides in from the edge. Used for the navigation drawer on
 * small screens, where a 240px sidebar does not fit.
 */
function Sheet({
  open,
  onOpenChange,
  title,
  side = "left",
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Announced to screen readers; pass `titleVisible` to also show it. */
  title: string;
  side?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-overlay",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 z-50 flex w-72 max-w-[85vw] flex-col bg-bg shadow-dialog",
            "duration-300 ease-out",
            side === "left"
              ? "left-0 border-r border-line data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left"
              : "right-0 border-l border-line data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
            className
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pr-2 pl-4">
            <DialogPrimitive.Title className="text-base font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="press inline-flex size-10 items-center justify-center rounded-full text-fg-secondary hover:bg-hover hover:text-fg"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { Sheet };
