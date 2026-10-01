import { cn } from "@/lib/utils";

/**
 * A loading placeholder. It must match the real content's box exactly, or the
 * layout jumps when the content arrives.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden className={cn("skeleton", className)} {...props} />;
}
