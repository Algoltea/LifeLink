"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation } from "convex/react";
import {
  CameraIcon,
  FileTextIcon,
  InfoIcon,
  ShieldQuestionIcon,
  TextIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ModePill, ReadAloudButton } from "@/components/app/bits";
import { OneAtATime } from "@/components/app/one-at-a-time";
import { usePreferences } from "@/components/app/preferences";
import { Disclosure } from "@/components/email/email-bits";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { TrustedPeople } from "./trusted-people";

type Verdict = Doc<"scamReviews">["verdict"];

type Review = Omit<Doc<"scamReviews">, "extractedText" | "imageReadable"> & {
  extractedText?: string | null;
  imageReadable?: boolean | null;
  photoUrl?: string | null;
};

const VERDICT_WORDS: Record<
  Verdict,
  { label: string; tone: "negative" | "neutral" | "positive" | "warning" }
> = {
  likely_safe: { label: "No clear warning signs", tone: "neutral" },
  likely_scam: { label: "Likely a scam", tone: "negative" },
  suspicious: { label: "Warning signs found", tone: "warning" },
  unsure: { label: "Not verified", tone: "neutral" },
};

const CONFIDENCE_WORDS: Record<Doc<"scamReviews">["confidence"], string> = {
  high: "Several details support this assessment. It still can’t verify the sender.",
  low: "There isn’t enough information to be sure. A second opinion can help.",
  medium:
    "Some details support this assessment. Verify the request independently.",
};

const KIND_WORDS: Record<Doc<"scamReviews">["inputKind"], string> = {
  email: "An email",
  screenshot: "A photo or screenshot",
  text: "A message",
};

const CHECK_TITLES = {
  email: "Your email check",
  screenshot: "Your photo check",
  text: "Your message check",
} as const;

const checkMethod = (review: Review): string => {
  if (!review.model.startsWith("rules")) {
    return review.cloudAnalysisConsent === true
      ? "A cloud AI service helped with this check, with your permission."
      : "A cloud AI service helped with this earlier check. Permission details weren’t saved with this record.";
  }

  if (review.cloudAnalysisConsent === undefined) {
    return "LifeLink used common warning rules. This older record doesn’t say whether a cloud AI service also received the message.";
  }

  if (review.cloudAnalysisConsent) {
    return "LifeLink used common warning rules because cloud AI wasn’t available or didn’t finish. The service may already have received this content.";
  }

  return "LifeLink used common warning rules. The message wasn’t sent to a cloud AI service for this check.";
};

const REMOVED_QUOTES =
  "Some words the assistant pointed to weren’t found in the message, so they aren’t shown.";

const IMAGE_UNVERIFIED =
  "These words were read from a photo and may be wrong or incomplete. LifeLink couldn’t compare them with the original text. Check them against your photo.";

const photoRetention = (review: Review): string => {
  if (review.screenshotOwned !== true) {
    return "This older check has no saved photo preview. Deleting this check removes the result; the older photo may remain in storage.";
  }

  return "Your photo is kept with this check. Deleting the check also deletes the photo, unless it’s still used by another saved check or photo.";
};

type Signal = Doc<"scamReviews">["signals"][number];

const SignalList = ({
  photo,
  signals,
}: {
  photo: boolean;
  signals: Signal[];
}) => (
  <ul className="flex flex-col gap-5">
    {signals.map((signal, index) => (
      <li className="flex flex-col gap-1" key={`${signal.label}-${index}`}>
        <h3 className="text-lg font-semibold">{signal.label}</h3>
        {signal.quote ? (
          <blockquote className="text-neutral-ink pl-5 text-lg wrap-anywhere">
            “{signal.quote}”
          </blockquote>
        ) : null}
        <p className="text-muted-foreground text-lg">{signal.detail}</p>
        {!photo && signal.quote && signal.evidence === "image_unverified" ? (
          <p className="text-warning text-lg">{IMAGE_UNVERIFIED}</p>
        ) : null}
      </li>
    ))}
  </ul>
);

