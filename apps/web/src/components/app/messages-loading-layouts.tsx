"use client";

import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";

import { useChatViewport } from "@/components/assistant/use-chat-viewport";
import {
  MESSAGES_DOCK,
  MESSAGES_HEADER,
  MESSAGES_READING_COLUMN,
  MESSAGES_TRANSCRIPT,
  MESSAGES_WORKSPACE,
} from "@/components/messages/chat-layout";

import { LoadingButton } from "./loading-button";
import { PageHeader } from "./page-header";

const MessageLine = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex h-[1.556rem] max-w-full min-w-0 items-center",
      className
    )}
  >
    <Skeleton className="h-4 w-full" />
  </div>
);

const MessagesLoadingHeader = () => (
  <PageHeader
    actions={
      <LoadingButton icon size="default">
        Add a person
      </LoadingButton>
    }
    subline="Write to the people in your trusted circle. You see every message before it’s sent."
    title="Messages"
  />
);

const MessagesLoadingRows = ({ rows }: { rows: number }) => (
  <div
    className="flex max-w-[42.667rem] flex-col gap-1"
    data-loading-part="message-rows"
  >
    {Array.from({ length: rows }, (_unused, index) => (
      <div
        className="flex min-w-0 items-center gap-3.5 rounded-lg px-3 py-3.5"
        key={index}
      >
        <Skeleton className="size-[2.667rem] shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-3">
            <MessageLine className="w-3/5" />
            <MessageLine className="h-[1.167rem] w-16" />
          </div>
          <MessageLine className="h-[1.333rem]" />
        </div>
      </div>
    ))}
  </div>
);

const MessagesLoadingTranscript = () => (
  <div className={cn(MESSAGES_READING_COLUMN, "flex min-h-full flex-col pb-4")}>
    <div className="flex h-[2.083rem] justify-center pb-3">
      <MessageLine className="h-6 w-32" />
    </div>
    <div className="flex flex-col items-end gap-1.5 pl-10 sm:pl-24">
      <div className="bg-neutral-wash w-4/5 rounded-[1.222rem] px-4 py-3 sm:rounded-[1.333rem] sm:px-5 sm:py-3.5">
        <MessageLine />
        <MessageLine className="w-3/4" />
      </div>
      <MessageLine className="h-[1.333rem] w-24" />
    </div>
    <div className="mt-5 flex gap-3">
      <Skeleton className="hidden size-[2rem] shrink-0 rounded-full sm:block" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <div className="border-border bg-raised w-4/5 max-w-[calc(100%-2rem)] rounded-[1.222rem] border px-4 py-3 sm:max-w-[calc(100%-6rem)] sm:rounded-[1.333rem] sm:px-5 sm:py-3.5">
          <MessageLine />
        </div>
        <div className="-ml-1 flex flex-wrap items-center gap-1">
          <LoadingButton
            className="px-2 text-[0.889rem] sm:px-3"
            icon
            variant="ghost"
          >
            Read aloud
          </LoadingButton>
          <LoadingButton
            className="px-2 text-[0.889rem] sm:px-3"
            icon
            variant="ghost"
          >
            Help me understand
          </LoadingButton>
        </div>
      </div>
    </div>
  </div>
);

const MessagesLoadingComposer = () => (
  <div
    className={cn(
      MESSAGES_READING_COLUMN,
      "@container/composer flex shrink-0 flex-col gap-2.5"
    )}
    data-chat-composer=""
    data-loading-part="message-composer"
  >
    <div className="border-border bg-raised flex flex-col gap-1.5 rounded-[1.333rem] border py-2.5 pr-2.5 pl-4 sm:gap-2 sm:py-3 sm:pr-3 sm:pl-5">
      <MessageLine className="h-[1.778rem]" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LoadingButton className="-ml-2 rounded-full pr-4 pl-3" icon>
          Add a photo
        </LoadingButton>
        <Skeleton className="text-label min-h-control ml-auto inline-flex items-center justify-center gap-2 rounded-full border border-transparent py-1 pr-1.5 pl-4 font-medium sm:pl-5">
          <span className="invisible">
            Review
            <span className="hidden @md/composer:inline"> before sending</span>
          </span>
          <span className="invisible size-8 shrink-0" />
        </Skeleton>
      </div>
    </div>
    <div className="text-label relative text-center">
      <p className="invisible">Practice: nothing will be sent to them.</p>
      <Skeleton className="absolute inset-x-0 top-1 mx-auto h-3.5 w-3/4" />
    </div>
  </div>
);

/** A block status root stays directly in main so the shared viewport fitter sees its gutters. */
const MessagesLoadingWorkspace = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => {
  const workspace = useChatViewport(undefined, true);

  return (
    <div
      aria-busy="true"
      className={cn(
        MESSAGES_WORKSPACE,
        "h-[calc(100dvh-10.444rem)] min-[640px]:h-[calc(100dvh-8rem)] min-[1101px]:h-[calc(100dvh-4.444rem)]",
        className
      )}
      data-loading-layout="thread"
      ref={workspace}
    >
      <output className="sr-only">{label}</output>
      <header aria-hidden="true" className={MESSAGES_HEADER}>
        <Skeleton className="min-h-control min-w-control inline-flex items-center gap-2 border border-transparent px-2 py-2 text-[0.889rem] font-medium sm:pr-4">
          <span className="invisible size-6 shrink-0 sm:size-5" />
          <span className="invisible hidden sm:inline">Messages</span>
        </Skeleton>
        <Skeleton className="size-[2.222rem] shrink-0 rounded-full sm:size-[2.667rem]" />
        <div className="min-w-0 flex-1">
          <MessageLine className="w-3/4 sm:h-[1.778rem]" />
          <MessageLine className="h-[1.333rem]" />
        </div>
        <LoadingButton className="px-3 text-[0.889rem] sm:px-4" icon>
          Recap<span className="hidden lg:inline"> this conversation</span>
        </LoadingButton>
      </header>
      <section
        aria-hidden="true"
        className={cn(MESSAGES_TRANSCRIPT, "overflow-hidden")}
        data-chat-transcript=""
      >
        <MessagesLoadingTranscript />
      </section>
      <div aria-hidden="true" className={MESSAGES_DOCK} data-chat-dock="">
        <MessagesLoadingComposer />
      </div>
    </div>
  );
};

/** This occupies only the existing recap card's body, without adding another frame. */
const RecapLoadingBody = () => (
  <div className="flex flex-col gap-4">
    <div className="relative text-lg">
      <p className="invisible">
        LifeLink can sum up what you and your family agreed, what was only
        offered, and what is still open.
      </p>
      <Skeleton className="absolute inset-x-0 top-1 h-4" />
      <Skeleton className="absolute bottom-1 left-0 h-4 w-3/4" />
    </div>
    <div className="flex flex-col gap-3">
      <div className="relative text-base">
        <p className="invisible">
          In Practice mode, LifeLink makes the recap itself. Practice messages
          are never sent to an AI provider.
        </p>
        <Skeleton className="absolute inset-x-0 top-1 h-4" />
        <Skeleton className="absolute bottom-1 left-0 h-4 w-3/4" />
      </div>
      <LoadingButton className="self-start" size="default">
        Recap this conversation
      </LoadingButton>
    </div>
  </div>
);

export {
  MessagesLoadingHeader,
  MessagesLoadingRows,
  MessagesLoadingTranscript,
  MessagesLoadingWorkspace,
  RecapLoadingBody,
};
