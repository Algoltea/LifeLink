"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { Pill } from "@lifelink/ui/components/pill";
import { Textarea } from "@lifelink/ui/components/textarea";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ImageIcon,
  MailIcon,
  ShieldCheckIcon,
  TextIcon,
} from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { LoadingRows } from "@/components/app/states";
import { currentMessages, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { CallHistory, CallScreening } from "./call-screening";
import { PhotoInput, photoError } from "./photo-input";
import { ScamResult, verdictOf } from "./scam-result";
import type { Review } from "./scam-result";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type Source = "email" | "screenshot" | "text";

const SOURCES = [
  { icon: TextIcon, value: "text" },
  { icon: ImageIcon, value: "screenshot" },
  { icon: MailIcon, value: "email" },
] as const;

interface EmailChoice {
  fromAddress: string;
  fromName: string | null;
  id: Id<"emails">;
  mode: "live" | "simulated";
  subject: string;
}

const EmailPicker = ({
  disabled,
  emails,
  onChange,
  selected,
}: {
  disabled: boolean;
  emails: EmailChoice[] | undefined;
  onChange: (emailId: string) => void;
  selected: EmailChoice | null;
}) => {
  const id = useId();
  const t = useMessages().scam;

  if (emails === undefined) {
    return <LoadingRows label={t.loadingEmails} layout="checks" rows={2} />;
  }

  if (emails.length === 0) {
    return (
      <p className="text-lg">
        {t.noRecentEmails}
        <Link
          className="inline-flex min-h-12 items-center font-semibold underline"
          href="/email"
        >
          {t.openEmail}
        </Link>
        {t.noRecentEmailsRest}
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Label htmlFor={id}>{t.chooseEmail}</Label>
      <select
        className="border-control bg-raised text-foreground min-h-control text-body w-full min-w-0 rounded-md border px-4"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={selected?.id ?? ""}
      >
        <option value="">{t.chooseRecent}</option>
        {emails.map((email) => (
          <option key={email.id} value={email.id}>
            {email.fromName ?? email.fromAddress} ·{" "}
            {email.subject || t.noSubject}
          </option>
        ))}
      </select>
      {selected ? (
        <div className="border-rule flex flex-col gap-1 border-b py-3 wrap-anywhere">
          <p className="text-muted-foreground text-label">
            {t.from(selected.fromName ?? selected.fromAddress)}
          </p>
          <p className="text-body font-semibold">
            {selected.subject || t.noSubject}
          </p>
        </div>
      ) : null}
    </div>
  );
};

const photoAvailability = (
  practice: boolean,
  loaded: boolean,
  configured: boolean
): string | null => {
  const t = currentMessages().scam.photo;

  if (practice) {
    return t.practice;
  }

  if (!loaded) {
    return t.availabilityChecking;
  }

  if (!configured) {
    return t.unavailable;
  }

  return null;
};

const useCheckAvailability = () => {
  const { me } = usePreferences();
  const integrations = useQuery(api.status.integrations);
  const practice = me?.profile?.demoMode === true;
  const profileLoaded = me !== undefined;

  const configured =
    integrations?.integrations.some(
      (item) => item.id === "openrouter" && item.configured
    ) === true;

  return {
    cloudAvailable: profileLoaded && !practice && configured,
    practice,
    profileLoaded,
    unavailable: photoAvailability(
      practice,
      profileLoaded && integrations !== undefined,
      configured
    ),
  };
};

const formReady = ({
  source,
  file,
  unavailable,
  text,
  email,
  profileLoaded,
}: {
  source: Source;
  file: File | null;
  unavailable: string | null;
  text: string;
  email: EmailChoice | null;
  profileLoaded: boolean;
}): boolean => {
  if (source === "screenshot") {
    return file !== null && photoError(file) === null && unavailable === null;
  }

  return (
    profileLoaded &&
    (source === "email" ? email !== null : text.trim().length > 0)
  );
};

const submitLabel = (
  source: Source,
  busy: boolean,
  t: Messages["scam"]
): string => {
  if (busy) {
    return source === "screenshot" ? t.uploading : t.checkingMessage;
  }

  return t.submit[source];
};

const CheckPrivacyNote = ({
  cloudAvailable,
  email,
  practice,
  source,
}: {
  cloudAvailable: boolean;
  email: EmailChoice | null;
  practice: boolean;
  source: Source;
}) => {
  const t = useMessages().scam;

  if (source === "email" && email?.mode === "simulated") {
    return (
      <p className="text-muted-foreground text-label">{t.practiceEmailNote}</p>
    );
  }

  if (cloudAvailable) {
    return <p className="text-muted-foreground text-label">{t.cloudNote}</p>;
  }

  if (source === "screenshot") {
    return null;
  }

  return (
    <p className="text-muted-foreground text-label">
      {practice ? t.practiceNote : t.localNote}
    </p>
  );
};

/** Manual checks use AI by default; Practice and unavailable services use local rules. */
const CheckForm = ({
  active,
  email,
  emails,
  initialSource,
  onStarted,
}: {
  active: boolean;
  email: EmailChoice | null;
  emails: EmailChoice[] | undefined;
  initialSource: Source;
  onStarted: (reviewId: Id<"scamReviews">) => void;
}) => {
  const { cloudAvailable, practice, profileLoaded, unavailable } =
    useCheckAvailability();

  const submit = useMutation(api.scam.submit);
  const submitPhoto = useAction(api.scam.submitPhoto);
  const [source, setSource] = useState(initialSource);

  const [chosenEmailId, setChosenEmailId] = useState<string | null>(
    email?.id ?? null
  );

  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const textId = useId();
  const noteId = useId();
  const sourceName = useId();
  const guidanceId = useId();
  const photo = source === "screenshot";
  const selected = emails?.find((item) => item.id === chosenEmailId) ?? null;
  const t = useMessages().scam;

  const ready = formReady({
    email: selected,
    file,
    profileLoaded,
    source,
    text,
    unavailable,
  });

  const changeSource = (next: Source) => {
    setSource(next);
    setFormError(null);
  };

  const start = async (): Promise<Id<"scamReviews">> => {
    if (photo && file !== null) {
      // Both the UI and the server reject unavailable photo checks before storage.
      if (unavailable !== null) {
        throw new Error(t.photo.unavailableType);
      }

      const problem = photoError(file);

      if (problem) {
        throw new Error(problem);
      }

      return await submitPhoto({
        allowCloudAnalysis: true,
        contentType: file.type,
        photo: await file.arrayBuffer(),
        text: note.trim() || null,
      });
    }

    return await submit({
      allowCloudAnalysis: cloudAvailable,
      emailId: source === "email" ? (selected?.id ?? null) : null,
      screenshotId: null,
      text: source === "text" ? text : null,
    });
  };

  return (
    <form
      className="flex min-w-0 flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();

        if (inFlight.current || !ready) {
          return;
        }

        inFlight.current = true;
        setBusy(true);
        setFormError(null);

        try {
          onStarted(await start());
          setText("");
          setNote("");
          setFile(null);
        } catch (error) {
          setFormError(errorText(error));
        }

        setBusy(false);
        inFlight.current = false;
      }}
    >
      <fieldset className="min-w-0" disabled={busy} id="message-check-sources">
        <legend className="sr-only">{t.howToShow}</legend>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((option) => (
            <label
              className={cn(
                "border-control has-focus-visible:outline-ring text-label min-h-control flex min-w-0 flex-1 basis-24 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 has-focus-visible:outline-3 has-focus-visible:outline-offset-2",
                source === option.value
                  ? "border-primary bg-neutral-wash text-primary font-semibold"
                  : "bg-background hover:bg-parchment font-medium"
              )}
              key={option.value}
            >
              <input
                checked={source === option.value}
                className="sr-only"
                name={sourceName}
                onChange={() => changeSource(option.value)}
                type="radio"
                value={option.value}
              />
              <option.icon aria-hidden="true" className="size-5 shrink-0" />
              {t.sources[option.value]}
            </label>
          ))}
        </div>
      </fieldset>
      {source === "email" ? (
        <EmailPicker
          disabled={busy}
          emails={emails}
          onChange={(id) => {
            setChosenEmailId(id);
            setFormError(null);
          }}
          selected={selected}
        />
      ) : null}
      {source === "text" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={textId}>{t.messageWords}</Label>
          <Textarea
            className="text-lg"
            disabled={busy}
            id={textId}
            maxLength={8000}
            onChange={(event) => {
              setText(event.target.value);
            }}
            placeholder={t.messageWordsPlaceholder}
            ref={textRef}
            rows={6}
            value={text}
          />
        </div>
      ) : null}
      {photo ? (
        <>
          <PhotoInput
            active={active}
            disabled={busy}
            file={file}
            onFile={(next) => {
              setFile(next);
              setFormError(null);
            }}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor={noteId}>{t.addNote}</Label>
            <Textarea
              className="text-body min-h-20"
              disabled={busy}
              id={noteId}
              maxLength={8000}
              onChange={(event) => {
                setNote(event.target.value);
              }}
              placeholder={t.addNotePlaceholder}
              rows={2}
              value={note}
            />
          </div>
          {unavailable ? (
            <p className="text-warning text-label" id={guidanceId}>
              {unavailable}
            </p>
          ) : null}
        </>
      ) : null}
      <CheckPrivacyNote
        cloudAvailable={cloudAvailable}
        email={selected}
        practice={practice}
        source={source}
      />
      {formError ? (
        <p className="text-negative text-lg" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          aria-busy={busy}
          aria-describedby={photo && unavailable ? guidanceId : undefined}
          className="w-full sm:w-auto"
          disabled={busy || !ready}
          type="submit"
        >
          <ShieldCheckIcon aria-hidden="true" />
          {submitLabel(source, busy, t)}
        </Button>
      </div>
      {busy ? (
        <output aria-live="polite" className="text-muted-foreground text-label">
          {photo ? t.uploadingNote : t.preparing}
        </output>
      ) : null}
    </form>
  );
};

