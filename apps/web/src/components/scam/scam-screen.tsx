"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { Pill } from "@lifelink/ui/components/pill";
import { Textarea } from "@lifelink/ui/components/textarea";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useId, useRef, useState } from "react";
import { z } from "zod";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, ErrorNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { KIND_WORDS, ScamResult, VERDICT_WORDS } from "./scam-result";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const uploadResultSchema = z.object({ storageId: z.string() });

const MAX_SCREENSHOT_BYTES = 6 * 1024 * 1024;

type Source = "email" | "screenshot" | "text";

const canCheck = (
  source: Source,
  text: string,
  file: File | null,
  practice: boolean,
  loading: boolean
): boolean => {
  if (source === "email") {
    return true;
  }

  if (source === "screenshot") {
    return file !== null && !practice && !loading;
  }

  return text.trim().length > 0;
};

const checkButtonLabel = (source: Source, practice: boolean): string => {
  if (source === "screenshot") {
    return practice
      ? "Screenshot checks unavailable in Practice"
      : "Check this screenshot";
  }

  return source === "email" ? "Check this email" : "Check this message";
};

/** One plain line under the form: where the message goes, and what to leave out. */
const checkGuidance = (source: Source, practice: boolean): string => {
  if (practice) {
    return source === "screenshot"
      ? "Practice mode can’t check pictures. Paste the words instead."
      : "Practice checks stay on this device. Nothing is sent.";
  }

  if (source === "email") {
    return "An AI service reads this email to check it.";
  }

  return "An AI service reads this to check it. Leave out passwords and card numbers.";
};

const validScreenshot = (file: File): boolean =>
  file.size <= MAX_SCREENSHOT_BYTES && file.type.startsWith("image/");

const BASE_SOURCES = [
  { label: "Paste the words", value: "text" },
  { label: "A screenshot", value: "screenshot" },
] as const;

const EMAIL_SOURCES = [
  { label: "This email", value: "email" },
  ...BASE_SOURCES,
] as const;

interface EmailChoice {
  fromAddress: string;
  fromName: string | null;
  id: Id<"emails">;
  subject: string;
}

