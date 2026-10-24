"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import type { CallFlag } from "@lifelink/contracts/call-screening";
import { Button } from "@lifelink/ui/components/button";
import { useMutation } from "convex/react";
import {
  AlertTriangleIcon,
  MessageSquareIcon,
  ShieldQuestionIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  callTime,
  callFlagReason,
  useCallScreeningMessages,
} from "./call-screening-parts";
import { TrustedPeople } from "./trusted-people";

interface CallSummaryValue {
  durationMs: number;
  flags: CallFlag[];
  interrupted: boolean;
  practice: boolean;
}

const CallSummary = ({
  summary,
  summaryId,
  saving = false,
  saveError = false,
  onRetry,
  onBack,
}: {
  summary: CallSummaryValue;
  summaryId: Id<"scamCallSummaries"> | null;
  saving?: boolean;
  saveError?: boolean;
  onRetry?: () => Promise<void>;
  onBack: () => void;
}) => {
  const messages = useCallScreeningMessages();
  const remove = useMutation(api.callscreening.remove);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, []);

  const hasFlags = summary.flags.length > 0;

  const deleteLabel =
    summaryId === null && !saving ? messages.discard : messages.delete;

  const helpMessage = summary.practice ? messages.practiceHelp : messages.help;

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            className="text-mobile-title sm:text-page-title font-semibold outline-none"
            ref={title}
            tabIndex={-1}
          >
            {summary.practice ? messages.practiceSummary : messages.summary}
          </h2>
          <p className="text-muted-foreground text-body mt-2">
            {callTime(summary.durationMs)} ·{" "}
            {summary.practice
              ? messages.practiceSource
              : messages.captionSource}
          </p>
        </div>
        <Button disabled={saving} onClick={onBack} variant="outline">
          <MessageSquareIcon aria-hidden="true" />
          {messages.checkMessage}
        </Button>
      </div>
      <p className="text-muted-foreground text-body">
        {messages.languageLimit}
      </p>
      <div className="grid items-start gap-9 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-7">
          <div className="flex items-start gap-4">
            {hasFlags ? (
              <AlertTriangleIcon
                aria-hidden="true"
                className="text-negative size-14 shrink-0"
              />
            ) : (
              <ShieldQuestionIcon
                aria-hidden="true"
                className="text-muted-foreground size-14 shrink-0"
              />
            )}
            <div className="flex flex-col gap-3">
              <h3 className="text-section font-semibold">
                {hasFlags
                  ? messages.summaryWarnings
                  : messages.summaryNoWarnings}
              </h3>
              <p className="text-body leading-relaxed">
                {hasFlags ? messages.protect : messages.notSafe}
              </p>
            </div>
          </div>
          {summary.interrupted ? (
            <p className="text-warning-foreground text-body">
              {messages.interrupted}
            </p>
          ) : null}
          {hasFlags ? (
            <section>
              <h3 className="text-section mb-4 font-semibold">
                {messages.flagged}
              </h3>
              <p className="text-muted-foreground text-body mb-3">
                {messages.times}
              </p>
              <ul>
                {summary.flags.map((flag) => (
                  <li
                    className="border-rule border-messages grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 py-5"
                    key={flag.id}
                  >
                    <span className="text-accent-ink text-body font-semibold">
                      {callTime(flag.timeMs)}
                    </span>
                    <div className="min-w-0 space-y-2">
                      <h4 className="text-xl font-semibold">
                        {callFlagReason(flag.reason, messages)}
                      </h4>
                      <blockquote className="text-body pl-3 leading-relaxed break-words">
                        “{flag.quote}”
                      </blockquote>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="text-body leading-relaxed">{messages.callback}</p>
          <div className="border-rule border-messages flex flex-col gap-3 pt-5">
            <p className="text-muted-foreground text-body">
              {messages.summaryStorage}
            </p>
            {saving ? <output>{messages.saving}</output> : null}
            {saveError ? (
              <div className="text-negative text-body space-y-3" role="alert">
                <p>{messages.saveError}</p>
                <Button onClick={onRetry} variant="outline">
                  {messages.retrySave}
                </Button>
              </div>
            ) : null}
            {deleteError ? (
              <p className="text-negative text-body" role="alert">
                {messages.deleteError}
              </p>
            ) : null}
            <Button
              className="self-start"
              disabled={saving || deleting}
              onClick={async () => {
                if (summaryId === null) {
                  onBack();

                  return;
                }

                setDeleting(true);
                setDeleteError(false);

                try {
                  await remove({ summaryId });
                  onBack();
                } catch {
                  setDeleteError(true);
                  setDeleting(false);
                }
              }}
              variant="ghost"
            >
              <Trash2Icon aria-hidden="true" />
              {deleting ? messages.deleting : deleteLabel}
            </Button>
            <p className="text-muted-foreground text-body">
              {messages.deleteNotice}
            </p>
          </div>
        </div>
        <aside className="flex min-w-0 flex-col gap-4">
          <h3 className="text-section font-semibold">{messages.tellTrusted}</h3>
          <div className="border-border rounded-xl border p-5">
            <p className="text-muted-foreground text-body mb-2">
              {messages.messageReview}
            </p>
            <p className="text-body leading-relaxed">{helpMessage}</p>
          </div>
          <TrustedPeople message={helpMessage} />
        </aside>
      </div>
    </section>
  );
};

export { CallSummary };
