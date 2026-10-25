"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@lifelink/ui/lib/utils";
import { XIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface DialogProps {
  children: ReactNode;
  description?: ReactNode;
  finalFocus?: DialogPrimitive.Popup.Props["finalFocus"];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  /** "top" keeps the title still while content below it changes height. */
  placement?: "center" | "top";
  title: ReactNode;
}

interface Shown {
  children: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

// Reserved for confirmations that protect focus (destructive or irreversible steps).
const Dialog = ({
  children: liveChildren,
  description: liveDescription,
  finalFocus,
  onOpenChange,
  open,
  placement = "center",
  title: liveTitle,
}: DialogProps) => {
  // Callers often clear the subject as they close; the last open content stays for the closing fade.
  const [shown, setShown] = useState<Shown>({
    children: liveChildren,
    description: liveDescription,
    title: liveTitle,
  });

  const changed =
    shown.children !== liveChildren ||
    shown.description !== liveDescription ||
    shown.title !== liveTitle;

  if (open && changed) {
    setShown({
      children: liveChildren,
      description: liveDescription,
      title: liveTitle,
    });
  }

  const { children, description, title } = open
    ? { children: liveChildren, description: liveDescription, title: liveTitle }
    : shown;

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="motion-fade fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Popup
          finalFocus={finalFocus}
          className={cn(
            "motion-pop bg-raised text-foreground fixed left-1/2 z-50 flex w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-4 overflow-y-auto rounded-xl p-6 shadow-[0_16px_48px_rgb(0_0_0/0.18)]",
            placement === "top"
              ? "top-[10svh] max-h-[80svh]"
              : "top-1/2 max-h-[90svh] -translate-y-1/2"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <DialogPrimitive.Title className="text-section font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="hover:bg-neutral-wash size-control -m-2 inline-flex items-center justify-center rounded-md"
            >
              <XIcon className="size-6" />
            </DialogPrimitive.Close>
          </div>
          {description ? (
            <DialogPrimitive.Description className="text-muted-foreground text-base">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { Dialog };
