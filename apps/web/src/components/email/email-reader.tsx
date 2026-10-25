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
import { currentMessages, useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import {
  emailCheckNotice,
  emailWarningIntro,
  emailWarningSign,
  hasEmailWarning,
} from "@/lib/email-warning";
import { messageOf } from "@/lib/errors";
import { formatShortDay, formatTime, formatWhen } from "@/lib/format";

import { Disclosure, ReaderSkeleton, hueFor } from "./email-bits";
import { EMPTY_REPLY, ReplyComposer } from "./reply-composer";
import type { ReplyDraft } from "./reply-composer";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const REPLY_FORM_ID = "email-reply";

const scanSummaryFor = (email: Doc<"emails">, t: Messages["email"]): string => {
  if (hasEmailWarning(email)) {
    return t.warningSignsFound;
  }

  if (email.scamCheck === undefined) {
    return t.notCheckedEmail;
  }

  return t.noSigns;
};

const checkLinkClass = buttonVariants({
  className: "bg-raised hover:bg-raised self-start",
  size: "sm",
  variant: "outline",
});

/** The saved check's result and limits, where they can't be missed. */
const ScanBanner = ({
  email,
  warningSigns,
}: {
  email: Doc<"emails">;
  warningSigns: string[];
}) => {
  const locale = useLocale();
  const t = useMessages().email;
  const scanSummary = scanSummaryFor(email, t);
  const checkNotice = emailCheckNotice(email, locale);
  const checkHref = { pathname: "/scam", query: { email: email._id } };

  if (email.scamCheck !== undefined && !hasEmailWarning(email)) {
    return (
      <p className="text-muted-foreground text-label flex items-start gap-2.5">
        <ShieldQuestionIcon
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0"
        />
        <span>
          {scanSummary} {checkNotice}
        </span>
      </p>
    );
  }

  const pending = email.scamCheck === undefined && !hasEmailWarning(email);

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
        {pending ? <p className="text-body">{t.checkFirst}</p> : null}
        {!pending && warningSigns.length > 0 ? (
          <ul className="text-body mt-2 flex list-disc flex-col gap-1 pl-5">
            {warningSigns.map((sign) => (
              <li key={sign}>{emailWarningSign(email, sign, locale)}</li>
            ))}
          </ul>
        ) : null}
        {!pending && warningSigns.length === 0 ? (
          <p className="text-body">{t.concern}</p>
        ) : null}
        {checkNotice ? <p className="text-body mt-2">{checkNotice}</p> : null}
      </div>
      <Link
        className={buttonVariants({ className: "self-start", size: "sm" })}
        href={checkHref}
      >
        <ShieldQuestionIcon aria-hidden="true" />
        {pending ? t.checkThis : t.whatShouldIDo}
      </Link>
    </div>
  );
};

const SummaryBody = ({
  email,
  warningSigns,
}: {
  email: Doc<"emails">;
  warningSigns: string[];
}) => {
  const summarize = useMutation(api.emails.summarize);
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const consentId = useId();
  const locale = useLocale();
  const t = useMessages().email;
  const working = email.selectedForReview && email.summary === null;

  if (email.summary !== null) {
    return (
      <div aria-live="polite" className="flex flex-col gap-3">
        <p className="text-body leading-relaxed">{email.summary}</p>
        {email.actionNeeded ? (
          <p className="font-semibold">{email.actionNeeded}</p>
        ) : null}
        {hasEmailWarning(email) ? (
          <p className="text-negative">{t.scamSigns}</p>
        ) : null}
        <ReadAloudButton
          className="self-start"
          label={t.readSummary}
          text={[
            emailWarningIntro(email, warningSigns, locale),
            t.summarySpoken,
            email.summary,
            email.actionNeeded ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    );
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      {working ? <p>{t.readingNow}</p> : null}
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
          <span>{t.cloudConsent}</span>
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
          {allowCloudAnalysis ? t.summarizeCloud : t.preview}
        </Button>
      )}
    </div>
  );
};

const summaryNote = (email: Doc<"emails">, t: Messages["email"]): string => {
  if (email.summary !== null) {
    return t.readyToRead;
  }

  return email.selectedForReview ? t.readingNow : t.summaryNote;
};

const ReaderHeader = ({
  email,
  headingRef,
  timeZone,
}: {
  email: Doc<"emails">;
  headingRef: RefObject<HTMLHeadingElement | null>;
  timeZone: string;
}) => {
  const locale = useLocale();
  const t = useMessages().email;

  return (
    <header className="flex flex-col gap-4">
      <h2
        className="text-mobile-title sm:text-page-title leading-tight font-semibold tracking-tight outline-none"
        id="email-subject"
        ref={headingRef}
        tabIndex={-1}
      >
        {email.subject || t.noSubject}
      </h2>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
        <Avatar
          hue={hueFor(email.fromAddress)}
          name={email.fromName ?? email.fromAddress}
        />
        <p className="flex min-w-0 flex-1 basis-56 flex-col">
          <span className="text-body font-semibold">
            <span className="sr-only">{t.from}</span>
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
            title={formatWhen(email.receivedAt, timeZone, locale)}
          >
            {formatShortDay(email.receivedAt, timeZone, locale)} ·{" "}
            {formatTime(email.receivedAt, timeZone, locale)}
          </time>
          <ModePill mode={email.mode} />
        </p>
      </div>
    </header>
  );
};

