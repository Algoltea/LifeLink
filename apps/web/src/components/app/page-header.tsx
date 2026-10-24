"use client";

import { cn } from "@lifelink/ui/lib/utils";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * The screen's one h1, focused after navigation so screen reader and keyboard
 * users land at the top of the new screen.
 */
const PageHeader = ({
  actions,
  className,
  greeting: _greeting,
  subline,
  title,
}: {
  actions?: ReactNode;
  className?: string;
  greeting?: boolean;
  subline?: ReactNode;
  title: ReactNode;
}) => {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div className="flex max-w-3xl min-w-0 flex-col gap-2">
        <h1
          className="text-mobile-title sm:text-page-title font-semibold tracking-tight outline-none"
          ref={heading}
          tabIndex={-1}
        >
          {title}
        </h1>
        {subline ? (
          <div className="text-muted-foreground text-body">{subline}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
};

export { PageHeader };
