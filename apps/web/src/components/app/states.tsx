import { Button } from "@lifelink/ui/components/button";
import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";
import { AlertCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

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
}) => (
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
        Try again
      </Button>
    ) : null}
  </div>
);

/** Loading keeps the final layout: flat bars at the real size, no shimmer. */
const LoadingRows = ({ label, rows = 3 }: { label: string; rows?: number }) => (
  <div
    aria-busy="true"
    aria-label={label}
    className="flex flex-col gap-3"
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- it holds block skeletons, and <output> allows only phrasing content.
    role="status"
  >
    {Array.from({ length: rows }, (_unused, index) => (
      <Skeleton className="h-16 w-full" key={index} />
    ))}
    <span className="sr-only">{label}</span>
  </div>
);

export { EmptyNote, ErrorNote, LoadingRows };
