"use client";

import { Skeleton } from "@lifelink/ui/components/skeleton";

import { LoadingRows } from "@/components/app/states";

import { CHAT_TOP_BAR, CHAT_WORKSPACE } from "./chat-layout";
import { useChatViewport } from "./use-chat-viewport";

/** The compact chat bar also belongs to the hard-refresh loading frame. */
const ChatLoadingWorkspace = () => {
  const workspace = useChatViewport();

  return (
    <div className={CHAT_WORKSPACE} ref={workspace}>
      <header className={CHAT_TOP_BAR}>
        <h1 className="text-section min-w-0 truncate font-semibold tracking-tight">
          Ask LifeLink
        </h1>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-control w-[4.361rem] sm:w-[8.156rem]" />
          <Skeleton className="h-control w-[4.361rem] sm:w-[9.16rem]" />
        </div>
      </header>
      <LoadingRows label="Opening your conversation" layout="ask" />
    </div>
  );
};

export { ChatLoadingWorkspace };
