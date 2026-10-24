import { cn } from "@lifelink/ui/lib/utils";
import type { ComponentProps } from "react";

// One quiet paper surface; use rules and spacing to group its contents.
const Card = ({ className, ...props }: ComponentProps<"section">) => (
  <section
    className={cn(
      "border-border bg-surface text-card-foreground flex flex-col gap-4 rounded-lg border p-5 sm:p-6",
      className
    )}
    data-slot="card"
    {...props}
  />
);

const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-wrap items-start justify-between gap-3",
      className
    )}
    data-slot="card-header"
    {...props}
  />
);

const CardTitle = ({ children, className, ...props }: ComponentProps<"h2">) => (
  <h2
    className={cn("text-foreground text-section font-semibold", className)}
    data-slot="card-title"
    {...props}
  >
    {children}
  </h2>
);

const CardDescription = ({ className, ...props }: ComponentProps<"p">) => (
  <p
    className={cn("text-muted-foreground text-base", className)}
    data-slot="card-description"
    {...props}
  />
);

const CardContent = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("flex flex-col gap-3", className)}
    data-slot="card-content"
    {...props}
  />
);

const CardFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("flex flex-wrap items-center gap-3", className)}
    data-slot="card-footer"
    {...props}
  />
);

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
