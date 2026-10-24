import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@lifelink/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

// Every size keeps at least a 48px target; older hands and tremor need room.
const buttonVariants = cva(
  "disabled:border-border disabled:bg-neutral-wash disabled:text-muted-foreground inline-flex max-w-full min-w-0 shrink-0 items-center justify-center gap-2 rounded-md border border-transparent py-2 font-medium whitespace-normal transition-[background-color,border-color,color] duration-150 select-none disabled:cursor-not-allowed aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "text-label min-h-control px-6",
        icon: "size-control",
        lg: "min-h-control-lg px-8 text-lg",
        sm: "text-label min-h-control px-4",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        destructive:
          "border-negative/40 bg-negative-wash text-negative hover:border-negative",
        ghost:
          "text-foreground hover:bg-neutral-wash hover:text-foreground active:bg-rule",
        link: "text-accent-foreground min-h-control px-1 underline hover:no-underline",
        outline:
          "border-control bg-raised text-foreground hover:border-foreground hover:bg-parchment active:bg-neutral-wash",
        secondary: "bg-neutral-wash text-foreground hover:bg-rule",
      },
    },
  }
);

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

const Button = ({ className, size, variant, ...props }: ButtonProps) => (
  <ButtonPrimitive
    className={cn(buttonVariants({ className, size, variant }))}
    data-slot="button"
    {...props}
  />
);

export { Button, buttonVariants };

export type { ButtonProps };