const PhotoThumbnail = ({ url }: { url: string | null | undefined }) => {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <p className="text-muted-foreground text-lg">
        The photo preview isn’t available for this check.{" "}
        {url
          ? "Try reopening the check."
          : "You can still read its saved result."}
      </p>
    );
  }

  return (
    <figure
      className={cn(
        "flex min-w-0 flex-col gap-2",
        expanded ? "w-full" : "w-42 shrink-0"
      )}
    >
      <button
        aria-expanded={expanded}
        aria-label={
          expanded ? "Make the photo smaller" : "See the photo larger"
        }
        className={cn(
          "bg-parchment relative w-full overflow-hidden rounded-xl",
          expanded ? "h-96" : "h-50"
        )}
        onClick={() => setExpanded((open) => !open)}
        type="button"
      >
        <Image
          alt="The photo used for this check"
          className="object-contain"
          fill
          onError={() => setFailed(true)}
          sizes={expanded ? "(max-width: 768px) 100vw, 700px" : "168px"}
          src={url}
          unoptimized
        />
      </button>
      <figcaption>
        <Button
          aria-expanded={expanded}
          className="w-full px-1 text-lg underline underline-offset-4"
          onClick={() => setExpanded((open) => !open)}
          variant="ghost"
        >
          {expanded ? "Make photo smaller" : "See the photo"}
        </Button>
      </figcaption>
    </figure>
  );
};

const DeleteCheck = ({
  onDeleted,
  onDeleting,
  review,
}: {
  onDeleted: () => void;
  onDeleting?: (review: Review | null) => void;
  review: Review;
}) => {
  const remove = useMutation(api.scam.remove);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <div className="border-rule flex flex-col items-start gap-3 border-t pt-4">
      {confirming ? (
        <>
          <p className="text-lg">
            Delete this check? It will be removed from Earlier checks.
          </p>
          {review.inputKind === "screenshot" ? (
            <p className="text-lg">{photoRetention(review)}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              aria-busy={busy}
              className="text-lg"
              disabled={busy}
              onClick={async () => {
                if (inFlight.current) {
                  return;
                }

                inFlight.current = true;
                setBusy(true);
                setDeleteError(null);
                onDeleting?.(review);

                try {
                  await remove({ reviewId: review._id });
                  onDeleted();
                } catch (error) {
                  onDeleting?.(null);
                  setDeleteError(
                    messageOf(error instanceof Error ? error : null)
                  );
                }

                inFlight.current = false;
                setBusy(false);
              }}
              variant="destructive"
            >
              {busy ? "Deleting…" : "Delete this check"}
            </Button>
            <Button
              className="text-lg"
              disabled={busy}
              onClick={() => setConfirming(false)}
              variant="ghost"
            >
              Keep this check
            </Button>
          </div>
        </>
      ) : (
        <Button
          className="text-lg"
          onClick={() => setConfirming(true)}
          variant="ghost"
        >
          <Trash2Icon aria-hidden="true" />
          Delete this check
        </Button>
      )}
      {deleteError ? (
        <p className="text-negative text-lg" role="alert">
          {deleteError}
        </p>
      ) : null}
    </div>
  );
};

const ResultBanner = ({
  review,
  spoken,
}: {
  review: Review;
  spoken: string;
}) => {
  const verdict = VERDICT_WORDS[review.verdict];

  const concern =
    review.verdict === "likely_scam" || review.verdict === "suspicious";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 basis-64 flex-col gap-4 rounded-xl border p-5 sm:p-6",
        concern
          ? "border-warning-edge bg-warning-wash"
          : "border-rule bg-parchment"
      )}
    >
      <div className="flex items-start gap-3.5">
        {concern ? (
          <TriangleAlertIcon
            aria-hidden="true"
            className="text-warning mt-1 size-7 shrink-0"
          />
        ) : (
          <ShieldQuestionIcon
            aria-hidden="true"
            className="text-muted-foreground mt-1 size-7 shrink-0"
          />
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-section font-semibold">{verdict.label}</h2>
          <p className="max-w-prose text-lg leading-relaxed">
            {review.explanation}
          </p>
        </div>
      </div>
      <ReadAloudButton
        className="self-start text-lg"
        label="Read the result aloud"
        text={spoken}
      />
    </div>
  );
};

