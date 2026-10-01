import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content w-full rounded-md border border-line-default bg-surface px-3 py-2 text-sm text-fg outline-none",
        "placeholder:text-fg-tertiary",
        "transition-colors duration-120 ease-out focus:border-brand-fg",
        "disabled:pointer-events-none disabled:opacity-60",
        "aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
