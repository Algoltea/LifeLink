"use client";

import { useSmoothText } from "@convex-dev/agent/react";
import type { UIMessage } from "@convex-dev/agent/react";
import { inboxChatSummarySchema } from "@lifelink/contracts/inbox-chat";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ReadAloudButton, useAutoReadAloud } from "@/components/app/bits";
import {
  msUntilClasped,
  syncThinkingMark,
  THINKING_CYCLE_MS,
  ThinkingMark,
} from "@/components/app/brand";
import {
  InlineActionReview,
  InlineSendAll,
  InlineTaskReview,
} from "@/components/tasks/inline-action-review";
import { useMessages } from "@/i18n/locale";

import { EmailSummaryCard } from "./email-summary-card";

const toolPartSchema = z.object({
  output: z.object({
    actionId: z.string().nullable().optional(),
    prepared: z.boolean(),
    result: z.string(),
    taskId: z.string().nullable().optional(),
  }),
  state: z.literal("output-available"),
  type: z.string().startsWith("tool-"),
});

type PreparedTool = z.infer<typeof toolPartSchema>["output"];

const preparedOf = (message: UIMessage): PreparedTool[] =>
  message.parts.flatMap((part) => {
    const parsed = toolPartSchema.safeParse(part);

    return parsed.success ? [parsed.data.output] : [];
  });

const COPIED_RESET_MS = 2000;

/** How long a sent message may wait for the reply to start streaming. */
const REPLY_START_TIMEOUT_MS = 120_000;

const AssistantText = ({ message }: { message: UIMessage }) => {
  const [visible] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });

  return (
    <p className="text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap">
      {visible}
    </p>
  );
};

/** The clock CSS animations run on, which ThinkingMark loops are pinned to. */
const documentTime = (): number =>
  Number(document.timeline.currentTime ?? performance.now());

/** Puts a ThinkingMark on the page's shared clock whenever it moves. */
const useThinkingClock = (still = false) => {
  const mark = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    if (!still) {
      syncThinkingMark(mark.current);
    }
  }, [still]);

  return mark;
};

const Thinking = () => {
  const t = useMessages().ask;
  const mark = useThinkingClock();

  return (
    <p className="text-muted-foreground flex min-h-9 items-center gap-4 text-lg">
      <span className="flex pl-1 sm:hidden">
        <ThinkingMark ref={mark} size={22} />
      </span>
      {t.thinking}
    </p>
  );
};

/**
 * LifeLink's mark beside a reply. It couples while LifeLink thinks; once the
 * reply lands it finishes its loop and holds on the next clasp, becoming the
 * logo. Replies older than one loop open already still. Hidden on phones,
 * where Thinking carries the mark.
 */
const ReplyAvatar = ({
  arrivedAt = 0,
  thinking,
}: {
  arrivedAt?: number;
  thinking: boolean;
}) => {
  const [settled, setSettled] = useState(
    () => !thinking && Date.now() - arrivedAt >= THINKING_CYCLE_MS
  );

  useEffect(() => {
    if (thinking || settled) {
      return;
    }

    const timer = setTimeout(
      () => setSettled(true),
      msUntilClasped(documentTime())
    );

    return () => clearTimeout(timer);
  }, [thinking, settled]);

  const still = settled && !thinking;
  const mark = useThinkingClock(still);

  return (
    <span className="hidden size-9 shrink-0 items-center justify-center sm:flex">
      <ThinkingMark ref={mark} size={18} still={still} />
    </span>
  );
};

/**
 * The reply action saves its message only once streaming starts, so until
 * then the person's message is last and nothing else says LifeLink is working.
 */
const useAwaitingReply = (last: UIMessage | undefined): boolean => {
  const sentAt = last?.role === "user" ? last._creationTime : null;

  // A reply that never starts must not leave the thread thinking forever.
  const [expiredFor, setExpiredFor] = useState<number | null>(() =>
    sentAt !== null && Date.now() - sentAt >= REPLY_START_TIMEOUT_MS
      ? sentAt
      : null
  );

  useEffect(() => {
    if (sentAt === null) {
      return;
    }

    const timer = setTimeout(
      () => setExpiredFor(sentAt),
      Math.max(sentAt + REPLY_START_TIMEOUT_MS - Date.now(), 0)
    );

    return () => clearTimeout(timer);
  }, [sentAt]);

  return sentAt !== null && expiredFor !== sentAt;
};

const AwaitingReply = () => (
  <li className="flex gap-4">
    <ReplyAvatar thinking />
    <div className="flex min-w-0 flex-1 flex-col sm:pt-0.5">
      <Thinking />
    </div>
  </li>
);

