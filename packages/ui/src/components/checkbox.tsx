"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "@lifelink/ui/lib/utils";
import { CheckIcon } from "lucide-react";

const Checkbox = ({ className, ...props }: CheckboxPrimitive.Root.Props) => (
  <CheckboxPrimitive.Root
    className={cn(
      "border-control bg-raised data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground disabled:border-control disabled:bg-neutral-wash disabled:text-muted-foreground relative flex size-7 shrink-0 items-center justify-center rounded-sm border-2 transition-colors after:absolute after:-inset-2.5 disabled:cursor-not-allowed",
      className
    )}
    data-slot="checkbox"
    {...props}
  >
    <CheckboxPrimitive.Indicator className="grid place-content-center [&>svg]:size-5">
      <CheckIcon strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export { Checkbox };
