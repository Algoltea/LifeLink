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
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { CallHistory, CallScreening } from "./call-screening";
import { PhotoInput, photoError } from "./photo-input";
import { KIND_WORDS, ScamResult, VERDICT_WORDS } from "./scam-result";
import type { Review } from "./scam-result";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type Source = "email" | "screenshot" | "text";

const SOURCES = [
  { icon: TextIcon, label: "Text", value: "text" },
  { icon: ImageIcon, label: "Photo", value: "screenshot" },
  { icon: MailIcon, label: "Email", value: "email" },
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

  if (emails === undefined) {
    return <LoadingRows label="Loading your emails" layout="checks" rows={2} />;
  }

  if (emails.length === 0) {
    return (
      <p className="text-lg">
        There are no recent emails to choose from.{" "}
        <Link
          className="inline-flex min-h-12 items-center font-semibold underline"
          href="/email"
        >
          Open Email
        </Link>
        , or type the message’s words instead.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Label htmlFor={id}>Choose an email</Label>
      <select
        className="border-control bg-raised text-foreground min-h-control text-body w-full min-w-0 rounded-md border px-4"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={selected?.id ?? ""}
      >
        <option value="">Choose from your recent emails</option>
        {emails.map((email) => (
          <option key={email.id} value={email.id}>
            {email.fromName ?? email.fromAddress} ·{" "}
            {email.subject || "(No subject)"}
          </option>
        ))}
      </select>
      {selected ? (
        <div className="border-rule flex flex-col gap-1 border-b py-3 wrap-anywhere">
          <p className="text-muted-foreground text-label">
            From {selected.fromName ?? selected.fromAddress}
          </p>
          <p className="text-body font-semibold">
            {selected.subject || "(No subject)"}
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
  if (practice) {
    return "Practice mode is on. Photos are not checked or sent to an AI service.";
  }

  if (!loaded) {
    return "Checking whether photo checks are available…";
  }

  if (!configured) {
    return "Photo checks are not available right now. Your photo will not be uploaded.";
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

const submitLabel = (source: Source, busy: boolean): string => {
  if (busy) {
    return source === "screenshot"
      ? "Uploading your photo…"
      : "Checking the message…";
  }

  const labels: Record<Source, string> = {
    email: "Check this email",
    screenshot: "Check this photo",
    text: "Check this message",
  };

  return labels[source];
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
  if (source === "email" && email?.mode === "simulated") {
    return (
      <p className="text-muted-foreground text-label">
        This is a practice email. It is checked on this device without cloud AI.
      </p>
    );
  }

  if (cloudAvailable) {
    return (
      <p className="text-muted-foreground text-label">
        An AI service reads this to check it. Leave out passwords and card
        numbers.
      </p>
    );
  }

  if (source === "screenshot") {
    return null;
  }

  return (
    <p className="text-muted-foreground text-label">
      {practice
        ? "Practice checks use common warning signs. Nothing is sent to an AI service."
        : "AI checks are not available right now. LifeLink uses common warning signs instead."}
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
        throw new Error(
          "Photo checks aren’t available. Type the words instead."
        );
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
      <div className="flex flex-col gap-1">
        <h2
          className="text-section font-semibold"
          id="message-check-heading"
          tabIndex={-1}
        >
          Check a message
        </h2>
        <p className="text-muted-foreground text-label">
          A letter, a text, a screenshot or an email. Choose the easiest way to
          show it.
        </p>
      </div>
      <fieldset className="min-w-0" disabled={busy}>
        <legend className="sr-only">
          How would you like to show the message?
        </legend>
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
              {option.label}
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
          <Label htmlFor={textId}>The message’s words</Label>
          <Textarea
            className="text-lg"
            disabled={busy}
            id={textId}
            maxLength={8000}
            onChange={(event) => {
              setText(event.target.value);
            }}
            placeholder="Paste or type the words here"
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
            <Label htmlFor={noteId}>Anything to add? (optional)</Label>
            <Textarea
              className="text-body min-h-20"
              disabled={busy}
              id={noteId}
              maxLength={8000}
              onChange={(event) => {
                setNote(event.target.value);
              }}
              placeholder="For example, who it claimed to be from"
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
          {submitLabel(source, busy)}
        </Button>
      </div>
      {busy ? (
        <output aria-live="polite" className="text-muted-foreground text-label">
          {photo
            ? "Uploading your photo. Keep this page open; reading the words comes next."
            : "Preparing your check…"}
        </output>
      ) : null}
    </form>
  );
};

const STATUS_PILL: Record<
  Exclude<Doc<"scamReviews">["status"], "done">,
  string
> = {
  failed: "Didn’t finish",
  reviewing: "Checking",
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
  if (reviews === undefined) {
    return (
      <LoadingRows layout="checks" label="Loading earlier checks" rows={3} />
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground py-5 text-lg">
        Your message, photo and call checks will appear here.
      </p>
    );
  }

  return (
    <ul>
      {reviews.map((review) => {
        const verdict = VERDICT_WORDS[review.verdict];
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
                  {email?.subject ||
                    review.inputText?.trim() ||
                    KIND_WORDS[review.inputKind]}
                </span>
                <span className="text-muted-foreground text-label">
                  {KIND_WORDS[review.inputKind]} ·{" "}
                  {ago(review.createdAt, timeZone)}
                  {review.mode === "simulated" ? " · Practice" : ""}
                </span>
              </span>
              <Pill tone={review.status === "done" ? verdict.tone : "neutral"}>
                {review.status === "done"
                  ? verdict.label
                  : STATUS_PILL[review.status]}
              </Pill>
              <span className="text-label min-h-control flex items-center gap-2 font-medium">
                Review
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
      document.querySelector<HTMLElement>("#message-check-heading")?.focus()
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

const ScamPageIntro = ({ active }: { active: boolean }) =>
  active ? (
    <h1 className="sr-only">Scam call check</h1>
  ) : (
    <PageHeader
      subline="Not sure about a message or a call? LifeLink looks for warning signs before you act."
      title="Scam check"
    />
  );

const CheckGuidance = () => (
  <details className="group border-rule rounded-xl border p-4 sm:p-5">
    <summary className="min-h-control flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
      What can a scam check tell me?
      <ChevronDownIcon
        aria-hidden="true"
        className="size-5 shrink-0 transition-transform group-open:rotate-180"
      />
    </summary>
    <div className="flex max-w-prose flex-col gap-3 pt-3 text-lg">
      <p>
        A check looks for common warning signs. It can’t confirm who sent a
        message or whether it’s true.
      </p>
      <p>
        An AI service helps with message and photo checks. Photos stay with your
        check until you delete it. Practice checks never use AI.
      </p>
      <p>
        Read the result, follow “What to do now”, or ask someone you trust for a
        second opinion. You choose what happens next.
      </p>
    </div>
  </details>
);

const SelectedCheck = ({
  selection,
}: {
  selection: ReturnType<typeof useReviewSelection>;
}) => {
  const { current, openForm, setDeletingReview, timeZone } = selection;

  if (current === undefined) {
    return (
      <LoadingRows label="Opening your check" layout="check-form" rows={2} />
    );
  }

  if (current === null) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-lg">
          This check is no longer available. You can start a new one.
        </p>
        <Button onClick={() => openForm()}>Start a new check</Button>
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
              This email isn’t in the recent inbox. Pick another email or type
              its words below.
            </p>
          ) : null}
          {waitingForEmail ? (
            <LoadingRows
              layout="check-form"
              label="Loading the email"
              rows={2}
            />
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
            Earlier checks
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