const ScreenshotFields = ({
  file,
  note,
  onFile,
  onNote,
}: {
  file: File | null;
  note: string;
  onFile: (file: File | null) => void;
  onNote: (note: string) => void;
}) => {
  const fileId = useId();
  const noteId = useId();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={fileId}>Screenshot</Label>
        <input
          accept="image/*"
          className="text-foreground file:border-control file:bg-raised file:text-foreground hover:file:bg-surface hover:file:text-foreground min-h-12 w-full min-w-0 text-base file:mr-4 file:min-h-12 file:rounded-md file:border file:px-5 file:text-base file:font-medium"
          id={fileId}
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          type="file"
        />
        {file ? (
          <span className="text-muted-foreground text-base">
            Chosen: {file.name}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={noteId}>Anything to add? (optional)</Label>
        <Textarea
          id={noteId}
          maxLength={8000}
          onChange={(event) => onNote(event.target.value)}
          placeholder="For example, who it claimed to be from"
          rows={2}
          value={note}
        />
      </div>
    </div>
  );
};

/** Text, a screenshot, or a chosen email goes to the backend; the result appears below as it finishes. */
const CheckForm = ({
  email,
  onStarted,
}: {
  email: EmailChoice | null;
  onStarted: (reviewId: Id<"scamReviews">) => void;
}) => {
  const { me } = usePreferences();
  const practice = me?.profile?.demoMode === true;
  const textRef = useRef<HTMLTextAreaElement>(null);
  const submit = useMutation(api.scam.submit);
  const uploadUrl = useMutation(api.messages.generatePhotoUploadUrl);

  const [source, setSource] = useState<Source>(
    email === null ? "text" : "email"
  );

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const textId = useId();
  const sourceName = useId();

  const activeSource: Source =
    source === "email" && email === null ? "text" : source;

  const screenshotReady = activeSource === "screenshot" && file !== null;
  const screenshotMode = activeSource === "screenshot";

  const ready = canCheck(activeSource, text, file, practice, me === undefined);

  const checkLabel = checkButtonLabel(activeSource, practice);

  const uploadScreenshot = async (
    screenshot: File
  ): Promise<Id<"_storage">> => {
    const url = await uploadUrl({});

    const response = await fetch(url, {
      body: screenshot,
      headers: { "Content-Type": screenshot.type },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(
        "The screenshot could not be uploaded. Try again, or paste its words instead."
      );
    }

    const uploaded = uploadResultSchema.parse(await response.json());

    // SAFETY: Convex storage returned this id for the file just uploaded; `submit` re-checks its type and size.
    return uploaded.storageId as Id<"_storage">;
  };

  const start = async (): Promise<Id<"scamReviews">> => {
    if (activeSource === "email" && email !== null) {
      return await submit({
        allowCloudAnalysis: true,
        emailId: email.id,
        screenshotId: null,
        text: null,
      });
    }

    if (activeSource === "screenshot" && file !== null) {
      const screenshotId = await uploadScreenshot(file);

      return await submit({
        allowCloudAnalysis: true,
        emailId: null,
        screenshotId,
        text: text.trim() || null,
      });
    }

    return await submit({
      allowCloudAnalysis: true,
      emailId: null,
      screenshotId: null,
      text,
    });
  };

  return (
    <form
      className="bg-parchment text-foreground flex min-w-0 flex-col gap-5 rounded-xl px-5 py-6 sm:px-7"
      onSubmit={async (event) => {
        event.preventDefault();

        if (busy || !ready) {
          return;
        }

        if (screenshotReady && !validScreenshot(file)) {
          setFormError("Please choose a screenshot image under 6 MB.");

          return;
        }

        setBusy(true);
        setFormError(null);

        try {
          onStarted(await start());
          setText("");
          setFile(null);
        } catch (error) {
          setFormError(errorText(error));
        }

        setBusy(false);
      }}
    >
      <fieldset className="flex min-w-0 flex-col gap-2" disabled={busy}>
        <legend className="pb-2 text-lg font-semibold">
          What would you like checked?
        </legend>
        <div className="flex flex-wrap gap-2">
          {(email === null ? BASE_SOURCES : EMAIL_SOURCES).map((option) => (
            <label
              className={cn(
                "border-control has-focus-visible:outline-ring flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-base has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
                activeSource === option.value
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "bg-raised text-foreground hover:bg-surface hover:text-foreground"
              )}
              key={option.value}
            >
              <input
                checked={activeSource === option.value}
                className="size-4 shrink-0"
                name={sourceName}
                onChange={() => {
                  setSource(option.value);
                  setFormError(null);
                }}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {activeSource === "email" && email !== null ? (
        <div className="border-rule flex min-w-0 flex-col gap-1 border-y py-4 wrap-anywhere">
          <span className="text-muted-foreground text-base">
            From {email.fromName ?? email.fromAddress}
          </span>
          <span className="text-xl font-semibold">
            {email.subject || "(No subject)"}
          </span>
        </div>
      ) : null}

      {activeSource === "text" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={textId}>The message</Label>
          <Textarea
            id={textId}
            ref={textRef}
            maxLength={8000}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste or type the words here"
            rows={6}
            value={text}
          />
        </div>
      ) : null}

      {activeSource === "screenshot" ? (
        <ScreenshotFields
          file={file}
          note={text}
          onFile={setFile}
          onNote={setText}
        />
      ) : null}

      <p className="text-muted-foreground text-body max-w-prose">
        {checkGuidance(activeSource, practice)}
      </p>
      {screenshotMode ? (
        <Button
          className="self-start whitespace-normal"
          disabled={busy}
          onClick={() => {
            setSource("text");
            setFormError(null);
            requestAnimationFrame(() => textRef.current?.focus());
          }}
          type="button"
          variant="outline"
        >
          Paste the words instead
        </Button>
      ) : null}
      {formError === null ? null : <ErrorNote>{formError}</ErrorNote>}
      <Button
        aria-busy={busy}
        className="hover:text-primary-foreground self-start rounded-md whitespace-normal"
        disabled={busy || !ready}
        size="lg"
        type="submit"
      >
        {busy ? "Checking…" : checkLabel}
      </Button>
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
    return <EmptyNote>No earlier checks.</EmptyNote>;
  }

  return (
    <ul>
      {reviews.map((review) => {
        const verdict = VERDICT_WORDS[review.verdict];
        const email = emails?.find((item) => item.id === review.emailId);

        return (
          <li className="border-rule border-t" key={review._id}>
            <button
              className="bg-background text-foreground hover:bg-surface hover:text-foreground focus-visible:outline-ring -mx-3 flex w-[calc(100%+1.5rem)] min-w-0 flex-col items-start gap-3 rounded-md px-3 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => onOpen(review._id)}
              type="button"
            >
              {email ? (
                <span className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                  <span className="text-lg font-semibold">
                    {email.fromName ?? email.fromAddress}
                  </span>
                  <span className="text-lg">
                    {email.subject || "(No subject)"}
                  </span>
                </span>
              ) : null}
              <span className="line-clamp-3 w-full text-lg wrap-anywhere">
                {review.inputText?.trim() ||
                  (review.inputKind === "screenshot"
                    ? "Screenshot without a note"
                    : KIND_WORDS[review.inputKind])}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                {review.status === "done" ? (
                  <Pill tone={verdict.tone}>{verdict.label}</Pill>
                ) : (
                  <Pill>{STATUS_PILL[review.status]}</Pill>
                )}
                <span className="text-muted-foreground text-base">
                  {KIND_WORDS[review.inputKind]} ·{" "}
                  {review.automatic ? "Automatic local check" : "Manual check"}{" "}
                  · {ago(review.createdAt, timeZone)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const ScamScreen = ({ emailId }: { emailId: string | null }) => {
  const reviews = useQuery(api.scam.list);
  const emails = useQuery(api.emails.list);
  const { me } = usePreferences();
  const [currentId, setCurrentId] = useState<Id<"scamReviews"> | null>(null);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";
  const email = emails?.find((item) => item.id === emailId) ?? null;
  const selectedReviewId = currentId ?? email?.scamCheck?.reviewId ?? null;

  const current = useQuery(
    api.scam.get,
    selectedReviewId === null ? "skip" : { reviewId: selectedReviewId }
  );

  const earlier = reviews?.filter((review) => review._id !== selectedReviewId);
  const waitingForEmail = emailId !== null && emails === undefined;

  return (
    <>
      <PageHeader
        subline="Email is checked automatically with local rules. Use this page to review a result or check another message before you act."
        title="Scam check"
      />
      {current === undefined ? null : (
        <ScamResult key={current._id} review={current} timeZone={timeZone} />
      )}
      {emailId !== null && !waitingForEmail && email === null ? (
        <ErrorNote>
          This email is not in the recent inbox. Return to Email to choose one,
          or paste its words below.
        </ErrorNote>
      ) : null}
      {waitingForEmail ? (
        <LoadingRows layout="check-form" label="Loading the email" rows={2} />
      ) : (
        <CheckForm
          email={email}
          key={email?.id ?? "none"}
          onStarted={setCurrentId}
        />
      )}
      <section aria-labelledby="history-heading" className="flex flex-col">
        <h2 className="pb-3 text-2xl font-semibold" id="history-heading">
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
      </section>
    </>
  );
};

export { ScamScreen };