const AppointmentCard = ({
  appointment,
  timeZone,
}: {
  appointment: Doc<"appointments">;
  timeZone: string;
}) => {
  const locale = useLocale();
  const messages = useMessages();
  const t = messages.email;

  const ride =
    appointment.rideStatus === "none" ? null : t.ride[appointment.rideStatus];

  return (
    <section
      aria-labelledby="appointment-heading"
      className="bg-parchment flex flex-col gap-1 rounded-xl px-5 py-4"
    >
      <h3 className="text-body font-semibold" id="appointment-heading">
        {t.appointmentFound}
      </h3>
      <p className="font-bold">{appointment.title}</p>
      <p>
        {formatWhen(appointment.startsAt, timeZone, locale)}
        {appointment.location ? ` · ${appointment.location}` : ""}
      </p>
      <p className="text-muted-foreground text-label">
        {t.appointmentAdded}
        {ride ? ` ${ride}` : ""}{" "}
        <Link className="text-foreground font-semibold underline" href="/">
          {messages.errors.goToToday}
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
}) => {
  const locale = useLocale();
  const words = useMessages();
  const t = words.email;

  return (
    <Disclosure
      icon={<ShieldIcon />}
      labelId={labelId}
      note={
        email.scamCheck === undefined
          ? t.notCheckedNote
          : t.checked(
              words.format.at(
                formatShortDay(email.scamCheck.checkedAt, timeZone, locale),
                formatTime(email.scamCheck.checkedAt, timeZone, locale)
              )
            )
      }
      title={email.scamCheck === undefined ? t.scamCheckNotDone : t.scamCheck}
    >
      <p className="font-semibold">{scanSummaryFor(email, t)}</p>
      <p className="text-muted-foreground text-label">
        {emailCheckNotice(email, locale) || t.checksAutomatic}
        {email.scamCheck === undefined
          ? t.checkManually
          : t.checkedAt(
              formatWhen(email.scamCheck.checkedAt, timeZone, locale)
            )}
      </p>
      <Link
        className={checkLinkClass}
        href={{ pathname: "/scam", query: { email: email._id } }}
      >
        <ShieldQuestionIcon aria-hidden="true" />
        {email.scamCheck === undefined ? t.checkThis : t.whatShouldIDo}
      </Link>
    </Disclosure>
  );
};

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
  const locale = useLocale();
  const messages = useMessages();
  const t = messages.email;

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
    return <ReaderSkeleton label={t.loadingEmail} />;
  }

  const { appointment, email, warningSigns } = detail;
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

      <ScanBanner email={email} warningSigns={warningSigns} />

      <div className="border-rule flex flex-wrap items-center gap-2 border-b pb-4">
        <Button
          aria-controls={replying ? REPLY_FORM_ID : undefined}
          aria-expanded={replying}
          onClick={openReply}
          ref={replyTriggerRef}
          size="sm"
          variant={hasEmailWarning(email) ? "outline" : "default"}
        >
          <ReplyIcon aria-hidden="true" />
          {t.reply}
        </Button>
        {hasBody ? (
          <>
            <ReadAloudButton
              label={messages.common.readAloud}
              text={[
                emailWarningIntro(email, warningSigns, locale),
                t.nowTheEmail,
                t.spokenFrom(
                  email.subject || t.noSubjectSpoken,
                  email.fromName || email.fromAddress,
                  email.bodyText
                ),
              ]
                .filter(Boolean)
                .join(" ")}
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
              {t.helpMeUnderstand}
            </Button>
          </>
        ) : null}
      </div>

      <section
        aria-labelledby="body-heading"
        className="flex flex-col gap-4 pt-2"
      >
        <h3 className="sr-only" id="body-heading">
          {t.theEmail}
        </h3>
        {hasBody ? (
          <p className="max-w-prose leading-relaxed wrap-anywhere whitespace-pre-wrap">
            {email.bodyText}
          </p>
        ) : (
          <EmptyNote>{t.noText}</EmptyNote>
        )}
        <p className="text-muted-foreground text-label flex max-w-prose items-start gap-2.5">
          <InfoIcon
            aria-hidden="true"
            className="mt-0.5 size-[1.125rem] shrink-0"
          />
          <span>{t.linksNotOpened}</span>
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
                "Reply added to your message. You can change it before reviewing.",
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
          note={summaryNote(email, t)}
          title={t.summary}
        >
          <SummaryBody email={email} warningSigns={warningSigns} />
        </Disclosure>
        <CheckDisclosure email={email} labelId={checkId} timeZone={timeZone} />
      </div>

      {replying ? (
        <section aria-label={t.reply} className="pt-4 pb-2">
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
