"use client";

import { cn } from "@lifelink/ui/lib/utils";
import { ShieldCheckIcon } from "lucide-react";

import { useMessages } from "@/i18n/locale";

/** The promise that frames every conversation: nothing goes out unseen. */
const MessagesNotice = ({ className }: { className?: string }) => {
  const t = useMessages().threads;

  return (
    <p
      className={cn(
        "bg-parchment min-h-control flex items-center gap-3 rounded-xl px-5 py-2",
        className
      )}
    >
      <ShieldCheckIcon
        aria-hidden="true"
        className="text-muted-foreground size-5 shrink-0"
      />
      {t.subline}
    </p>
  );
};

export { MessagesNotice };
