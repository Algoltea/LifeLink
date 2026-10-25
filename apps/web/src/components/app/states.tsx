import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { AlertCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useMessages } from "@/i18n/locale";

import { LoadingLayoutBody } from "./loading-layouts";
import type { LoadingLayout } from "./loading-layouts";
import { MessagesLoadingWorkspace } from "./messages-loading-layouts";

/** An empty section keeps its frame and says, in one sentence, what will appear here. */
const EmptyNote = ({
  action,
  children,
  className,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "border-border bg-parchment text-muted-foreground text-body flex flex-wrap items-center justify-between gap-3 rounded-lg border px-5 py-4",
      className
    )}
  >
    <p>{children}</p>
    {action}
  </div>
);

/** Errors stay inside the block that failed, with a way to try again. */
const ErrorNote = ({
  children,
  onRetry,
}: {
  children: ReactNode;
  onRetry?: () => void;
}) => {
  const t = useMessages();

  return (
    <div
      className="bg-negative-wash text-negative text-body flex flex-wrap items-center justify-between gap-3 rounded-lg px-5 py-4"
      role="alert"
    >
      <p className="flex items-center gap-2">
        <AlertCircleIcon aria-hidden="true" className="size-5 shrink-0" />
        {children}
      </p>
      {onRetry ? (
        <Button onClick={onRetry} size="sm" variant="outline">
          {t.common.tryAgain}
        </Button>
      ) : null}
    </div>
  );
};

/** Loading reserves the measured frame; only the status label is announced. */
const LoadingRows = ({
  label,
  rows = 3,
  layout = "text",
  className,
}: {
  label: string;
  rows?: number;
  layout?: LoadingLayout;
  className?: string;
}) => {
  if (layout === "thread") {
    return <MessagesLoadingWorkspace className={className} label={label} />;
  }

  // Ask and Today stretch to the screen so their composer can rest on the bottom edge.
  const fills = layout === "ask" || layout === "today";

  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={cn(
        "min-w-0",
        fills && "flex min-h-0 flex-1 flex-col",
        className
      )}
      data-loading-layout={layout}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- it holds block skeletons, and <output> allows only phrasing content.
      role="status"
    >
      <div
        aria-hidden="true"
        className={fills ? "flex min-h-0 flex-1 flex-col" : undefined}
      >
        <LoadingLayoutBody layout={layout} rows={rows} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export { EmptyNote, ErrorNote, LoadingRows };