const Evidence = ({
  review,
  timeZone,
}: {
  review: Review;
  timeZone: string;
}) => {
  const { preferences } = usePreferences();
  const photo = review.inputKind === "screenshot";

  const signs = review.signals.filter(
    (signal) => signal.stance !== "warns_against"
  );

  const advice = review.signals.filter(
    (signal) => signal.stance === "warns_against"
  );

  return (
    <div className="border-rule border-t">
      <Disclosure
        defaultOpen={preferences.explanationDetail !== "short"}
        icon={<TriangleAlertIcon />}
        labelId={`signs-${review._id}`}
        note={
          photo
            ? "With the words LifeLink read from your photo"
            : "What stood out in this message"
        }
        title={`${signs.length} ${signs.length === 1 ? "warning sign" : "warning signs"}`}
      >
        {photo ? (
          <p className="text-warning text-lg">{IMAGE_UNVERIFIED}</p>
        ) : null}
        {(review.unverifiedQuoteCount ?? 0) > 0 ? (
          <p className="text-muted-foreground text-lg">{REMOVED_QUOTES}</p>
        ) : null}
        {signs.length > 0 ? (
          <SignalList photo={photo} signals={signs} />
        ) : (
          <p className="text-lg">
            No clear warning signs were found. That doesn’t prove this message
            is genuine.
          </p>
        )}
      </Disclosure>
      {advice.length > 0 ? (
        <Disclosure
          icon={<InfoIcon />}
          labelId={`advice-${review._id}`}
          note="This advice came from the message, so it isn’t counted as a warning sign"
          title="Advice in the message itself"
        >
          <SignalList photo={photo} signals={advice} />
        </Disclosure>
      ) : null}
      {photo ? (
        <Disclosure
          icon={<FileTextIcon />}
          labelId={`words-${review._id}`}
          note="Compare them with your photo"
          title="All the words LifeLink read"
        >
          <p className="text-warning text-lg">{IMAGE_UNVERIFIED}</p>
          {review.extractedText?.trim() ? (
            <p className="text-lg wrap-anywhere whitespace-pre-wrap">
              {review.extractedText}
            </p>
          ) : (
            <p className="text-lg">
              The complete wording wasn’t saved with this check. The quotes
              above aren’t a full transcription. Compare them with your photo,
              or type the words for another check.
            </p>
          )}
        </Disclosure>
      ) : null}
      {!photo && review.inputText ? (
        <Disclosure
          icon={<FileTextIcon />}
          labelId={`original-${review._id}`}
          note="The wording saved with this check"
          title={
            review.inputKind === "email" ? "Original email" : "Original message"
          }
        >
          <p className="text-lg wrap-anywhere whitespace-pre-wrap">
            {review.inputText}
          </p>
        </Disclosure>
      ) : null}
      <Disclosure
        icon={<ShieldQuestionIcon />}
        labelId={`method-${review._id}`}
        note={ago(review.createdAt, timeZone)}
        title="How this was checked"
      >
        <p className="text-lg">{checkMethod(review)}</p>
        <p className="text-lg">{CONFIDENCE_WORDS[review.confidence]}</p>
        <p className="text-lg">
          This result can’t prove that a message is genuine. Confirm unexpected
          requests through a contact you already know.
        </p>
        {photo ? <p className="text-lg">{photoRetention(review)}</p> : null}
      </Disclosure>
    </div>
  );
};

