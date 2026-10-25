"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { ChevronDownIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

import { ReadAloudButton } from "@/components/app/bits";
import { usePresentationDemo } from "@/components/app/presentation-demo";
import { ErrorNote } from "@/components/app/states";
import { messagesFor, useLocale, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

type Explanation = Doc<"messageExplanations">;

type ExplainSource = { emailId: Id<"emails"> } | { messageId: Id<"messages"> };

const useWords = () => useMessages().explanation;

const methodWords = (
  explanation: Explanation,
  locale: InterfaceLocale,
  presentationDemo: boolean
): string => {
  const words = messagesFor(locale).explanation;

  if (explanation.method === "cloud") {
    return words.cloud;
  }

  if (presentationDemo && explanation.localReason === "practice") {
    return words.local.chosen;
  }

  return words.local[explanation.localReason ?? "chosen"];
};

const contentLanguage = (explanation: Explanation): string =>
  explanation.method === "cloud"
    ? (explanation.helpStyle?.language ?? "en")
    : "en";

const formatIsoDate = (isoDate: string, locale: InterfaceLocale): string =>
  new Intl.DateTimeFormat(intlLocaleOf(locale), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
  }).format(new Date(`${isoDate}T12:00:00Z`));

/** Local rules only write English, so only other interface languages need the notice. */
const needsLanguageNotice = (
  explanation: Explanation,
  locale: InterfaceLocale
): boolean => explanation.method === "local" && locale !== "en";

/** Everything worth reading aloud, with guesses named as guesses. */
const spokenText = (
  explanation: Explanation,
  locale: InterfaceLocale
): string => {
  const words = messagesFor(locale).explanation;

  return [
    needsLanguageNotice(explanation, locale) ? words.localLanguageNotice : "",
    explanation.plainSummary,
    ...explanation.requests.map((item) =>
      words.requestSpoken(item.text, item.quote)
    ),
    ...explanation.dates.map((date) =>
      words.dateSpoken(
        date.quote,
        date.isoDate ? formatIsoDate(date.isoDate, locale) : ""
      )
    ),
    ...explanation.missingDetails.map((detail) => words.missingSpoken(detail)),
    explanation.interpretations.length > 0 ? words.guessNote : "",
    ...explanation.interpretations.map((item) => words.guessSpoken(item.text)),
  ]
    .filter((part) => part.length > 0)
    .join(" ");
};

const SMALL_LABEL = "text-muted-foreground text-label font-semibold";

/** One short labelled row: the label above, the answer under it. */
const Field = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className="flex flex-col gap-0.5">
    <dt className={SMALL_LABEL}>{label}</dt>
    <dd className="text-lg">{children}</dd>
  </div>
);

const Quote = ({ children }: { children: string }) => (
  <blockquote className="text-muted-foreground text-base italic">
    “{children}”
  </blockquote>
);

