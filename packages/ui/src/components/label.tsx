import { cn } from "@lifelink/ui/lib/utils";
import type { ComponentProps } from "react";

const Label = ({ className, ...props }: ComponentProps<"label">) => (
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- callers pass htmlFor or wrap the control.
  <label
    className={cn("text-foreground text-label font-medium", className)}
    data-slot="label"
    {...props}
  />
);

export { Label };
