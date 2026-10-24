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
import { useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { TrustedPeople } from "./trusted-people";

type Verdict = Doc<"scamReviews">["verdict"];

type Review = Omit<Doc<"scamReviews">, "extractedText" | "imageReadable"> & {
  extractedText?: string | null;
  imageReadable?: boolean | null;
  photoUrl?: string | null;
};

type Words = Messages["scamResult"];

const VERDICT_TONES: Record<
  Verdict,
  "negative" | "neutral" | "positive" | "warning"
> = {
  likely_safe: "neutral",
  likely_scam: "negative",
  suspicious: "warning",
  unsure: "neutral",
};

const verdictOf = (verdict: Verdict, t: Words) => ({
  label: t.verdicts[verdict],
  tone: VERDICT_TONES[verdict],
});

/** Rule-based checks are written by LifeLink in English; cloud checks already use the person's language. */
const reviewText = (review: Review, text: string): string =>
  review.model.startsWith("rules") ? translateServerMessage(text) : text;

const checkMethod = (review: Review, t: Words): string => {
  if (!review.model.startsWith("rules")) {
    return review.cloudAnalysisConsent === true
      ? t.method.cloud
      : t.method.cloudOld;
  }

  if (review.cloudAnalysisConsent === undefined) {
    return t.method.rulesOld;
  }

  if (review.cloudAnalysisConsent) {
    return t.method.rulesFallback;
  }

  return t.method.rules;
};

const photoRetention = (review: Review, t: Words): string =>
  review.screenshotOwned === true
    ? t.photoRetention.owned
    : t.photoRetention.old;

type Signal = Doc<"scamReviews">["signals"][number];

const SignalList = ({
  photo,
  review,
  signals,
}: {
  photo: boolean;
  review: Review;
  signals: Signal[];
}) => {
  const t = useMessages().scamResult;

  return (
    <ul className="flex flex-col gap-5">
      {signals.map((signal, index) => (
        <li className="flex flex-col gap-1" key={`${signal.label}-${index}`}>
          <h3 className="text-lg font-semibold">
            {reviewText(review, signal.label)}
          </h3>
          {signal.quote ? (
            <blockquote className="text-neutral-ink pl-5 text-lg wrap-anywhere">
              “{signal.quote}”
            </blockquote>
          ) : null}
          <p className="text-muted-foreground text-lg">
            {reviewText(review, signal.detail)}
          </p>
          {!photo && signal.quote && signal.evidence === "image_unverified" ? (
            <p className="text-warning text-lg">{t.imageUnverified}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
};

const PhotoThumbnail = ({ url }: { url: string | null | undefined }) => {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const t = useMessages().scamResult.photo;

  if (!url || failed) {
    return (
      <p className="text-muted-foreground text-lg">
        {t.noPreview}
        {url ? t.reopen : t.readSaved}
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
        aria-label={expanded ? t.smallerAria : t.larger}
        className={cn(
          "bg-parchment relative w-full overflow-hidden rounded-xl",
          expanded ? "h-96" : "h-50"
        )}
        onClick={() => setExpanded((open) => !open)}
        type="button"
      >
        <Image
          alt={t.alt}
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
          className="w-full px-1 underline underline-offset-4"
          onClick={() => setExpanded((open) => !open)}
          variant="ghost"
        >
          {expanded ? t.smaller : t.see}
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
  const messages = useMessages();
  const t = messages.scamResult;

  return (
    <div className="border-rule flex flex-col items-start gap-3 border-t pt-4">
      {confirming ? (
        <>
          <p className="text-lg">{t.deleteConfirm}</p>
          {review.inputKind === "screenshot" ? (
            <p className="text-lg">{photoRetention(review, t)}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              aria-busy={busy}
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
              {busy ? t.deleting : t.delete}
            </Button>
            <Button
              disabled={busy}
              onClick={() => setConfirming(false)}
              variant="ghost"
            >
              {t.keep}
            </Button>
          </div>
        </>
      ) : (
        <Button onClick={() => setConfirming(true)} variant="ghost">
          <Trash2Icon aria-hidden="true" />
          {t.delete}
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
  const t = useMessages().scamResult;
  const verdict = verdictOf(review.verdict, t);

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
            {reviewText(review, review.explanation)}
          </p>
        </div>
      </div>
      <ReadAloudButton
        className="self-start"
        label={t.readAloud}
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
  const t = useMessages().scamResult;
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
        note={photo ? t.signsNotePhoto : t.signsNoteMessage}
        title={t.signCount(signs.length)}
      >
        {photo ? (
          <p className="text-warning text-lg">{t.imageUnverified}</p>
        ) : null}
        {(review.unverifiedQuoteCount ?? 0) > 0 ? (
          <p className="text-muted-foreground text-lg">{t.removedQuotes}</p>
        ) : null}
        {signs.length > 0 ? (
          <SignalList photo={photo} review={review} signals={signs} />
        ) : (
          <p className="text-lg">{t.noSigns}</p>
        )}
      </Disclosure>
      {advice.length > 0 ? (
        <Disclosure
          icon={<InfoIcon />}
          labelId={`advice-${review._id}`}
          note={t.adviceNote}
          title={t.adviceTitle}
        >
          <SignalList photo={photo} review={review} signals={advice} />
        </Disclosure>
      ) : null}
      {photo ? (
        <Disclosure
          icon={<FileTextIcon />}
          labelId={`words-${review._id}`}
          note={t.compareWithPhoto}
          title={t.allWords}
        >
          <p className="text-warning text-lg">{t.imageUnverified}</p>
          {review.extractedText?.trim() ? (
            <p className="text-lg wrap-anywhere whitespace-pre-wrap">
              {review.extractedText}
            </p>
          ) : (
            <p className="text-lg">{t.noFullWording}</p>
          )}
        </Disclosure>
      ) : null}
      {!photo && review.inputText ? (
        <Disclosure
          icon={<FileTextIcon />}
          labelId={`original-${review._id}`}
          note={t.savedWording}
          title={
            review.inputKind === "email" ? t.originalEmail : t.originalMessage
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
        title={t.howChecked}
      >
        <p className="text-lg">{checkMethod(review, t)}</p>
        <p className="text-lg">{t.confidence[review.confidence]}</p>
        <p className="text-lg">{t.cannotProve}</p>
        {photo ? <p className="text-lg">{photoRetention(review, t)}</p> : null}
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
  const t = useMessages().scamResult;

  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-section font-semibold">
        {unreadable ? t.couldNotRead : t.checkDidNotFinish}
      </h2>
      <p className="text-lg">{photo ? t.recoveryPhoto : t.recoveryMessage}</p>
      {photo ? <PhotoThumbnail url={review.photoUrl} /> : null}
      <div className="flex flex-wrap gap-3">
        {photo && onTryPhoto ? (
          <Button className="text-lg" onClick={onTryPhoto}>
            <CameraIcon aria-hidden="true" />
            {t.newPhoto}
          </Button>
        ) : null}
        {onTypeWords ? (
          <Button className="text-lg" onClick={onTypeWords} variant="outline">
            <TextIcon aria-hidden="true" />
            {t.typeWords}
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

  const messages = useMessages();
  const t = messages.scamResult;
  const verdict = verdictOf(review.verdict, t);
  const nextSteps = review.nextSteps.map((step) => reviewText(review, step));

  const spoken = [
    verdict.label,
    reviewText(review, review.explanation),
    photo ? t.imageUnverified : "",
    (review.unverifiedQuoteCount ?? 0) > 0 ? t.removedQuotes : "",
    ...review.signals
      .filter((signal) => signal.stance !== "warns_against")
      .map((signal) => reviewText(review, signal.label)),
    ...nextSteps,
  ]
    .filter(Boolean)
    .join(". ");

  if (review.status === "reviewing") {
    return (
      <div aria-live="polite" className="flex flex-col gap-3">
        <h2 className="text-section font-semibold">
          {photo ? t.readingPhoto : t.checkingMessage}
        </h2>
        <p className="text-lg">{t.waitHint}</p>
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
        {nextSteps.length > 0 ? (
          <section
            aria-labelledby={`next-${review._id}`}
            className="bg-parchment flex min-w-0 flex-col gap-4 rounded-xl p-5 sm:p-6"
          >
            <h2
              className="text-section font-semibold"
              id={`next-${review._id}`}
            >
              {t.whatNow}
            </h2>
            {preferences.stepByStep ? (
              <OneAtATime
                noun={t.step}
                steps={nextSteps.map((step, index) => ({
                  content: <p className="text-lg">{step}</p>,
                  key: `${index}-${step}`,
                }))}
              />
            ) : (
              <ol className="flex list-decimal flex-col gap-3 pl-6 text-lg">
                {nextSteps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ol>
            )}
          </section>
        ) : (
          <section className="bg-parchment flex flex-col gap-3 rounded-xl p-5 sm:p-6">
            <h2 className="text-section font-semibold">{t.whatNow}</h2>
            <p className="text-lg">{t.noStepsHint}</p>
          </section>
        )}
        <section
          aria-labelledby={`help-${review._id}`}
          className="flex min-w-0 flex-col gap-3"
        >
          <h2 className="text-section font-semibold" id={`help-${review._id}`}>
            {messages.scam.ask}
          </h2>
          <TrustedPeople reviewId={review._id} />
        </section>
      </div>
      <section
        aria-labelledby={`details-${review._id}`}
        className="flex min-w-0 flex-col gap-3"
      >
        <h2 className="text-section font-semibold" id={`details-${review._id}`}>
          {t.aboutCheck}
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
  const messages = useMessages();
  const t = messages.scamResult;
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
            {t.titles[review.inputKind]}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <ModePill mode={review.mode} />
            <p className="text-muted-foreground text-lg">
              {t.kinds[review.inputKind]} · {ago(review.createdAt, timeZone)}
            </p>
          </div>
        </div>
        {onCheckAnother ? (
          <Button onClick={onCheckAnother} variant="outline">
            {messages.scam.checkSomethingElse}
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
            {messages.scam.ask}
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

export { ScamResult, verdictOf };

export type { Review };
