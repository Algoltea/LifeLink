"use client";

import { useSmoothText } from "@convex-dev/agent/react";
import type { UIMessage } from "@convex-dev/agent/react";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { z } from "zod";

import { ReadAloudButton, useAutoReadAloud } from "@/components/app/bits";
import { BrandMark } from "@/components/app/brand";
import {
  InlineActionReview,
  InlineTaskReview,
} from "@/components/tasks/inline-action-review";

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

const Bubble = ({ message }: { message: UIMessage }) => {
  if (message.role === "user") {
    return (
      <li className="flex justify-end">
        <p className="bg-surface max-w-[36rem] rounded-2xl rounded-br-md px-5 py-4 text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap">
          <span className="sr-only">You said: </span>
          {message.text}
        </p>
      </li>
    );
  }

  const prepared = preparedOf(message);
  const failed = message.status === "failed";

  return (
    <li className="flex gap-3 sm:gap-4">
      <span className="hidden shrink-0 pt-1 sm:block">
        <BrandMark size={28} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="sr-only">LifeLink said: </span>
        {message.text ? <AssistantText message={message} /> : null}
        {message.status === "pending" && !message.text ? (
          <p className="text-muted-foreground text-lg">Thinking…</p>
        ) : null}
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
          <ReadAloudButton className="self-start" text={message.text} />
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
        className="flex flex-col gap-6"
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
