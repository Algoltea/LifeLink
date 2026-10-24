"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronLeftIcon, ClockIcon, ListChecksIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { Avatar, SimulatedPill } from "@/components/app/bits";
import { usePreferences } from "@/components/app/preferences";
import { LoadingRows } from "@/components/app/states";
import {
  CHAT_READING_COLUMN,
  CHAT_WORKSPACE,
} from "@/components/assistant/chat-layout";
import { useChatViewport } from "@/components/assistant/use-chat-viewport";
import { RecapPanel } from "@/components/messages/recap-panel";
import { CHANNEL_WORDS, formatAddress } from "@/components/tasks/details-view";

import { ConversationList } from "./conversation";
import { EMPTY_DRAFT, MessageComposer } from "./message-composer";
import type { MessageDraft } from "./message-composer";

type Thread = NonNullable<FunctionReturnType<typeof api.messages.thread>>;

/** How close to the end still counts as "reading the latest". */
const FOLLOW_THRESHOLD = 48;

const SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);

const EmptyConversation = ({
  contact,
  firstName,
}: {
  contact: Thread["contact"];
  firstName: string;
}) => (
  <div className="my-auto flex flex-col items-center gap-3 py-10 text-center">
    <Avatar
      hue={contact.hue}
      name={contact.name}
      size="lg"
      src={contact.avatarUrl}
    />
    <p className="text-section font-semibold tracking-tight">
      No messages with {firstName} yet
    </p>
    <p className="text-muted-foreground max-w-md text-lg">
      Write below to start. You’ll see exactly what {firstName} will get before
      anything is sent.
    </p>
  </div>
);

/** A slim chat header: back, who, how you reach them, and the recap. */
const ConversationHeader = ({
  allPractice,
  contact,
  onRecap,
  recapOpen,
  recapTriggerRef,
  subline,
}: {
  allPractice: boolean;
  contact: Thread["contact"];
  onRecap: (() => void) | null;
  recapOpen: boolean;
  recapTriggerRef: RefObject<HTMLButtonElement | null>;
  subline: string;
}) => {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <header className="border-rule flex shrink-0 items-center gap-2 border-b pb-3 sm:gap-3 sm:pb-4">
      <Link
        className={buttonVariants({
          className:
            "text-muted-foreground hover:text-foreground -ml-3 px-3 sm:pr-4 sm:pl-2",
          variant: "ghost",
        })}
        href="/messages"
      >
        <ChevronLeftIcon aria-hidden="true" className="size-6 sm:size-5" />
        <span className="sr-only sm:not-sr-only">
          <span className="sr-only">Back to </span>Messages
        </span>
      </Link>
      <Avatar
        className="size-10 text-base sm:size-12 sm:text-lg"
        hue={contact.hue}
        name={contact.name}
        src={contact.avatarUrl}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h1
          className="text-body sm:text-section truncate font-semibold tracking-tight outline-none"
          ref={heading}
          tabIndex={-1}
        >
          <span className="sr-only">Conversation with </span>
          {contact.name}
        </h1>
        <p className="text-muted-foreground text-label truncate">{subline}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {allPractice ? (
          <SimulatedPill className="hidden sm:inline-flex" />
        ) : null}
        {onRecap ? (
          <Button
            aria-controls="recap-panel"
            aria-expanded={recapOpen}
            className="px-3.5 sm:px-4"
            onClick={onRecap}
            ref={recapTriggerRef}
            size="sm"
            variant="outline"
          >
            <ListChecksIcon aria-hidden="true" />
            Recap
            <span className="sr-only lg:not-sr-only"> this conversation</span>
          </Button>
        ) : null}
      </div>
    </header>
  );
};

