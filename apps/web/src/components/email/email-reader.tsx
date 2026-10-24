"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation, useQuery } from "convex/react";
import { ShieldQuestionIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { ModePill, ReadAloudButton } from "@/components/app/bits";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { formatWhen } from "@/lib/format";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const RIDE_WORDS = {
  asked: "You've asked someone for a ride.",
  confirmed: "Your ride is confirmed.",
  declined: "The ride was declined.",
  none: null,
} as const;

const SummaryPanel = ({ emailId }: { emailId: Id<"emails"> }) => {
  const detail = useQuery(api.emails.get, { emailId });
  const summarize = useMutation(api.emails.summarize);
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const consentId = useId();

  if (detail === undefined) {
    return null;
  }

  const { email } = detail;
  const working = email.selectedForReview && email.summary === null;

  return (
    <section
      aria-labelledby="summary-heading"
      aria-live="polite"
      className="bg-surface text-foreground flex flex-col gap-3 rounded-lg px-5 py-5"
    >
      <h3 className="text-xl font-semibold" id="summary-heading">
        Summary
      </h3>
      {email.summary === null ? (
        <div className="flex flex-col gap-3">
          <p className="text-lg">
            {working
              ? "Reading it now…"
              : "Get a short local preview, or choose cloud AI for a summary and appointment details."}
          </p>
          {working ? null : (
            <label
              className="hover:text-accent-foreground flex min-h-12 cursor-pointer items-start gap-3 text-base leading-relaxed transition-colors"
              htmlFor={consentId}
            >
              <input
                checked={allowCloudAnalysis}
                className="accent-primary mt-1 size-5 shrink-0"
                id={consentId}
                onChange={(event) =>
                  setAllowCloudAnalysis(event.target.checked)
                }
                type="checkbox"
              />
              <span>
                Allow this email to be sent to the cloud AI provider for a
                summary and appointment extraction. Leave unchecked for a local
                preview.
              </span>
            </label>
          )}
          {working ? null : (
            <Button
              className="hover:text-primary-foreground self-start rounded-md whitespace-normal"
              onClick={async () => {
                try {
                  await summarize({ allowCloudAnalysis, emailId });
                } catch (error) {
                  toast.error(errorText(error));
                }
              }}
            >
              {allowCloudAnalysis
                ? "Summarize with cloud AI"
                : "Show a local preview"}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xl leading-snug">{email.summary}</p>
          {email.actionNeeded ? (
            <p className="text-lg font-semibold">{email.actionNeeded}</p>
          ) : null}
          {email.suspicious ? (
            <p className="text-negative text-lg">
              This has signs of a scam. Please check it before you do anything
              it asks.
            </p>
          ) : null}
          <ReadAloudButton
            className="self-start"
            label="Read the summary aloud"
            text={[
              email.summary,
              email.actionNeeded ?? "",
              email.suspicious ? "This has signs of a scam." : "",
            ].join(" ")}
          />
        </div>
      )}
    </section>
  );
};

const ReplyForm = ({
  emailId,
  provider,
  to,
}: {
  emailId: Id<"emails">;
  provider: "gmail" | "outlook";
  to: string;
}) => {
  const draftReply = useMutation(api.emails.draftReply);
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const inputId = useId();
  const hintId = useId();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);

        try {
          const taskId = await draftReply({ body, emailId });

          // SAFETY: the mutation just returned this task id, and /tasks/[taskId] is a real route.
          router.push(`/tasks/${taskId}` as Route);
        } catch (error) {
          toast.error(errorText(error));
          setBusy(false);
        }
      }}
    >
      <Label htmlFor={inputId}>Your reply to {to}</Label>
      <Textarea
        aria-describedby={hintId}
        id={inputId}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        value={body}
      />
      <p className="text-muted-foreground text-base" id={hintId}>
        Nothing is sent. You’ll review it first, then it’s saved as a draft in
        your {provider === "gmail" ? "Gmail" : "Outlook"}.
      </p>
      <Button
        aria-busy={busy}
        className="hover:text-primary-foreground self-start rounded-md whitespace-normal"
        disabled={busy || body.trim().length === 0}
        type="submit"
      >
        Review the draft
      </Button>
    </form>
  );
};

