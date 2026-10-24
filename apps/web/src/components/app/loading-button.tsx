import { buttonVariants } from "@lifelink/ui/components/button";
import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";
import type { ReactNode } from "react";

/** Let the real button typography and padding measure public action labels. */
const LoadingButton = ({
  children,
  className,
  icon = false,
  size = "sm",
  variant = "outline",
}: {
  children: ReactNode;
  className?: string;
  icon?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "outline" | "ghost";
}) => (
  <Skeleton
    className={cn(
      buttonVariants({ size, variant }),
      "bg-rule border-transparent",
      className
    )}
  >
    {icon ? <span className="invisible size-5 shrink-0" /> : null}
    <span className="invisible">{children}</span>
  </Skeleton>
);

export { LoadingButton };
