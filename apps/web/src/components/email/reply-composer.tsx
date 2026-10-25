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
  dictationAvailable,
  startDictation,
} from "@/components/voice/dictation";
import { useMessages } from "@/i18n/locale";
import { useBrowserCapability } from "@/lib/browser-capability";
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
 * Reply in the same rounded composer as Ask. It only prepares a draft: the
 * person reviews it on the task page, and the draft is saved, never sent.
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
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const canDictate = useBrowserCapability(dictationAvailable);
  const [listening, setListening] = useState(false);
  const dictation = useRef<{ stop: () => void } | null>(null);
  const latest = useRef(reply);
  useEffect(() => {
    latest.current = reply;
  }, [reply]);
  const inputId = useId();
  const hintId = useId();
  const messages = useMessages();
  const t = messages.email.replyComposer;
  useEffect(() => () => dictation.current?.stop(), []);

  const toggleDictation = () => {
    if (dictation.current !== null) {
      dictation.current.stop();

      return;
    }

    const before = latest.current.body.trimEnd();
    dictation.current = startDictation(
      (spoken) => {
        onChange(
          edited(latest.current, before ? `${before} ${spoken}` : spoken)
        );
      },
      () => {
        dictation.current = null;
        setListening(false);
        inputRef.current?.focus();
      }
    );
    setListening(dictation.current !== null);
  };

  return (
    <form
      aria-labelledby={`${id}-label`}
      className="flex flex-col gap-2.5"
      id={id}
      onSubmit={async (event) => {
        event.preventDefault();
        dictation.current?.stop();
        setBusy(true);

        try {
          const taskId = await draftReply({
            body: reply.body,
            emailId,
            startedFrom: reply.fromSuggestion ? "suggestion" : undefined,
          });

          // SAFETY: the mutation just returned this task id, and /tasks/[taskId] is a real route.
          router.push(`/tasks/${taskId}` as Route);
        } catch (error) {
          toast.error(errorText(error));
          setBusy(false);
        }
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
          {canDictate ? (
            <Button
              aria-pressed={listening}
              className="rounded-full pr-4 pl-3"
              onClick={toggleDictation}
              size="sm"
              variant="outline"
            >
              {listening ? (
                <SquareIcon aria-hidden="true" />
              ) : (
                <MicIcon aria-hidden="true" />
              )}
              {listening ? t.stopListening : t.speak}
            </Button>
          ) : (
            <span />
          )}
          <Button
            aria-busy={busy}
            className={cn(
              "ml-auto rounded-full py-1.5 pr-1.5 pl-5",
              "disabled:border-transparent"
            )}
            disabled={busy || reply.body.trim().length === 0}
            type="submit"
          >
            {busy ? messages.threads.preparing : t.review}
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
        {t.nothingSent(provider === "gmail" ? "Gmail" : "Outlook")}
      </p>
    </form>
  );
};

export { EMPTY_REPLY, ReplyComposer };

export type { ReplyDraft };
