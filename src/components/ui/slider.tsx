"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// Only the player uses this, over video, so its colours are white on black
// rather than page tokens.
const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  // thumbLabel names the draggable thumb for screen readers (Radix reads the
  // label from the thumb, not from the root)
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    thumbLabel?: string;
  }
>(({ className, thumbLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none items-center select-none",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/25">
      <SliderPrimitive.Range className="absolute h-full bg-white" />
    </SliderPrimitive.Track>

    <SliderPrimitive.Thumb
      aria-label={thumbLabel}
      className="block size-3 rounded-full bg-white disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderPrimitive.Root>
));

Slider.displayName = "Slider";

export { Slider };
