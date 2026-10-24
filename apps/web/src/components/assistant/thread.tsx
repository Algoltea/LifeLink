"use client";

import { useSmoothText } from "@convex-dev/agent/react";
import type { UIMessage } from "@convex-dev/agent/react";
import { inboxChatSummarySchema } from "@lifelink/contracts/inbox-chat";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ReadAloudButton, useAutoReadAloud } from "@/components/app/bits";
import { BrandMark } from "@/components/app/brand";
import {
  InlineActionReview,
  InlineTaskReview,
} from "@/components/tasks/inline-action-review";

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

const Thinking = () => (
  <p className="text-muted-foreground flex min-h-9 items-center gap-3 text-lg">
    <span aria-hidden="true" className="flex gap-1.5">
      <span className="bg-primary size-2 rounded-full motion-safe:animate-pulse" />
      <span className="bg-primary/60 size-2 rounded-full [animation-delay:150ms] motion-safe:animate-pulse" />
      <span className="bg-primary/30 size-2 rounded-full [animation-delay:300ms] motion-safe:animate-pulse" />
    </span>
    Thinking…
  </p>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);

    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          toast(
            "Copying isn't available here. You can select the text instead."
          );
        }
      }}
      size="sm"
      variant="ghost"
    >
      {copied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
};

const Bubble = ({ message }: { message: UIMessage }) => {
  if (message.role === "user") {
    return (
      <li className="flex justify-end pl-10 sm:pl-16">
        <p className="bg-neutral-wash rounded-3xl px-5 py-3.5 text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap">
          <span className="sr-only">You said: </span>
          {message.text}
        </p>
      </li>
    );
  }

  const prepared = preparedOf(message);
  const failed = message.status === "failed";

  const emailSummary = z
    .object({ inboxSummary: inboxChatSummarySchema })
    .safeParse(message.metadata);

  return (
    <li className="flex gap-4">
      <span className="border-border bg-parchment hidden size-9 shrink-0 items-center justify-center rounded-full border sm:flex">
        <BrandMark size={14} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pt-0.5">
        <span className="sr-only">LifeLink said: </span>
        {emailSummary.success ? (
          <EmailSummaryCard summary={emailSummary.data.inboxSummary} />
        ) : null}
        {!emailSummary.success && message.text ? (
          <AssistantText message={message} />
        ) : null}
        {message.status === "pending" && !message.text ? <Thinking /> : null}
        {failed ? (
          <p className="text-negative text-lg">
            That reply didn’t finish. Please ask again.
          </p>
        ) : null}
        {prepared.map((tool) => {
          if (tool.actionId) {
            return (
              <InlineActionReview
                actionId={tool.actionId}
                key={tool.actionId}
              />
            );
          }

          return tool.taskId ? (
            <InlineTaskReview key={tool.taskId} taskId={tool.taskId} />
          ) : null;
        })}
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
          {status === "LoadingMore"
            ? "Loading earlier messages…"
            : "Show earlier messages"}
        </Button>
      ) : null}
      <ol
        aria-label="Conversation with LifeLink"
        className="flex flex-col gap-8"
      >
        {messages.map((message) => (
          <Bubble key={message.key} message={message} />
        ))}
      </ol>
      <output aria-live="polite" className="sr-only">
        {latest?.text}
      </output>
    </div>
  );
};

export { AssistantThread };