/** `compact` shows only the icon; the label stays for screen readers. */
const CopyButton = ({
  className,
  compact = false,
  text,
}: {
  className?: string;
  compact?: boolean;
  text: string;
}) => {
  const [copied, setCopied] = useState(false);
  const t = useMessages().ask;

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);

    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          toast(t.copyUnavailable);
        }
      }}
      size={compact ? "icon" : "sm"}
      variant="ghost"
    >
      {copied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
      <span aria-live="polite" className={compact ? "sr-only" : undefined}>
        {copied ? t.copied : t.copy}
      </span>
    </Button>
  );
};

const Bubble = ({ message }: { message: UIMessage }) => {
  const t = useMessages().ask;
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  if (message.role === "user") {
    return (
      <li className="group flex items-end justify-end gap-1 pl-10 sm:pl-16">
        {/* Revealed on hover or focus; touch screens cannot hover, so it stays. */}
        <CopyButton
          className="text-muted-foreground shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
          compact
          text={message.text}
        />
        <p className="bg-neutral-wash rounded-3xl px-5 py-3.5 text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap">
          <span className="sr-only">{t.youSaid}</span>
          {message.text}
        </p>
      </li>
    );
  }

  const prepared = preparedOf(message);

  const preparedActionIds = prepared.flatMap((tool) =>
    tool.actionId ? [tool.actionId] : []
  );

  const failed = message.status === "failed";

  const emailSummary = z
    .object({ inboxSummary: inboxChatSummarySchema })
    .safeParse(message.metadata);

  const thinking =
    (message.status === "pending" || message.status === "streaming") &&
    !message.text &&
    !emailSummary.success;

  return (
    <li className="flex gap-4">
      <ReplyAvatar arrivedAt={message._creationTime} thinking={thinking} />
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pt-0.5">
        <span className="sr-only">{t.lifeLinkSaid}</span>
        {emailSummary.success ? (
          <EmailSummaryCard summary={emailSummary.data.inboxSummary} />
        ) : null}
        {!emailSummary.success && message.text ? (
          <AssistantText message={message} />
        ) : null}
        {thinking ? <Thinking /> : null}
        {failed ? <p className="text-negative text-lg">{t.failed}</p> : null}
        {prepared.map((tool) => {
          if (tool.actionId) {
            return (
              <InlineActionReview
                actionId={tool.actionId}
                key={tool.actionId}
                onEditingChange={(value) =>
                  setEditing((current) => ({
                    ...current,
                    [tool.actionId ?? ""]: value,
                  }))
                }
              />
            );
          }

          return tool.taskId ? (
            <InlineTaskReview key={tool.taskId} taskId={tool.taskId} />
          ) : null;
        })}
        {preparedActionIds.length > 1 ? (
          <InlineSendAll
            actionIds={preparedActionIds}
            editing={preparedActionIds.some((actionId) => editing[actionId])}
          />
        ) : null}
        {message.text && message.status !== "streaming" ? (
          <div className="-ml-4 flex flex-wrap items-center gap-1">
            <ReadAloudButton text={message.text} variant="ghost" />
            <CopyButton text={message.text} />
          </div>
        ) : null}
      </div>
    </li>
  );
};

/** The person's conversation with LifeLink, streamed live from the Agent thread. */
const AssistantThread = ({
  className,
  loadMore,
  messages,
  status,
}: {
  className?: string;
  loadMore: (count: number) => void;
  messages: UIMessage[];
  status: "CanLoadMore" | "Exhausted" | "LoadingFirstPage" | "LoadingMore";
}) => {
  const latest = messages.findLast(
    (message) => message.role === "assistant" && message.status === "success"
  );

  useAutoReadAloud(latest?.text ?? null);
  const awaitingReply = useAwaitingReply(messages.at(-1));
  const t = useMessages().ask;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <Button
          aria-busy={status === "LoadingMore"}
          className="self-center"
          disabled={status === "LoadingMore"}
          onClick={() => loadMore(20)}
          variant="ghost"
        >
          {status === "LoadingMore" ? t.loadingEarlier : t.loadEarlier}
        </Button>
      ) : null}
      <ol aria-label={t.conversationLabel} className="flex flex-col gap-8">
        {messages.map((message) => (
          <Bubble key={message.key} message={message} />
        ))}
        {awaitingReply ? <AwaitingReply /> : null}
      </ol>
      <output aria-live="polite" className="sr-only">
        {latest?.text}
      </output>
    </div>
  );
};

export { AssistantThread };
