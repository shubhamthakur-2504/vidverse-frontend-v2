import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-line-default bg-surface px-3 text-sm text-fg outline-none",
        "placeholder:text-fg-tertiary",
        "transition-colors duration-120 ease-out focus:border-brand-fg",
        "disabled:pointer-events-none disabled:opacity-60",
        "aria-invalid:border-danger",
        "file:mr-3 file:h-7 file:rounded-sm file:border-0 file:bg-elevated file:px-2 file:text-sm file:font-medium file:text-fg",
        className
      )}
      {...props}
    />
  );
}

export { Input };
