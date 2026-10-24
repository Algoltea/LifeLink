import { cn } from "@lifelink/ui/lib/utils";
import type { ReactNode } from "react";

import { Reveal } from "./reveal";

/** One measure for the whole page: equal outer margins at every width. */
const PAGE = "mx-auto w-full max-w-[69.667rem] px-[1.111rem] md:px-[2.222rem]";

/** Large section headings share one size and tracking. */
const HEADING =
  "text-[2rem] leading-[1.11] font-semibold tracking-[-0.03em] text-balance md:text-[3.556rem] md:leading-none";

/**
 * A folder tab rising from the top of a section into the one above it,
 * so the page reads as one stack of household folders.
 */
const FolderTab = ({
  children,
  className,
  tone,
}: {
  children: ReactNode;
  className?: string;
  tone: string;
}) => (
  <Reveal className={cn("absolute bottom-full", className)}>
    <span
      aria-hidden="true"
      className={cn(
        "landing-tab flex h-[1.833rem] items-center justify-center px-[2.222rem] text-[0.889rem] leading-none font-medium whitespace-nowrap md:h-[2.278rem] md:text-[1rem]",
        tone
      )}
    >
      {children}
    </span>
  </Reveal>
);

/** What a picture is, said plainly; credits for every picture are in the footer. */
const Caption = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p className={cn("text-[0.889rem] leading-[1.5]", className)}>{children}</p>
);

export { Caption, FolderTab, HEADING, PAGE };
