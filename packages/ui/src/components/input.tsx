import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@lifelink/ui/lib/utils";
import type { ComponentProps } from "react";

const Input = ({ className, ...props }: ComponentProps<"input">) => (
  <InputPrimitive
    className={cn(
      "border-control bg-raised text-foreground hover:border-foreground disabled:bg-neutral-wash aria-invalid:border-negative min-h-control w-full min-w-0 rounded-md border px-4 py-2 text-base transition-colors disabled:cursor-not-allowed",
      className
    )}
    data-slot="input"
    {...props}
  />
);

export { Input };
