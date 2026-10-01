import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs leading-4 font-medium [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-elevated text-fg-secondary",
        brand: "bg-brand-subtle text-brand-fg",
        success: "bg-elevated text-success",
        warning: "bg-elevated text-warning",
        danger: "bg-elevated text-danger",
        /* over a thumbnail or the player, where the page tokens don't apply */
        media: "bg-black/80 text-white tabular-nums",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