const ThreadWorkspace = ({ thread }: { thread: Thread }) => {
  const { me } = usePreferences();
  const workspace = useChatViewport();
  const [draft, setDraft] = useState<MessageDraft>(EMPTY_DRAFT);
  const [explaining, setExplaining] = useState<Id<"messages"> | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);
  const viewport = useRef<HTMLElement>(null);
  const followLatest = useRef(true);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const recapTriggerRef = useRef<HTMLButtonElement>(null);
  const explainTriggerRef = useRef<HTMLButtonElement>(null);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  const { contact, messages, pendingTaskIds } = thread;
  const firstName = contact.name.split(" ")[0] ?? contact.name;

  const preferred =
    contact.channels.find((channel) => channel.preferred) ??
    contact.channels[0];

  const subline = preferred
    ? `${contact.relationship} · ${CHANNEL_WORDS[preferred.channel]}${preferred.channel === "in_app" ? "" : ` to ${formatAddress(preferred.address)}`}`
    : `${contact.relationship} · No way to reach ${firstName} yet`;

  const allPractice =
    messages.length > 0 &&
    messages.every((message) => message.mode === "simulated");

  // Open at the latest message, and keep it in view as new ones arrive or
  // the workspace fits itself to the window, unless the person scrolled away.
  useEffect(() => {
    const panel = viewport.current;
    const content = panel?.firstElementChild;

    if (!panel || !content) {
      return;
    }

    const stick = (): void => {
      if (followLatest.current) {
        panel.scrollTop = panel.scrollHeight;
      }
    };

    stick();
    const observer = new ResizeObserver(stick);

    observer.observe(panel);
    observer.observe(content);

    return () => observer.disconnect();
  }, []);

  const [pendingTask] = pendingTaskIds;

  return (
    <div className={CHAT_WORKSPACE} ref={workspace}>
      <ConversationHeader
        allPractice={allPractice}
        contact={contact}
        onRecap={
          messages.length > 0
            ? () => {
                followLatest.current = false;
                setRecapOpen(true);
              }
            : null
        }
        recapOpen={recapOpen}
        recapTriggerRef={recapTriggerRef}
        subline={subline}
      />
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Scrolling by hand decides whether the view keeps following new messages. */}
      <section
        aria-labelledby="history-heading"
        className="min-h-48 flex-1 overflow-y-auto overscroll-contain px-1"
        data-chat-transcript=""
        onKeyDown={(event) => {
          if (SCROLL_KEYS.has(event.key)) {
            followLatest.current = false;
          }
        }}
        onScroll={(event) => {
          const panel = event.currentTarget;

          followLatest.current =
            panel.scrollHeight - panel.scrollTop - panel.clientHeight <
            FOLLOW_THRESHOLD;
        }}
        ref={viewport}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users must be able to scroll the conversation independently of the composer.
        tabIndex={messages.length > 0 ? 0 : undefined}
      >
        <div
          className={cn(
            CHAT_READING_COLUMN,
            "flex min-h-full flex-col gap-6 pt-2 pb-4"
          )}
        >
          <h2 className="sr-only" id="history-heading">
            Conversation with {contact.name}
          </h2>
          {recapOpen ? (
            <RecapPanel
              contactId={contact._id}
              contactName={contact.name}
              onClose={() => setRecapOpen(false)}
              returnFocusRef={recapTriggerRef}
            />
          ) : null}
          {messages.length === 0 ? (
            <EmptyConversation contact={contact} firstName={firstName} />
          ) : (
            <ConversationList
              contact={contact}
              explainTriggerRef={explainTriggerRef}
              explaining={explaining}
              messages={messages}
              onExplain={(messageId) => {
                followLatest.current = false;
                setExplaining(messageId);
              }}
              onExplainClose={() => setExplaining(null)}
              onUseReply={(suggestion) => {
                setDraft({
                  body: suggestion,
                  fromSuggestion: true,
                  notice:
                    "Reply added to your message. You can change it before reviewing.",
                });
                bodyRef.current?.focus();
              }}
              timeZone={timeZone}
            />
          )}
        </div>
      </section>
      <div className={cn(CHAT_READING_COLUMN, "flex shrink-0 flex-col gap-3")}>
        {pendingTask ? (
          <p className="bg-parchment text-label flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl py-1 pr-2 pl-4">
            <ClockIcon
              aria-hidden="true"
              className="text-muted-foreground size-5 shrink-0"
            />
            <span className="min-w-0 flex-1">
              {pendingTaskIds.length === 1
                ? `A message to ${firstName} is waiting for your approval.`
                : `${pendingTaskIds.length} messages to ${firstName} are waiting for your approval.`}
            </span>
            <Link
              className="min-h-control inline-flex items-center px-2 font-semibold underline underline-offset-4"
              // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
              href={`/tasks/${pendingTask}` as Route}
            >
              Review it
            </Link>
          </p>
        ) : null}
        <MessageComposer
          canReach={Boolean(preferred)}
          contactId={contact._id}
          draft={draft}
          firstName={firstName}
          inputRef={bodyRef}
          onDraftChange={setDraft}
          practice={Boolean(me?.profile?.demoMode)}
        />
      </div>
    </div>
  );
};

const ThreadScreen = ({ contactId }: { contactId: string }) => {
  // SAFETY: the id comes from a LifeLink link; the query checks ownership and rejects anything else.
  const thread = useQuery(api.messages.thread, {
    contactId: contactId as Id<"contacts">,
  });

  if (thread === undefined) {
    return <LoadingRows layout="thread" label="Loading conversation" />;
  }

  return <ThreadWorkspace key={thread.contact._id} thread={thread} />;
};

export { ThreadScreen };
