"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  InfoIcon,
  LightbulbIcon,
  ReplyIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ShieldQuestionIcon,
  TextIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { RefObject } from "react";
import { toast } from "sonner";

import { Avatar, ModePill, ReadAloudButton } from "@/components/app/bits";
import { EmptyNote } from "@/components/app/states";
import { ExplanationPanel } from "@/components/explain/explanation-panel";
import { messageOf } from "@/lib/errors";
import { formatShortDay, formatTime, formatWhen } from "@/lib/format";

import { Disclosure, ReaderSkeleton, hueFor } from "./email-bits";
import { EMPTY_REPLY, ReplyComposer } from "./reply-composer";
import type { ReplyDraft } from "./reply-composer";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const RIDE_WORDS = {
  asked: "You've asked someone for a ride.",
  confirmed: "Your ride is confirmed.",
  declined: "The ride was declined.",
  none: null,
} as const;

const REPLY_FORM_ID = "email-reply";

const scanSummaryFor = (email: Doc<"emails">): string => {
  if (email.scamCheck === undefined) {
    return "This email has not been checked yet.";
  }

  return email.suspicious
    ? "Warning signs found. Pause before acting."
    : "No warning signs found in this email’s text.";
};

const checkLinkClass = buttonVariants({
  className: "bg-raised hover:bg-raised self-start",
  size: "sm",
  variant: "outline",
});

/** The local check's result, said once, where it can't be missed. */
const ScanBanner = ({ email }: { email: Doc<"emails"> }) => {
  const scanSummary = scanSummaryFor(email);
  const checkHref = { pathname: "/scam", query: { email: email._id } };

  if (email.scamCheck !== undefined && !email.suspicious) {
    return (
      <p className="text-muted-foreground text-label flex items-start gap-2.5">
        <ShieldCheckIcon
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0"
        />
        <span>
          {scanSummary} This check can’t confirm who sent it or whether what it
          says is true.
        </span>
      </p>
    );
  }

  const pending = email.scamCheck === undefined;
  const signs = email.scamCheck?.warningCount ?? 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-x-3.5 gap-y-3 rounded-xl border p-4",
        pending
          ? "border-border bg-parchment"
          : "border-warning-edge bg-warning-wash"
      )}
    >
      {pending ? (
        <ShieldQuestionIcon
          aria-hidden="true"
          className="text-muted-foreground mt-0.5 size-6 shrink-0"
        />
      ) : (
        <TriangleAlertIcon
          aria-hidden="true"
          className="text-warning mt-0.5 size-6 shrink-0"
        />
      )}
      <div className="flex min-w-0 flex-1 basis-64 flex-col gap-0.5">
        <p className="text-body font-semibold">{scanSummary}</p>
        <p className="text-label">
          {pending
            ? "You can check it yourself now."
            : `${signs} ${signs === 1 ? "sign" : "signs"} to review.`}{" "}
          This check can’t confirm who sent it or whether what it says is true.
        </p>
      </div>
      <Link className={checkLinkClass} href={checkHref}>
        <ShieldQuestionIcon aria-hidden="true" />
        {pending ? "Check this email" : "Review the check"}
      </Link>
    </div>
  );
};

