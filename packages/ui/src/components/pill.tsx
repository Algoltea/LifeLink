import { cn } from "@lifelink/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const pillVariants = cva(
  "inline-flex flex-none items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium whitespace-nowrap",
  {
    defaultVariants: { tone: "neutral" },
    variants: {
      tone: {
        accent: "bg-accent text-accent-foreground",
        negative: "bg-negative-wash text-negative",
        neutral: "bg-neutral-wash text-neutral-ink",
        positive: "bg-positive-wash text-positive",
        simulated:
          "border-simulated bg-simulated-wash text-simulated border border-dashed",
        warning: "border-warning-edge bg-warning-wash text-warning border",
      },
    },
  }
);

type PillProps = ComponentProps<"span"> & VariantProps<typeof pillVariants>;

const Pill = ({ className, tone, ...props }: PillProps) => (
  <span
    className={cn(pillVariants({ className, tone }))}
    data-slot="pill"
    {...props}
  />
);

export { Pill, pillVariants };
