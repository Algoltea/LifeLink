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

import { callTime } from "./call-screening-parts";
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
  const remove = useMutation(api.callscreening.remove);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, []);

  const hasFlags = summary.flags.length > 0;

  const deleteLabel =
    summaryId === null && !saving ? "Discard summary" : "Delete summary";

  const helpMessage = summary.practice
    ? "I tried LifeLink’s practice scam call. Could we talk about what to do if a call like that happens?"
    : "I just had a phone call that I’m not sure about. Could you help me check whether it was real before I share anything or send money?";

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            className="text-mobile-title sm:text-page-title font-semibold outline-none"
            ref={title}
            tabIndex={-1}
          >
            {summary.practice ? "Practice call summary" : "Call summary"}
          </h2>
          <p className="text-muted-foreground text-body mt-2">
            {callTime(summary.durationMs)} ·{" "}
            {summary.practice
              ? "Made from the practice script."
              : "Made from captions that may have mistakes."}
          </p>
        </div>
        <Button disabled={saving} onClick={onBack} variant="outline">
          <MessageSquareIcon aria-hidden="true" />
          Check a message
        </Button>
      </div>
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
                  ? "This call had warning signs."
                  : "No warning signs were picked up."}
              </h3>
              <p className="text-body leading-relaxed">
                {hasFlags
                  ? "Do not share codes, passwords, or money. Ask someone you trust."
                  : "This does not mean the call was safe. LifeLink can miss warning signs and cannot verify who called."}
              </p>
            </div>
          </div>
          {summary.interrupted ? (
            <p className="text-warning-foreground text-body">
              The connection stopped during this check. Only the parts LifeLink
              heard were checked.
            </p>
          ) : null}
          {hasFlags ? (
            <section>
              <h3 className="text-section mb-4 font-semibold">
                What LifeLink flagged
              </h3>
              <p className="text-muted-foreground text-body mb-3">
                Times are minutes and seconds into the check. Long numbers are
                hidden.
              </p>
              <ul>
                {summary.flags.map((flag) => (
                  <li
                    className="border-rule grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border-t py-5"
                    key={flag.id}
                  >
                    <span className="text-accent-ink text-body font-semibold">
                      {callTime(flag.timeMs)}
                    </span>
                    <div className="min-w-0 space-y-2">
                      <h4 className="text-xl font-semibold">{flag.reason}</h4>
                      <blockquote className="text-body pl-3 leading-relaxed break-words">
                        “{flag.quote}”
                      </blockquote>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="text-body leading-relaxed">
            If anything felt wrong, hang up and call the person or company on a
            number you already trust.
          </p>
          <div className="border-rule flex flex-col gap-3 border-t pt-5">
            <p className="text-muted-foreground text-body">
              LifeLink keeps this short summary in Earlier checks. It does not
              keep audio or full captions.
            </p>
            {saving ? <output>Saving your summary…</output> : null}
            {saveError ? (
              <div className="text-negative text-body space-y-3" role="alert">
                <p>
                  The summary could not be saved. Keep this page open and try
                  again.
                </p>
                <Button onClick={onRetry} variant="outline">
                  Try saving again
                </Button>
              </div>
            ) : null}
            {deleteError ? (
              <p className="text-negative text-body" role="alert">
                The summary could not be deleted. Try again.
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
              {deleting ? "Deleting…" : deleteLabel}
            </Button>
            <p className="text-muted-foreground text-body">
              Deleting this summary does not delete messages you prepared or
              sent.
            </p>
          </div>
        </div>
        <aside className="flex min-w-0 flex-col gap-4">
          <h3 className="text-section font-semibold">Tell someone you trust</h3>
          <div className="border-border rounded-xl border p-5">
            <p className="text-muted-foreground text-body mb-2">
              Message to review
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