const SummaryBody = ({ email }: { email: Doc<"emails"> }) => {
  const summarize = useMutation(api.emails.summarize);
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const consentId = useId();
  const working = email.selectedForReview && email.summary === null;

  if (email.summary !== null) {
    return (
      <div aria-live="polite" className="flex flex-col gap-3">
        <p className="text-section leading-snug">{email.summary}</p>
        {email.actionNeeded ? (
          <p className="font-semibold">{email.actionNeeded}</p>
        ) : null}
        {email.suspicious ? (
          <p className="text-negative">
            This has signs of a scam. Please check it before you do anything it
            asks.
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
    );
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      {working ? <p>Reading it now…</p> : null}
      {working ? null : (
        <label
          className="hover:text-accent-foreground text-label flex min-h-12 cursor-pointer items-start gap-3 leading-relaxed transition-colors"
          htmlFor={consentId}
        >
          <input
            checked={allowCloudAnalysis}
            className="accent-primary mt-1 size-5 shrink-0"
            id={consentId}
            onChange={(event) => setAllowCloudAnalysis(event.target.checked)}
            type="checkbox"
          />
          <span>
            Send this email to a cloud AI service for a summary and to spot any
            appointment in it. Leave unchecked for a short preview made in
            LifeLink.
          </span>
        </label>
      )}
      {working ? null : (
        <Button
          className="self-start"
          onClick={async () => {
            try {
              await summarize({ allowCloudAnalysis, emailId: email._id });
            } catch (error) {
              toast.error(errorText(error));
            }
          }}
          size="sm"
        >
          {allowCloudAnalysis
            ? "Summarize with cloud AI"
            : "Show a short preview"}
        </Button>
      )}
    </div>
  );
};

const summaryNote = (email: Doc<"emails">): string => {
  if (email.summary !== null) {
    return "Ready to read";
  }

  return email.selectedForReview
    ? "Reading it now…"
    : "Get a short preview made in LifeLink, or choose cloud AI";
};

const ReaderHeader = ({
  email,
  headingRef,
  timeZone,
}: {
  email: Doc<"emails">;
  headingRef: RefObject<HTMLHeadingElement | null>;
  timeZone: string;
}) => (
  <header className="flex flex-col gap-4">
    <h2
      className="text-mobile-title sm:text-page-title leading-tight font-semibold tracking-tight outline-none"
      id="email-subject"
      ref={headingRef}
      tabIndex={-1}
    >
      {email.subject || "(No subject)"}
    </h2>
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <Avatar
        hue={hueFor(email.fromAddress)}
        name={email.fromName ?? email.fromAddress}
      />
      <p className="flex min-w-0 flex-1 basis-56 flex-col">
        <span className="text-body font-semibold">
          <span className="sr-only">From </span>
          {email.fromName ?? email.fromAddress}
        </span>
        {email.fromName ? (
          <span className="text-muted-foreground text-label">
            {email.fromAddress}
          </span>
        ) : null}
      </p>
      <p className="text-muted-foreground text-label flex flex-wrap items-center gap-2 self-start pt-0.5">
        <time
          dateTime={new Date(email.receivedAt).toISOString()}
          title={formatWhen(email.receivedAt, timeZone)}
        >
          {formatShortDay(email.receivedAt, timeZone)} ·{" "}
          {formatTime(email.receivedAt, timeZone)}
        </time>
        <ModePill mode={email.mode} />
      </p>
    </div>
  </header>
);

const AppointmentCard = ({
  appointment,
  timeZone,
}: {
  appointment: Doc<"appointments">;
  timeZone: string;
}) => {
  const ride = RIDE_WORDS[appointment.rideStatus];

  return (
    <section
      aria-labelledby="appointment-heading"
      className="bg-parchment flex flex-col gap-1 rounded-xl px-5 py-4"
    >
      <h3 className="text-body font-semibold" id="appointment-heading">
        Appointment found
      </h3>
      <p className="font-bold">{appointment.title}</p>
      <p>
        {formatWhen(appointment.startsAt, timeZone)}
        {appointment.location ? ` · ${appointment.location}` : ""}
      </p>
      <p className="text-muted-foreground text-label">
        It’s been added to Your week on your Today page.{ride ? ` ${ride}` : ""}{" "}
        <Link className="text-foreground font-semibold underline" href="/">
          Go to Today
        </Link>
      </p>
    </section>
  );
};

const CheckDisclosure = ({
  email,
  labelId,
  timeZone,
}: {
  email: Doc<"emails">;
  labelId: string;
  timeZone: string;
}) => (
  <Disclosure
    icon={<ShieldIcon />}
    labelId={labelId}
    note={
      email.scamCheck === undefined
        ? "Not checked yet · done in LifeLink"
        : `Checked ${formatShortDay(email.scamCheck.checkedAt, timeZone)} at ${formatTime(email.scamCheck.checkedAt, timeZone)} · done in LifeLink`
    }
    title={
      email.scamCheck === undefined ? "Scam check not done yet" : "Scam check"
    }
  >
    <p className="font-semibold">{scanSummaryFor(email)}</p>
    <p className="text-muted-foreground text-label">
      It uses common warning signs, not cloud AI. This check can’t confirm who
      sent it or whether what it says is true.
      {email.scamCheck === undefined
        ? " You can check it manually below."
        : ` Checked ${formatWhen(email.scamCheck.checkedAt, timeZone)}.`}
    </p>
    <Link
      className={checkLinkClass}
      href={{ pathname: "/scam", query: { email: email._id } }}
    >
      <ShieldQuestionIcon aria-hidden="true" />
      {email.scamCheck === undefined ? "Check this email" : "Review the check"}
    </Link>
  </Disclosure>
);

/** One email, shown like a mail app, with what LifeLink can do with it. */
const EmailReader = ({
  emailId,
  listStaysBeside,
  timeZone,
}: {
  emailId: Id<"emails">;
  /** True when the inbox is still showing, so focus stays on its row. */
  listStaysBeside: () => boolean;
  timeZone: string;
}) => {
  const detail = useQuery(api.emails.get, { emailId });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const explainTriggerRef = useRef<HTMLButtonElement>(null);
  const replyTriggerRef = useRef<HTMLButtonElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const [explaining, setExplaining] = useState(false);
  const [replying, setReplying] = useState(false);
  const [focusReply, setFocusReply] = useState(0);
  const [reply, setReply] = useState<ReplyDraft>(EMPTY_REPLY);
  const loadedId = detail?.email._id;
  const summaryId = useId();
  const checkId = useId();

  // When the reader replaces the inbox, land on the subject.
  const landOnSubject = useEffectEvent(() => {
    if (!listStaysBeside()) {
      headingRef.current?.focus({ preventScroll: true });
    }
  });

  useEffect(() => {
    if (loadedId !== undefined) {
      landOnSubject();
    }
  }, [loadedId]);
  useEffect(() => {
    if (focusReply > 0) {
      replyRef.current?.focus();
    }
  }, [focusReply]);

  if (detail === undefined) {
    return <ReaderSkeleton label="Loading email" />;
  }

  const { appointment, email } = detail;
  const sender = email.fromName ?? email.fromAddress;
  const hasBody = email.bodyText.trim().length > 0;

  const openReply = () => {
    setReplying(true);
    setFocusReply((count) => count + 1);
  };

  return (
    <article
      aria-labelledby="email-subject"
      className="text-foreground flex min-w-0 flex-col gap-4 wrap-anywhere"
    >
      <ReaderHeader email={email} headingRef={headingRef} timeZone={timeZone} />

      <ScanBanner email={email} />

      <div className="border-rule flex flex-wrap items-center gap-2 border-b pb-4">
        <Button
          aria-controls={replying ? REPLY_FORM_ID : undefined}
          aria-expanded={replying}
          onClick={openReply}
          ref={replyTriggerRef}
          size="sm"
        >
          <ReplyIcon aria-hidden="true" />
          Reply
        </Button>
        {hasBody ? (
          <>
            <ReadAloudButton
              label="Read aloud"
              text={`${email.subject || "No subject"}. From ${email.fromName || email.fromAddress}. ${email.bodyText}`}
            />
            <Button
              aria-controls="explanation-panel"
              aria-expanded={explaining}
              onClick={() => setExplaining(true)}
              ref={explainTriggerRef}
              size="sm"
              variant="outline"
            >
              <LightbulbIcon aria-hidden="true" />
              Help me understand
            </Button>
          </>
        ) : null}
      </div>

      <section
        aria-labelledby="body-heading"
        className="flex flex-col gap-4 pt-2"
      >
        <h3 className="sr-only" id="body-heading">
          The email
        </h3>
        {hasBody ? (
          <p className="max-w-prose leading-relaxed wrap-anywhere whitespace-pre-wrap">
            {email.bodyText}
          </p>
        ) : (
          <EmptyNote>This email has no text.</EmptyNote>
        )}
        <p className="text-muted-foreground text-label flex max-w-prose items-start gap-2.5">
          <InfoIcon
            aria-hidden="true"
            className="mt-0.5 size-[1.125rem] shrink-0"
          />
          <span>
            Links in emails aren’t opened by LifeLink. If it asks for money or
            private details, check it first.
          </span>
        </p>
      </section>

      {explaining ? (
        <ExplanationPanel
          level={3}
          onClose={() => setExplaining(false)}
          onUseReply={(suggestion) => {
            setReply({
              body: suggestion,
              fromSuggestion: true,
              notice:
                "Reply added to your draft. You can change it before reviewing.",
            });
            openReply();
          }}
          returnFocusRef={explainTriggerRef}
          source={{ emailId }}
        />
      ) : null}

      {appointment === null ? null : (
        <AppointmentCard appointment={appointment} timeZone={timeZone} />
      )}

      <div className="border-rule mt-2 border-t">
        <Disclosure
          defaultOpen={email.summary !== null || email.selectedForReview}
          icon={<TextIcon />}
          labelId={summaryId}
          note={summaryNote(email)}
          title="Summary"
        >
          <SummaryBody email={email} />
        </Disclosure>
        <CheckDisclosure email={email} labelId={checkId} timeZone={timeZone} />
      </div>

      {replying ? (
        <section aria-label="Reply" className="pt-4 pb-2">
          <ReplyComposer
            emailId={emailId}
            id={REPLY_FORM_ID}
            inputRef={replyRef}
            onChange={setReply}
            onClose={() => {
              setReplying(false);
              replyTriggerRef.current?.focus();
            }}
            provider={email.provider}
            reply={reply}
            to={sender}
          />
        </section>
      ) : null}
    </article>
  );
};

export { EmailReader };
