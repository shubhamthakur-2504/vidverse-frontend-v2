import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Variants follow docs/UI_DESIGN_GUIDE.md section 5. There is one `primary` per
// view; everything else is secondary, ghost or a link.
const buttonVariants = cva(
  "press relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-hover",
        secondary:
          "border border-line-default bg-elevated text-fg hover:border-line-strong hover:bg-hover",
        ghost: "text-fg hover:bg-hover",
        // "Subscribe", and nothing else: the one control that outranks the accent
        inverse: "bg-fg text-bg hover:opacity-90",
        destructive: "bg-danger-bg text-white hover:opacity-90",
        link: "h-auto rounded-sm px-0 text-brand-fg hover:underline",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-[15px]",
        icon: "size-9 rounded-full px-0",
        "icon-sm": "size-8 rounded-full px-0",
        "icon-lg": "size-10 rounded-full px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Swaps the content for a spinner without changing the button's width. */
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && !asChild ? (
        <>
          {/* the label stays in the flow so the button keeps its width */}
          <span className="invisible contents">{children}</span>
          <Loader2 className="absolute animate-spin" aria-hidden />
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