/** One email, shown in full, with what LifeLink can do with it. */
const EmailReader = ({
  emailId,
  timeZone,
}: {
  emailId: Id<"emails">;
  timeZone: string;
}) => {
  const detail = useQuery(api.emails.get, { emailId });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const loadedId = detail?.email._id;
  useEffect(() => {
    if (loadedId !== undefined) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [loadedId]);

  if (detail === undefined) {
    return <LoadingRows label="Loading email" rows={5} />;
  }

  const { appointment, email } = detail;
  const ride = appointment === null ? null : RIDE_WORDS[appointment.rideStatus];
  let scanSummary = "No strong warning pattern found in the available text.";

  if (email.scamCheck === undefined) {
    scanSummary = "This email has not been checked yet.";
  } else if (email.suspicious) {
    scanSummary = "Warning signs found. Pause before acting.";
  }

  return (
    <article
      aria-labelledby="email-subject"
      className="border-border bg-raised text-foreground flex min-w-0 flex-col gap-6 rounded-xl border px-5 py-6 wrap-anywhere sm:px-7"
    >
      <header className="border-rule flex flex-col gap-2 border-b pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <ModePill mode={email.mode} />
        </div>
        <h2
          className="text-2xl leading-tight font-semibold"
          id="email-subject"
          ref={headingRef}
          tabIndex={-1}
        >
          {email.subject || "(No subject)"}
        </h2>
        <p className="text-lg">
          From {email.fromName ? `${email.fromName} ` : ""}
          <span className="text-muted-foreground">
            &lt;{email.fromAddress}&gt;
          </span>
        </p>
        <p className="text-muted-foreground text-base">
          {formatWhen(email.receivedAt, timeZone)}
        </p>
      </header>

      <section
        aria-labelledby="email-check-heading"
        className="bg-surface text-foreground flex flex-col gap-3 rounded-lg p-5"
      >
        <h3 className="text-xl font-semibold" id="email-check-heading">
          {email.scamCheck === undefined
            ? "Local scam check pending"
            : "Local scam check"}
        </h3>
        <p className="text-lg font-semibold">{scanSummary}</p>
        <p className="text-muted-foreground text-base">
          This check uses common warning signs, not cloud AI. It cannot verify
          who sent the email or whether its claims are true.
          {email.scamCheck === undefined
            ? " You can check it manually below."
            : ` Checked ${formatWhen(email.scamCheck.checkedAt, timeZone)}.`}
        </p>
        <Link
          className={buttonVariants({
            className:
              "hover:bg-surface hover:text-foreground self-start rounded-md whitespace-normal",
            variant: "outline",
          })}
          href={{ pathname: "/scam", query: { email: email._id } }}
        >
          <ShieldQuestionIcon aria-hidden="true" />
          {email.scamCheck === undefined
            ? "Check this email"
            : "Review the check"}
        </Link>
      </section>

      <SummaryPanel emailId={emailId} />

      {appointment === null ? null : (
        <section
          aria-labelledby="appointment-heading"
          className="border-rule flex flex-col gap-2 border-y py-5"
        >
          <h3 className="text-xl font-semibold" id="appointment-heading">
            Appointment found
          </h3>
          <p className="text-lg font-bold">{appointment.title}</p>
          <p className="text-lg">
            {formatWhen(appointment.startsAt, timeZone)}
            {appointment.location ? ` · ${appointment.location}` : ""}
          </p>
          <p className="text-muted-foreground text-base">
            It’s in your week on Today.{ride ? ` ${ride}` : ""}{" "}
            <Link className="text-foreground font-semibold underline" href="/">
              Go to Today
            </Link>
          </p>
        </section>
      )}

      <section aria-labelledby="body-heading" className="flex flex-col gap-3">
        <h3 className="sr-only" id="body-heading">
          The email
        </h3>
        {email.bodyText.trim().length === 0 ? (
          <EmptyNote>This email has no text.</EmptyNote>
        ) : (
          <p className="max-w-prose text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap">
            {email.bodyText}
          </p>
        )}
        <p className="text-muted-foreground text-base">
          Links in emails aren’t opened by LifeLink. If it asks for money or
          private details, check it first.
        </p>
      </section>

      <section
        aria-labelledby="reply-heading"
        className="border-rule flex flex-col gap-3 border-t pt-6"
      >
        <h3 className="text-xl font-semibold" id="reply-heading">
          Reply
        </h3>
        <ReplyForm
          emailId={emailId}
          provider={email.provider}
          to={email.fromName ?? email.fromAddress}
        />
      </section>
    </article>
  );
};

export { EmailReader };
