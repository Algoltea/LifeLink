"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation } from "convex/react";
import { ArrowUpIcon, MicIcon, SquareIcon, XIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { RefObject } from "react";
import { toast } from "sonner";

import {
  useLiveConfigured,
  useVoiceTyping,
} from "@/components/voice/voice-typing";
import { useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

interface ReplyDraft {
  body: string;
  fromSuggestion: boolean;
  notice: string;
}

const EMPTY_REPLY: ReplyDraft = { body: "", fromSuggestion: false, notice: "" };

/** Typed or spoken words keep the suggestion mark only while some text remains. */
const edited = (reply: ReplyDraft, body: string): ReplyDraft => ({
  body,
  fromSuggestion: reply.fromSuggestion && body.trim().length > 0,
  notice: reply.notice,
});

/**
 * Reply in the same rounded composer as Ask. It only prepares the reply: the
 * person reviews it on the task page, and nothing reaches the mailbox until
 * they approve. Then it is sent in the same conversation, or saved as a draft.
 */
const ReplyComposer = ({
  emailId,
  id,
  inputRef,
  onChange,
  onClose,
  provider,
  reply,
  to,
}: {
  emailId: Id<"emails">;
  id: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (reply: ReplyDraft) => void;
  onClose: () => void;
  provider: "gmail" | "outlook";
  reply: ReplyDraft;
  to: string;
}) => {
  const draftReply = useMutation(api.emails.draftReply);
  const sendReply = useMutation(api.emails.sendReply);
  const router = useRouter();
  const [pending, setPending] = useState<"draft" | "send" | null>(null);
  const busy = pending !== null;
  const configured = useLiveConfigured();
  // The words typed before Speak was pressed; spoken words follow them.
  const before = useRef("");
  const latest = useRef(reply);
  useEffect(() => {
    latest.current = reply;
  }, [reply]);
  const inputId = useId();
  const hintId = useId();
  const messages = useMessages();
  const t = messages.email.replyComposer;

  const voice = useVoiceTyping((spoken) => {
    onChange(
      edited(
        latest.current,
        before.current ? `${before.current} ${spoken}` : spoken
      )
    );
  });

  const prepare = async (delivery: "draft" | "send") => {
    voice.stop();
    setPending(delivery);

    try {
      const request = {
        body: reply.body,
        emailId,
        startedFrom: reply.fromSuggestion ? ("suggestion" as const) : undefined,
      };

      const taskId =
        delivery === "send"
          ? await sendReply(request)
          : await draftReply(request);

      // SAFETY: the mutation just returned this task id, and /tasks/[taskId] is a real route.
      router.push(`/tasks/${taskId}` as Route);
    } catch (error) {
      toast.error(errorText(error));
      setPending(null);
    }
  };

  const empty = reply.body.trim().length === 0;
  const mailbox = provider === "gmail" ? "Gmail" : "Outlook";

  return (
    <form
      aria-labelledby={`${id}-label`}
      className="flex flex-col gap-2.5"
      id={id}
      onSubmit={async (event) => {
        event.preventDefault();
        await prepare("send");
      }}
    >
      <div className="border-border bg-raised focus-within:outline-ring contrast:border-control flex flex-col gap-2 rounded-[1.444rem] border py-3 pr-3 pl-5 shadow-[0_1px_2px_rgb(45_33_24/0.04),0_8px_24px_rgb(45_33_24/0.06)] focus-within:outline-3 focus-within:outline-offset-3">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-label font-semibold"
            htmlFor={inputId}
            id={`${id}-label`}
          >
            {t.replyTo(to)}
          </label>
          <Button
            className="text-muted-foreground rounded-full px-3"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <XIcon aria-hidden="true" />
            {messages.common.close}
          </Button>
        </div>
        <textarea
          aria-describedby={hintId}
          className="text-body placeholder:text-muted-foreground field-sizing-content min-h-24 w-full resize-none bg-transparent outline-none"
          id={inputId}
          onChange={(event) => onChange(edited(reply, event.target.value))}
          placeholder={t.placeholder}
          ref={inputRef}
          rows={3}
          value={reply.body}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {configured ? (
            <Button
              aria-pressed={voice.listening}
              className="rounded-full pr-4 pl-3"
              disabled={busy || !voice.available}
              onClick={() => {
                if (!voice.listening) {
                  before.current = latest.current.body.trimEnd();
                }

                voice.toggle();
              }}
              size="sm"
              variant="outline"
            >
              {voice.listening ? (
                <SquareIcon aria-hidden="true" />
              ) : (
                <MicIcon aria-hidden="true" />
              )}
              {voice.listening ? t.stopListening : t.speak}
            </Button>
          ) : (
            <span />
          )}
          <Button
            aria-busy={pending === "draft"}
            className="ml-auto rounded-full px-4"
            disabled={busy || empty}
            onClick={async () => {
              await prepare("draft");
            }}
            size="sm"
            variant="outline"
          >
            {pending === "draft" ? messages.threads.preparing : t.saveDraft}
          </Button>
          <Button
            aria-busy={pending === "send"}
            className={cn(
              "rounded-full py-1.5 pr-1.5 pl-5",
              "disabled:border-transparent"
            )}
            disabled={busy || empty}
            type="submit"
          >
            {pending === "send" ? messages.threads.preparing : t.review}
            <span
              aria-hidden="true"
              className="bg-primary-foreground/20 flex size-9 items-center justify-center rounded-full"
            >
              <ArrowUpIcon className="size-[1.125rem]" />
            </span>
          </Button>
        </div>
      </div>
      <output aria-live="polite" className="text-label empty:hidden">
        {reply.notice}
      </output>
      <p className="text-muted-foreground text-label text-center" id={hintId}>
        {t.nothingSent(mailbox)}
      </p>
    </form>
  );
};

export { EMPTY_REPLY, ReplyComposer };

export type { ReplyDraft };