const Recovery = ({
  onTryPhoto,
  onTypeWords,
  review,
}: {
  onTryPhoto?: () => void;
  onTypeWords?: () => void;
  review: Review;
}) => {
  const photo = review.inputKind === "screenshot";
  const unreadable = review.imageReadable === false;

  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-section font-semibold">
        {unreadable
          ? "LifeLink couldn’t read this photo clearly"
          : "The check didn’t finish"}
      </h2>
      <p className="text-lg">
        {photo
          ? "Try a clearer photo in good light with all the words in view, or type the words instead. This check can’t tell you whether the message is genuine."
          : "Treat the message with care. You can try another check or ask someone you trust."}
      </p>
      {photo ? <PhotoThumbnail url={review.photoUrl} /> : null}
      <div className="flex flex-wrap gap-3">
        {photo && onTryPhoto ? (
          <Button className="text-lg" onClick={onTryPhoto}>
            <CameraIcon aria-hidden="true" />
            Take a new photo
          </Button>
        ) : null}
        {onTypeWords ? (
          <Button className="text-lg" onClick={onTypeWords} variant="outline">
            <TextIcon aria-hidden="true" />
            Type words instead
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const ResultContent = ({
  onTryPhoto,
  onTypeWords,
  review,
  timeZone,
}: {
  onTryPhoto?: () => void;
  onTypeWords?: () => void;
  review: Review;
  timeZone: string;
}) => {
  const { preferences } = usePreferences();
  const photo = review.inputKind === "screenshot";

  const needsRecovery =
    review.status === "failed" || review.imageReadable === false;

  const verdict = VERDICT_WORDS[review.verdict];

  const spoken = [
    verdict.label,
    review.explanation,
    photo ? IMAGE_UNVERIFIED : "",
    (review.unverifiedQuoteCount ?? 0) > 0 ? REMOVED_QUOTES : "",
    ...review.signals
      .filter((signal) => signal.stance !== "warns_against")
      .map((signal) => signal.label),
    ...review.nextSteps,
  ]
    .filter(Boolean)
    .join(". ");

  if (review.status === "reviewing") {
    return (
      <div aria-live="polite" className="flex flex-col gap-3">
        <h2 className="text-section font-semibold">
          {photo
            ? "Reading the words in your photo…"
            : "Checking your message…"}
        </h2>
        <p className="text-lg">
          This usually takes a few seconds. Keep this page open. Until then,
          don’t use links or phone numbers in the message, or pay anyone.
        </p>
        {photo ? <PhotoThumbnail url={review.photoUrl} /> : null}
      </div>
    );
  }

  if (needsRecovery) {
    return (
      <Recovery
        onTryPhoto={onTryPhoto}
        onTypeWords={onTypeWords}
        review={review}
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start gap-7">
        {photo ? <PhotoThumbnail url={review.photoUrl} /> : null}
        <ResultBanner review={review} spoken={spoken} />
      </div>
      <div className="grid min-w-0 items-start gap-8 @4xl/content:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        {review.nextSteps.length > 0 ? (
          <section
            aria-labelledby={`next-${review._id}`}
            className="bg-parchment flex min-w-0 flex-col gap-4 rounded-xl p-5 sm:p-6"
          >
            <h2
              className="text-section font-semibold"
              id={`next-${review._id}`}
            >
              What to do now
            </h2>
            {preferences.stepByStep ? (
              <OneAtATime
                noun="Step"
                steps={review.nextSteps.map((step, index) => ({
                  content: <p className="text-lg">{step}</p>,
                  key: `${index}-${step}`,
                }))}
              />
            ) : (
              <ol className="flex list-decimal flex-col gap-3 pl-6 text-lg">
                {review.nextSteps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ol>
            )}
          </section>
        ) : (
          <section className="bg-parchment flex flex-col gap-3 rounded-xl p-5 sm:p-6">
            <h2 className="text-section font-semibold">What to do now</h2>
            <p className="text-lg">
              Before acting on an unexpected request, check with someone you
              know using their saved contact details.
            </p>
          </section>
        )}
        <section
          aria-labelledby={`help-${review._id}`}
          className="flex min-w-0 flex-col gap-3"
        >
          <h2 className="text-section font-semibold" id={`help-${review._id}`}>
            Ask someone you trust
          </h2>
          <TrustedPeople reviewId={review._id} />
        </section>
      </div>
      <section
        aria-labelledby={`details-${review._id}`}
        className="flex min-w-0 flex-col gap-3"
      >
        <h2 className="text-section font-semibold" id={`details-${review._id}`}>
          About this check
        </h2>
        <Evidence review={review} timeZone={timeZone} />
      </section>
    </>
  );
};

const ScamResult = ({
  onCheckAnother,
  onDeleted,
  onDeleting,
  onTryPhoto,
  onTypeWords,
  review,
  timeZone,
}: {
  onCheckAnother?: () => void;
  onDeleted?: () => void;
  onDeleting?: (review: Review | null) => void;
  onTryPhoto?: () => void;
  onTypeWords?: () => void;
  review: Review;
  timeZone: string;
}) => {
  const resultRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (review.status) {
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [review.status]);

  return (
    <article
      aria-labelledby={`review-${review._id}`}
      className="flex min-w-0 flex-col gap-7 outline-none"
      ref={resultRef}
      tabIndex={-1}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1
            className="text-mobile-title sm:text-page-title font-semibold tracking-tight"
            id={`review-${review._id}`}
          >
            {CHECK_TITLES[review.inputKind]}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <ModePill mode={review.mode} />
            <p className="text-muted-foreground text-lg">
              {KIND_WORDS[review.inputKind]} · {ago(review.createdAt, timeZone)}
            </p>
          </div>
        </div>
        {onCheckAnother ? (
          <Button
            className="text-lg"
            onClick={onCheckAnother}
            variant="outline"
          >
            Check something else
          </Button>
        ) : null}
      </header>
      <ResultContent
        onTryPhoto={onTryPhoto}
        onTypeWords={onTypeWords}
        review={review}
        timeZone={timeZone}
      />
      {review.status !== "done" || review.imageReadable === false ? (
        <section
          aria-labelledby={`help-${review._id}`}
          className="flex flex-col gap-3"
        >
          <h2 className="text-section font-semibold" id={`help-${review._id}`}>
            Ask someone you trust
          </h2>
          <TrustedPeople reviewId={review._id} />
        </section>
      ) : null}
      {onDeleted ? (
        <DeleteCheck
          onDeleted={onDeleted}
          onDeleting={onDeleting}
          review={review}
        />
      ) : null}
    </article>
  );
};

export { KIND_WORDS, ScamResult, VERDICT_WORDS };

export type { Review };