const HistoryList = ({
  emails,
  onOpen,
  reviews,
  timeZone,
}: {
  emails: EmailChoice[] | undefined;
  onOpen: (reviewId: Id<"scamReviews">) => void;
  reviews: Doc<"scamReviews">[] | undefined;
  timeZone: string;
}) => {
  const messages = useMessages();
  const t = messages.scam;

  if (reviews === undefined) {
    return <LoadingRows layout="checks" label={t.loadingEarlier} rows={3} />;
  }

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground py-5 text-lg">{t.earlierEmpty}</p>
    );
  }

  return (
    <ul>
      {reviews.map((review) => {
        const verdict = verdictOf(review.verdict, messages.scamResult);
        const kind = messages.scamResult.kinds[review.inputKind];
        const email = emails?.find((item) => item.id === review.emailId);

        const Icon =
          SOURCES.find((source) => source.value === review.inputKind)?.icon ??
          TextIcon;

        return (
          <li className="border-rule border-b" key={review._id}>
            <button
              className="hover:bg-parchment flex min-h-20 w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-md px-1 py-3.5 text-left"
              onClick={() => onOpen(review._id)}
              type="button"
            >
              <Icon
                aria-hidden="true"
                className="text-muted-foreground size-6 shrink-0"
              />
              <span className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
                <span className="line-clamp-2 text-lg font-semibold wrap-anywhere">
                  {email?.subject || review.inputText?.trim() || kind}
                </span>
                <span className="text-muted-foreground text-label">
                  {kind} · {ago(review.createdAt, timeZone)}
                  {review.mode === "simulated" ? t.practiceSuffix : ""}
                </span>
              </span>
              <Pill tone={review.status === "done" ? verdict.tone : "neutral"}>
                {review.status === "done" && verdict.label}
                {review.status === "failed" && t.didNotFinish}
                {review.status === "reviewing" && t.checking}
              </Pill>
              <span className="text-label min-h-control flex items-center gap-2 font-medium">
                {t.review}
                <ArrowRightIcon aria-hidden="true" className="size-5" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const useReviewSelection = (emailId: string | null) => {
  const reviews = useQuery(api.scam.list);
  const emails = useQuery(api.emails.list);
  const { me } = usePreferences();
  const [currentId, setCurrentId] = useState<Id<"scamReviews"> | null>(null);
  const [ignoreEmailReview, setIgnoreEmailReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const [initialSource, setInitialSource] = useState<Source>(
    emailId ? "email" : "screenshot"
  );

  const [formVersion, setFormVersion] = useState(0);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";
  const email = emails?.find((item) => item.id === emailId) ?? null;

  const selectedReviewId =
    currentId ??
    (ignoreEmailReview ? null : email?.scamCheck?.reviewId) ??
    null;

  const current = useQuery(
    api.scam.get,
    selectedReviewId === null || deletingReview !== null
      ? "skip"
      : { reviewId: selectedReviewId }
  );

  const earlier = reviews?.filter((review) => review._id !== selectedReviewId);
  const waitingForEmail = emailId !== null && emails === undefined;
  const showingResult = selectedReviewId !== null;

  const openForm = (source: Source = "screenshot") => {
    setIgnoreEmailReview(true);
    setCurrentId(null);
    setDeletingReview(null);
    setInitialSource(source);
    setFormVersion((version) => version + 1);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLInputElement>("#message-check-sources input:checked")
        ?.focus()
    );
  };

  return {
    current: deletingReview ?? current,
    earlier,
    email,
    emails,
    formVersion,
    initialSource,
    openForm,
    setCurrentId,
    setDeletingReview,
    showingResult,
    timeZone,
    waitingForEmail,
  };
};

const ScamPageIntro = ({ active }: { active: boolean }) => {
  const t = useMessages().scam;

  return active ? (
    <h1 className="sr-only">{t.callCheckTitle}</h1>
  ) : (
    <PageHeader subline={t.subline} title={t.title} />
  );
};

const CheckGuidance = () => {
  const t = useMessages().scam.guidance;

  return (
    <details className="group border-rule rounded-xl border p-4 sm:p-5">
      <summary className="min-h-control flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
        {t.title}
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="flex max-w-prose flex-col gap-3 pt-3 text-lg">
        <p>{t.intro}</p>
        <p>{t.ai}</p>
        <p>{t.next}</p>
      </div>
    </details>
  );
};

const SelectedCheck = ({
  selection,
}: {
  selection: ReturnType<typeof useReviewSelection>;
}) => {
  const { current, openForm, setDeletingReview, timeZone } = selection;
  const t = useMessages().scam;

  if (current === undefined) {
    return <LoadingRows label={t.opening} layout="check-form" rows={2} />;
  }

  if (current === null) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-lg">{t.noLongerAvailable}</p>
        <Button onClick={() => openForm()}>{t.startNew}</Button>
      </div>
    );
  }

  return (
    <ScamResult
      key={current._id}
      onCheckAnother={() => openForm()}
      onDeleted={() => openForm()}
      onDeleting={setDeletingReview}
      onTryPhoto={() => openForm("screenshot")}
      onTypeWords={() => openForm("text")}
      review={current}
      timeZone={timeZone}
    />
  );
};

const ScamScreen = ({ emailId }: { emailId: string | null }) => {
  const selection = useReviewSelection(emailId);

  const {
    current,
    earlier,
    email,
    emails,
    formVersion,
    initialSource,
    setCurrentId,
    showingResult,
    timeZone,
    waitingForEmail,
  } = selection;

  const [callActive, setCallActive] = useState(false);
  const t = useMessages().scam;
  const showResult = !callActive && showingResult;

  return (
    <>
      {showResult && current ? null : <ScamPageIntro active={callActive} />}
      {showResult ? <SelectedCheck selection={selection} /> : null}
      <div
        className={cn(
          "grid min-w-0 items-start gap-8",
          !callActive && showingResult && "hidden",
          !callActive &&
            "@4xl/content:grid-cols-[minmax(0,1fr)_1px_22.5rem] @4xl/content:gap-10"
        )}
      >
        <div className={cn("min-w-0", callActive && "hidden")}>
          {emailId !== null && !waitingForEmail && email === null ? (
            <p className="text-negative mb-4 text-lg" role="alert">
              {t.emailMissing}
            </p>
          ) : null}
          {waitingForEmail ? (
            <LoadingRows layout="check-form" label={t.loadingEmail} rows={2} />
          ) : (
            <CheckForm
              active={!callActive && !showingResult}
              email={email}
              emails={emails}
              initialSource={initialSource}
              key={`${email?.id ?? "none"}-${formVersion}`}
              onStarted={setCurrentId}
            />
          )}
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "bg-rule h-px @4xl/content:h-auto @4xl/content:w-px @4xl/content:self-stretch",
            callActive && "hidden"
          )}
        />
        <div className="min-w-0">
          <CallScreening onActiveChange={setCallActive} />
        </div>
      </div>
      {callActive ? null : <CheckGuidance />}
      {callActive ? null : (
        <section
          aria-labelledby="history-heading"
          className="flex flex-col pt-3"
        >
          <h2
            className="border-rule text-section border-b pb-3 font-semibold"
            id="history-heading"
          >
            {t.earlier}
          </h2>
          <HistoryList
            emails={emails}
            onOpen={(reviewId) => {
              setCurrentId(reviewId);
              globalThis.scrollTo({ top: 0 });
            }}
            reviews={earlier}
            timeZone={timeZone}
          />
          <CallHistory />
        </section>
      )}
    </>
  );
};

export { ScamScreen };
