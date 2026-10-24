"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { Pill } from "@lifelink/ui/components/pill";
import { Textarea } from "@lifelink/ui/components/textarea";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useId, useState } from "react";
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
  allowCloudAnalysis: boolean
): boolean => {
  if (source === "email") {
    return true;
  }

  if (source === "screenshot") {
    return file !== null && allowCloudAnalysis;
  }

  return text.trim().length > 0;
};

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
  const submit = useMutation(api.scam.submit);
  const uploadUrl = useMutation(api.messages.generatePhotoUploadUrl);

  const [source, setSource] = useState<Source>(
    email === null ? "text" : "email"
  );

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const textId = useId();
  const consentId = useId();
  const sourceName = useId();

  const activeSource: Source =
    source === "email" && email === null ? "text" : source;

  const screenshotReady = activeSource === "screenshot" && file !== null;
  const ready = canCheck(activeSource, text, file, allowCloudAnalysis);

  const checkLabel = allowCloudAnalysis
    ? "Check with cloud AI"
    : "Check locally";

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
        "The screenshot could not be uploaded. Try again, or paste its words for a local check."
      );
    }

    const uploaded = uploadResultSchema.parse(await response.json());

    // SAFETY: Convex storage returned this id for the file just uploaded; `submit` re-checks its type and size.
    return uploaded.storageId as Id<"_storage">;
  };

  const start = async (): Promise<Id<"scamReviews">> => {
    if (activeSource === "email" && email !== null) {
      return await submit({
        allowCloudAnalysis,
        emailId: email.id,
        screenshotId: null,
        text: null,
      });
    }

    if (activeSource === "screenshot" && file !== null) {
      const screenshotId = await uploadScreenshot(file);

      return await submit({
        allowCloudAnalysis,
        emailId: null,
        screenshotId,
        text: text.trim() || null,
      });
    }

    return await submit({
      allowCloudAnalysis,
      emailId: null,
      screenshotId: null,
      text,
    });
  };

  return (
    <form
      className="bg-surface text-foreground flex min-w-0 flex-col gap-5 rounded-xl px-5 py-6 sm:px-7"
      onSubmit={async (event) => {
        event.preventDefault();

        if (busy || !ready) {
          return;
        }

        if (
          screenshotReady &&
          (file.size > MAX_SCREENSHOT_BYTES || !file.type.startsWith("image/"))
        ) {
          setFormError("Please choose a screenshot image under 6 MB.");

          return;
        }

        setBusy(true);
        setFormError(null);

        try {
          onStarted(await start());
          setText("");
          setFile(null);
          setAllowCloudAnalysis(false);
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
                  setAllowCloudAnalysis(false);
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

      <label
        className="hover:text-accent-foreground flex min-h-12 cursor-pointer items-start gap-3 text-base leading-relaxed transition-colors"
        htmlFor={consentId}
      >
        <input
          checked={allowCloudAnalysis}
          className="accent-primary mt-1 size-5 shrink-0"
          disabled={busy}
          id={consentId}
          onChange={(event) => setAllowCloudAnalysis(event.target.checked)}
          type="checkbox"
        />
        <span>
          Allow this{" "}
          {activeSource === "screenshot" ? "screenshot and note" : "message"} to
          be sent to the cloud AI provider for this check. Leave unchecked to
          use local rules.
        </span>
      </label>
      <p className="text-muted-foreground max-w-prose text-base">
        {activeSource === "screenshot"
          ? "The local check cannot read images. A screenshot needs cloud permission; in Practice mode, paste its words instead. "
          : "The local check looks for common warning signs without sending your message to an AI provider. "}
        LifeLink does not open links or contact the sender. No check can prove a
        message is genuine.
      </p>
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
  onOpen,
  reviews,
  timeZone,
}: {
  onOpen: (reviewId: Id<"scamReviews">) => void;
  reviews: Doc<"scamReviews">[] | undefined;
  timeZone: string;
}) => {
  if (reviews === undefined) {
    return <LoadingRows label="Loading earlier checks" rows={3} />;
  }

  if (reviews.length === 0) {
    return <EmptyNote>No earlier checks.</EmptyNote>;
  }

  return (
    <ul>
      {reviews.map((review) => {
        const verdict = VERDICT_WORDS[review.verdict];

        return (
          <li className="border-rule border-t" key={review._id}>
            <button
              className="bg-background text-foreground hover:bg-surface hover:text-foreground focus-visible:outline-ring flex w-full min-w-0 flex-wrap items-center gap-3 rounded-md px-3 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => onOpen(review._id)}
              type="button"
            >
              {review.status === "done" ? (
                <Pill tone={verdict.tone}>{verdict.label}</Pill>
              ) : (
                <Pill>{STATUS_PILL[review.status]}</Pill>
              )}
              <span className="text-lg">{KIND_WORDS[review.inputKind]}</span>
              <span className="text-muted-foreground text-base">
                {review.automatic ? "Automatic local check" : "Manual check"}
              </span>
              <span className="text-muted-foreground min-w-0 flex-1 truncate text-base">
                {review.inputText ?? ""}
              </span>
              <span className="text-muted-foreground text-base">
                {ago(review.createdAt, timeZone)}
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
        <LoadingRows label="Loading the email" rows={2} />
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
