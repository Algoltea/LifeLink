"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@lifelink/ui/lib/utils";

// State is shown by position and contrast; callers also provide a visible label.
const Switch = ({ className, ...props }: SwitchPrimitive.Root.Props) => (
  <SwitchPrimitive.Root
    className={cn(
      "border-control bg-neutral-wash hover:border-foreground data-checked:border-primary data-checked:bg-primary data-checked:hover:border-primary-hover data-checked:hover:bg-primary-hover disabled:bg-neutral-wash relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 p-0.5 transition-colors after:absolute after:-inset-2 disabled:cursor-not-allowed",
      className
    )}
    data-slot="switch"
    {...props}
  >
    <SwitchPrimitive.Thumb className="bg-foreground data-checked:bg-primary-foreground ring-control block size-6 rounded-full ring-1 transition-transform duration-150 data-checked:translate-x-6" />
  </SwitchPrimitive.Root>
);

export { Switch };
