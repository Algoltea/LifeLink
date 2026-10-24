import { cn } from "@lifelink/ui/lib/utils";
import type { ComponentProps } from "react";

// A flat bar at the real size of what it replaces; no shimmer.
const Skeleton = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    aria-hidden="true"
    className={cn("bg-rule max-w-full rounded-md", className)}
    data-slot="skeleton"
    {...props}
  />
);

export { Skeleton };
