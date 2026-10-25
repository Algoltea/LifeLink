"use client";

import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import {
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  CircleHelpIcon,
  ImageIcon,
  LightbulbIcon,
  LoaderCircleIcon,
  PencilLineIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode, RefObject } from "react";

import { Avatar, ModePill, ReadAloudButton } from "@/components/app/bits";
import { ExplanationPanel } from "@/components/explain/explanation-panel";
import { useLocale, useMessages } from "@/i18n/locale";
import { formatWhen } from "@/lib/format";

import { conversationItems } from "./message-bits";
import type { ConversationItem, Message } from "./message-bits";

const STATUS_ICONS: Record<Message["status"], ReactNode> = {
  delivered: <CheckCheckIcon aria-hidden="true" className="size-4" />,
  draft: <PencilLineIcon aria-hidden="true" className="size-4" />,
  failed: <CircleAlertIcon aria-hidden="true" className="size-4" />,
  read: <CheckCheckIcon aria-hidden="true" className="size-4" />,
  received: null,
  sending: (
    <LoaderCircleIcon
      aria-hidden="true"
      className="size-4 motion-safe:animate-spin"
    />
  ),
  sent: <CheckIcon aria-hidden="true" className="size-4" />,
  unknown: <CircleHelpIcon aria-hidden="true" className="size-4" />,
};

const STATUS_TONE: Partial<Record<Message["status"], string>> = {
  failed: "text-negative font-medium",
  unknown: "text-warning font-medium",
};

const PhotoCount = ({ count }: { count: number }) => {
  const t = useMessages();

  return count > 0 ? (
    <p className="text-muted-foreground text-label mt-2 flex items-center gap-2">
      <ImageIcon aria-hidden="true" className="size-[1.125rem] shrink-0" />
      {t.threads.photoCount(count)}
    </p>
  ) : null;
};

const BubbleText = ({ body }: { body: string }) =>
  body.trim().length > 0 ? (
    <p className="wrap-anywhere whitespace-pre-wrap">{body}</p>
  ) : null;

const Outgoing = ({
  item,
  showMode,
  timeZone,
}: {
  item: ConversationItem;
  showMode: boolean;
  timeZone: string;
}) => {
  const { message } = item;
  const t = useMessages().threads;
  const locale = useLocale();
  const troubled = message.status === "failed" || message.status === "unknown";

  return (
    <div className="flex flex-col items-end gap-1.5 pl-10 sm:pl-24">
      <div className="bg-neutral-wash max-w-full rounded-[1.222rem] px-4 py-3 text-lg sm:rounded-[1.333rem] sm:px-5 sm:py-3.5">
        <span className="sr-only">
          {t.srYou(formatWhen(message.createdAt, timeZone, locale))}
        </span>
        <BubbleText body={message.body} />
        <PhotoCount count={message.photoIds.length} />
      </div>
      {item.showStatus || showMode ? (
        <p
          className={cn(
            "text-muted-foreground text-label flex flex-wrap items-center justify-end gap-x-2 gap-y-1 pr-3",
            STATUS_TONE[message.status]
          )}
        >
          {showMode ? <ModePill mode={message.mode} /> : null}
          {item.showStatus ? (
            <span className="inline-flex items-center gap-1.5">
              {STATUS_ICONS[message.status]}
              {t.status[message.status]}
            </span>
          ) : null}
        </p>
      ) : null}
      {message.taskId && troubled ? (
        <Link
          className="text-label min-h-control inline-flex items-center pr-3 font-semibold underline underline-offset-4"
          // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
          href={`/tasks/${message.taskId}` as Route}
        >
          {t.seeWhatHappened}
        </Link>
      ) : null}
    </div>
  );
};

