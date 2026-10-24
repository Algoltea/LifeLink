import { cn } from "@lifelink/ui/lib/utils";
import type { ComponentProps } from "react";

const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => (
  <textarea
    className={cn(
      "border-control bg-raised text-foreground hover:border-foreground disabled:bg-neutral-wash aria-invalid:border-negative field-sizing-content min-h-28 w-full resize-y rounded-md border px-4 py-3 text-base transition-colors disabled:cursor-not-allowed",
      className
    )}
    data-slot="textarea"
    {...props}
  />
);

export { Textarea };
