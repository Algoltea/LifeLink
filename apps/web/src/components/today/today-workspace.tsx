"use client";

import type { ReactNode } from "react";

import { useChatViewport } from "@/components/assistant/use-chat-viewport";
import { useMessages } from "@/i18n/locale";

/** The overview can scroll independently while Ask stays at the bottom. */
const TodayWorkspace = ({
  children,
  composer,
  loading = false,
}: {
  children: ReactNode;
  composer: ReactNode;
  loading?: boolean;
}) => {
  const workspace = useChatViewport(undefined, true);
  const t = useMessages();

  return (
    <div
      className="-mb-4 flex h-[calc(100dvh-12rem)] min-h-0 flex-col pb-[max(1rem,env(safe-area-inset-bottom))] [main:has(&)]:py-4"
      data-today-workspace=""
      ref={workspace}
    >
      <section
        aria-label={t.today.title}
        className="relative -mx-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-1 focus-visible:-outline-offset-2"
        data-today-overview=""
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to scroll the overview independently of the dock.
        tabIndex={loading ? undefined : 0}
      >
        {children}
      </section>
      <div className="shrink-0 pt-4" data-today-composer="">
        {composer}
      </div>
    </div>
  );
};

export { TodayWorkspace };