const Incoming = ({
  contact,
  explaining,
  item,
  onExplain,
  showMode,
  timeZone,
}: {
  contact: { avatarUrl: string | null; hue: number; name: string };
  explaining: boolean;
  item: ConversationItem;
  onExplain: (trigger: HTMLButtonElement) => void;
  showMode: boolean;
  timeZone: string;
}) => {
  const { message } = item;
  const firstName = contact.name.split(" ")[0] ?? contact.name;
  const hasText = message.body.trim().length > 0;
  const t = useMessages().threads;
  const locale = useLocale();

  return (
    <div className="flex gap-3">
      <span className="hidden w-9 shrink-0 sm:block">
        {item.groupStart ? (
          <Avatar
            className="size-[2rem]"
            hue={contact.hue}
            name={contact.name}
            size="sm"
            src={contact.avatarUrl}
          />
        ) : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        {/* The gap on the far side lives on the bubble, so the actions below can use the full width. */}
        <div className="border-border bg-raised contrast:border-control max-w-[calc(100%-2rem)] rounded-[1.222rem] border px-4 py-3 text-lg sm:max-w-[calc(100%-6rem)] sm:rounded-[1.333rem] sm:px-5 sm:py-3.5">
          <span className="sr-only">
            {t.srThem(
              firstName,
              formatWhen(message.createdAt, timeZone, locale)
            )}
          </span>
          <BubbleText body={message.body} />
          <PhotoCount count={message.photoIds.length} />
        </div>
        {showMode ? (
          <span className="pl-3">
            <ModePill mode={message.mode} />
          </span>
        ) : null}
        {hasText && (item.showReadAloud || item.showExplain) ? (
          <div className="-ml-1 flex flex-wrap items-center gap-1">
            {item.showReadAloud ? (
              <ReadAloudButton
                className="px-2 text-[0.889rem] sm:px-3"
                text={message.body}
                variant="ghost"
              />
            ) : null}
            {item.showExplain ? (
              <Button
                aria-controls="explanation-panel"
                aria-expanded={explaining}
                className="px-2 text-[0.889rem] whitespace-normal sm:px-3"
                onClick={(event) => onExplain(event.currentTarget)}
                size="sm"
                variant="ghost"
              >
                <LightbulbIcon aria-hidden="true" />
                {t.helpMeUnderstand}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * The conversation the way chat apps show it: your words on the right, theirs
 * on the left, a quiet time line after each pause. "Help me understand" opens
 * right under the message it explains.
 */
const ConversationList = ({
  contact,
  explaining,
  explainTriggerRef,
  messages,
  onExplain,
  onExplainClose,
  onUseReply,
  timeZone,
}: {
  contact: { avatarUrl: string | null; hue: number; name: string };
  explaining: Id<"messages"> | null;
  explainTriggerRef: RefObject<HTMLButtonElement | null>;
  messages: Message[];
  onExplain: (messageId: Id<"messages">) => void;
  onExplainClose: () => void;
  onUseReply: (suggestion: string) => void;
  timeZone: string;
}) => {
  const locale = useLocale();
  const items = conversationItems(messages, timeZone, undefined, locale);
  const modes = new Set(messages.map((message) => message.mode));
  // Practice is marked once in the header; only a mixed conversation needs it per message.
  const mixed = modes.size > 1;

  return (
    <ol aria-live="polite" className="flex flex-col">
      {items.map((item, index) => (
        <li
          className={cn(
            "flex flex-col",
            index > 0 && (item.groupStart ? "mt-5" : "mt-1.5")
          )}
          key={item.message._id}
        >
          {item.divider ? (
            <p
              className={cn(
                "text-muted-foreground text-label pb-3 text-center",
                index > 0 && "pt-3"
              )}
            >
              {item.divider}
            </p>
          ) : null}
          {item.message.direction === "incoming" ? (
            <Incoming
              contact={contact}
              explaining={explaining === item.message._id}
              item={item}
              onExplain={(trigger) => {
                explainTriggerRef.current = trigger;
                onExplain(item.message._id);
              }}
              showMode={mixed && item.message.mode === "simulated"}
              timeZone={timeZone}
            />
          ) : (
            <Outgoing
              item={item}
              showMode={mixed && item.message.mode === "simulated"}
              timeZone={timeZone}
            />
          )}
          {explaining === item.message._id ? (
            <div className="mt-3 sm:pl-12">
              <ExplanationPanel
                key={explaining}
                onClose={onExplainClose}
                onUseReply={onUseReply}
                returnFocusRef={explainTriggerRef}
                source={{ messageId: explaining }}
              />
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
};

export { ConversationList };
