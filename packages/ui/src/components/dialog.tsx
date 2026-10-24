"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@lifelink/ui/lib/utils";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DialogProps {
  children: ReactNode;
  description?: ReactNode;
  finalFocus?: DialogPrimitive.Popup.Props["finalFocus"];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: ReactNode;
}

// Reserved for confirmations that protect focus (destructive or irreversible steps).
const Dialog = ({
  children,
  description,
  finalFocus,
  onOpenChange,
  open,
  title,
}: DialogProps) => (
  <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Popup
        finalFocus={finalFocus}
        className={cn(
          "bg-raised text-foreground fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-xl p-6 shadow-[0_16px_48px_rgb(0_0_0/0.18)]"
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

export { Dialog };