/** Quotes, stated facts, and guesses: there to check, folded away by default. */
const MoreDetail = ({ explanation }: { explanation: Explanation }) => {
  const words = useWords();
  const language = contentLanguage(explanation);

  const empty =
    explanation.droppedCount === 0 &&
    explanation.requests.length === 0 &&
    explanation.statedFacts.length === 0 &&
    explanation.interpretations.length === 0;

  if (empty) {
    return null;
  }

  return (
    <details className="group border-rule border-t">
      <summary className="text-label min-h-control flex cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 transition-transform group-open:rotate-180"
        />
        {words.moreDetail}
      </summary>
      <div className="flex flex-col gap-4 pb-2">
        {explanation.droppedCount > 0 ? (
          <p className="text-base">{words.droppedNote}</p>
        ) : null}
        {explanation.requests.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className={SMALL_LABEL}>{words.requests}</p>
            {explanation.requests.map((item) => (
              <Quote key={item.quote}>{item.quote}</Quote>
            ))}
          </div>
        ) : null}
        {explanation.statedFacts.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className={SMALL_LABEL}>{words.facts}</p>
            <ul className="flex flex-col gap-2">
              {explanation.statedFacts.map((item) => (
                <li className="flex flex-col gap-0.5" key={item.quote}>
                  <span className="text-base" lang={language}>
                    {item.text}
                  </span>
                  <Quote>{item.quote}</Quote>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {explanation.interpretations.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className={SMALL_LABEL}>{words.guesses}</p>
            <p className="text-base">{words.guessNote}</p>
            <ul className="flex flex-col gap-2">
              {explanation.interpretations.map((item) => (
                <li className="flex flex-col gap-0.5" key={item.text}>
                  <span className="text-base" lang={language}>
                    {item.text}
                  </span>
                  <span
                    className="text-muted-foreground text-base"
                    lang={language}
                  >
                    {item.why}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
};

const ExplanationBody = ({
  explanation,
  onUseReply,
}: {
  explanation: Explanation;
  onUseReply: (draft: string) => void;
}) => {
  const locale = useLocale();
  const words = useWords();
  const presentationDemo = usePresentationDemo();
  const language = contentLanguage(explanation);

  const hasFields =
    explanation.requests.length > 0 ||
    explanation.dates.length > 0 ||
    explanation.missingDetails.length > 0;

  return (
    <>
      <p
        className="min-w-0 text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap"
        lang={language}
      >
        {explanation.plainSummary}
      </p>
      {hasFields ? (
        <dl className="flex flex-col gap-2.5">
          {explanation.requests.length > 0 ? (
            <Field label={words.requests}>
              <ul className="flex flex-col gap-1">
                {explanation.requests.map((item) => (
                  <li key={item.quote} lang={language}>
                    {item.text}
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}
          {explanation.dates.length > 0 ? (
            <Field label={words.dates}>
              <ul className="flex flex-col gap-1">
                {explanation.dates.map((date) => (
                  <li key={date.quote}>
                    {date.isoDate
                      ? formatIsoDate(date.isoDate, locale)
                      : `“${date.quote}”`}
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}
          {explanation.missingDetails.length > 0 ? (
            <Field label={words.missing}>
              <ul className="flex flex-col gap-1">
                {explanation.missingDetails.map((detail) => (
                  <li key={detail} lang={language}>
                    {detail}
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}
        </dl>
      ) : null}
      {explanation.suggestedReplies.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className={SMALL_LABEL}>{words.replies}</p>
          <div className="flex flex-wrap gap-2">
            {explanation.suggestedReplies.map((reply) => (
              <Button
                aria-label={words.replyLabelFor(reply.label)}
                className="rounded-full whitespace-normal"
                key={reply.kind}
                onClick={() => onUseReply(reply.draft)}
                size="sm"
                variant="outline"
              >
                {reply.label}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-label">
            {words.repliesHint}
          </p>
        </div>
      ) : null}
      <MoreDetail explanation={explanation} />
      <div className="text-muted-foreground text-label flex flex-col gap-1">
        <p>{methodWords(explanation, locale, presentationDemo)}</p>
        {needsLanguageNotice(explanation, locale) ? (
          <p>{words.localLanguageNotice}</p>
        ) : null}
      </div>
    </>
  );
};

/**
 * "Help me understand this": a private explanation of one received message
 * or email. Opening it asks for a cloud reading at once; replies only fill
 * the person's own message box.
 */
const ExplanationPanel = ({
  onClose,
  returnFocusRef,
  onUseReply,
  source,
}: {
  onClose?: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
  onUseReply: (draft: string) => void;
  source: ExplainSource;
}) => {
  const explanation = useQuery(api.explanations.forSource, source);
  const request = useMutation(api.explanations.request);
  const locale = useLocale();
  const words = useWords();
  const [asking, setAsking] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const started = useRef(false);

  const explain = async (): Promise<void> => {
    setFailure(null);
    setAsking(true);

    try {
      await request({ ...source, allowCloudAnalysis: true });
    } catch (error) {
      setFailure(messageOf(error instanceof Error ? error : null));
    }

    setAsking(false);
  };

  // Move focus to the panel when it opens; the parent remounts it for each message.
  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  // Ask once per opening. The backend returns a reading that still fits instead of making another.
  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;
    void explain();
  });

  // A cloud reading already on screen stays put while the request settles.
  const shown =
    explanation &&
    explanation.status !== "explaining" &&
    !(asking && explanation.method !== "cloud")
      ? explanation
      : null;

  let body: ReactNode = (
    <p className="text-muted-foreground flex items-center gap-2 pb-1 text-lg">
      <LoaderCircleIcon
        aria-hidden="true"
        className="size-5 shrink-0 motion-safe:animate-spin"
      />
      {words.reading}
    </p>
  );

  if (failure !== null) {
    body = (
      <ErrorNote
        onRetry={() => {
          void explain();
        }}
      >
        {failure}
      </ErrorNote>
    );
  } else if (shown !== null) {
    body = <ExplanationBody explanation={shown} onUseReply={onUseReply} />;
  }

  return (
    <section
      aria-label={words.title}
      aria-live="polite"
      className="border-rule bg-parchment text-foreground flex min-w-0 scroll-mt-24 flex-col gap-3 rounded-[1.111rem] border px-5 pt-1.5 pb-5 outline-none"
      id="explanation-panel"
      ref={sectionRef}
      tabIndex={-1}
    >
      <div className="-mr-3.5 flex items-center gap-1">
        <p className="text-muted-foreground text-label min-w-0 flex-1">
          {words.onlyYou}
        </p>
        {shown === null || failure !== null ? null : (
          <ReadAloudButton
            className="px-3 text-[0.889rem]"
            text={spokenText(shown, locale)}
            variant="ghost"
          />
        )}
        {onClose ? (
          <Button
            aria-label={words.close}
            onClick={() => {
              if (returnFocusRef?.current?.isConnected) {
                returnFocusRef.current.focus();
              }

              onClose?.();
            }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <XIcon />
          </Button>
        ) : null}
      </div>
      {body}
    </section>
  );
};

export { ExplanationPanel };

export type { ExplainSource };
