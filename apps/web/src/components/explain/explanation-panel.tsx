"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { toast } from "sonner";

import { ModePill, ReadAloudButton } from "@/components/app/bits";
import { OneAtATime } from "@/components/app/one-at-a-time";
import type { Step } from "@/components/app/one-at-a-time";
import { usePreferences } from "@/components/app/preferences";
import { LoadingRows } from "@/components/app/states";
import { currentIntlLocale, getLocale, useLocale } from "@/i18n/locale";
import { explanation as en } from "@/i18n/messages/en/explanation";
import { explanation as es } from "@/i18n/messages/es/explanation";
import { messageOf } from "@/lib/errors";

type Explanation = Doc<"messageExplanations">;

type ExplainSource = { emailId: Id<"emails"> } | { messageId: Id<"messages"> };

type HeadingLevel = 2 | 3;

const catalogs = { en, es };

const currentWords = () => catalogs[getLocale()];

const useWords = () => catalogs[useLocale()];

const methodWords = (explanation: Explanation): string =>
  explanation.method === "cloud"
    ? currentWords().cloud
    : currentWords().local[explanation.localReason ?? "chosen"];

const contentLanguage = (explanation: Explanation): string =>
  explanation.method === "cloud"
    ? (explanation.helpStyle?.language ?? "en")
    : "en";

const formatIsoDate = (isoDate: string): string =>
  new Intl.DateTimeFormat(currentIntlLocale(), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
  }).format(new Date(`${isoDate}T12:00:00Z`));

const Heading = ({
  children,
  id,
  level,
}: {
  children: ReactNode;
  id?: string;
  level: HeadingLevel | 4;
}) => {
  if (level === 2) {
    return (
      <h2 className="text-2xl leading-8 font-semibold" id={id}>
        {children}
      </h2>
    );
  }

  if (level === 3) {
    return (
      <h3 className="text-xl font-semibold" id={id}>
        {children}
      </h3>
    );
  }

  return (
    <h4 className="text-lg font-semibold" id={id}>
      {children}
    </h4>
  );
};

const Part = ({
  children,
  level,
  title,
}: {
  children: ReactNode;
  level: HeadingLevel;
  title: string;
}) => {
  const id = useId();

  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <Heading id={id} level={level === 2 ? 3 : 4}>
        {title}
      </Heading>
      {children}
    </section>
  );
};

const Quote = ({ children }: { children: string }) => (
  <blockquote className="text-muted-foreground text-base italic">
    “{children}”
  </blockquote>
);

/** Everything worth reading aloud, with guesses named as guesses. */
const spokenText = (explanation: Explanation): string =>
  [
    explanation.method === "local" ? currentWords().localLanguageNotice : "",
    explanation.plainSummary,
    ...explanation.requests.map((item) =>
      currentWords().requestSpoken(item.text, item.quote)
    ),
    ...explanation.dates.map((date) =>
      currentWords().dateSpoken(
        date.quote,
        date.isoDate ? formatIsoDate(date.isoDate) : ""
      )
    ),
    ...explanation.missingDetails.map((detail) =>
      currentWords().missingSpoken(detail)
    ),
    explanation.interpretations.length > 0 ? currentWords().guessNote : "",
    ...explanation.interpretations.map((item) =>
      currentWords().guessSpoken(item.text)
    ),
  ]
    .filter((part) => part.length > 0)
    .join(" ");

/** The explanation's sections, in reading order; empty sections are left out. */
const sectionsOf = (
  explanation: Explanation,
  level: HeadingLevel,
  onUseReply: (draft: string) => void
): Step[] => {
  const words = currentWords();
  const language = contentLanguage(explanation);

  const steps: Step[] = [
    {
      content: (
        <Part level={level} title={words.inPlainWords}>
          <p
            className="min-w-0 text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap"
            lang={language}
          >
            {explanation.plainSummary}
          </p>
        </Part>
      ),
      key: "summary",
    },
  ];

  if (explanation.requests.length > 0) {
    steps.push({
      content: (
        <Part level={level} title={words.requests}>
          <ul className="flex flex-col gap-3">
            {explanation.requests.map((item) => (
              <li className="flex flex-col gap-1" key={item.quote}>
                <span className="text-lg" lang={language}>
                  {item.text}
                </span>
                <Quote>{item.quote}</Quote>
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "requests",
    });
  }

  if (explanation.dates.length > 0) {
    steps.push({
      content: (
        <Part level={level} title={words.dates}>
          <ul className="flex flex-col gap-2 text-lg">
            {explanation.dates.map((date) => (
              <li key={date.quote}>
                “{date.quote}”
                {date.isoDate ? ` (${formatIsoDate(date.isoDate)})` : ""}
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "dates",
    });
  }

  if (explanation.missingDetails.length > 0) {
    steps.push({
      content: (
        <Part level={level} title={words.missing}>
          <ul className="flex list-disc flex-col gap-1 pl-6 text-lg">
            {explanation.missingDetails.map((detail) => (
              <li key={detail} lang={language}>
                {detail}
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "missing",
    });
  }

  if (explanation.statedFacts.length > 0) {
    steps.push({
      content: (
        <Part level={level} title={words.facts}>
          <ul className="flex flex-col gap-3">
            {explanation.statedFacts.map((item) => (
              <li className="flex flex-col gap-1" key={item.quote}>
                <span className="text-lg" lang={language}>
                  {item.text}
                </span>
                <Quote>{item.quote}</Quote>
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "facts",
    });
  }

  if (explanation.interpretations.length > 0) {
    steps.push({
      content: (
        <Part level={level} title={words.guesses}>
          <p className="text-base font-semibold">{words.guessNote}</p>
          <ul className="flex flex-col gap-3">
            {explanation.interpretations.map((item) => (
              <li className="flex flex-col gap-1" key={item.text}>
                <span className="text-lg" lang={language}>
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
        </Part>
      ),
      key: "guesses",
    });
  }

  if (explanation.suggestedReplies.length > 0) {
    steps.push({
      content: (
        <Part level={level} title={words.replies}>
          <p className="text-muted-foreground text-base">{words.repliesHint}</p>
          <ul className="flex flex-col gap-4">
            {explanation.suggestedReplies.map((reply) => (
              <li
                className="border-rule flex flex-col gap-2 border-b pb-4"
                key={reply.kind}
              >
                <span className="text-lg font-bold" lang={language}>
                  {reply.label}
                </span>
                <p
                  className="text-lg leading-7 whitespace-pre-wrap"
                  lang={language}
                >
                  {reply.draft}
                </p>
                <div className="flex flex-wrap gap-3">
                  <ReadAloudButton label={words.readReply} text={reply.draft} />
                  <Button
                    aria-label={words.useReplyLabel(reply.label)}
                    className="whitespace-normal"
                    onClick={() => onUseReply(reply.draft)}
                    variant="outline"
                  >
                    {words.useReply}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "replies",
    });
  }

  return steps;
};

const ExplanationBody = ({
  explanation,
  level,
  onUseReply,
}: {
  explanation: Explanation;
  level: HeadingLevel;
  onUseReply: (draft: string) => void;
}) => {
  const { preferences } = usePreferences();
  const words = useWords();
  const steps = sectionsOf(explanation, level, onUseReply);

  return (
    <div className="flex flex-col gap-5">
      {explanation.droppedCount > 0 ? (
        <p className="text-base font-semibold">{words.droppedNote}</p>
      ) : null}
      <ReadAloudButton
        className="self-start"
        label={words.readAloud}
        text={spokenText(explanation)}
      />
      {preferences.stepByStep ? (
        <OneAtATime noun={words.part} steps={steps} />
      ) : (
        steps.map((step) => <div key={step.key}>{step.content}</div>)
      )}
    </div>
  );
};

const RequestForm = ({
  practice,
  source,
  upgrade,
}: {
  practice: boolean;
  source: ExplainSource;
  upgrade: boolean;
}) => {
  const request = useMutation(api.explanations.request);
  const words = useWords();
  const { me } = usePreferences();
  const hasNotes = (me?.preferences?.communicationNotes ?? "").length > 0;
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const [busy, setBusy] = useState(false);
  const consentId = useId();

  if (upgrade && practice) {
    return null;
  }

  let buttonLabel = words.explainThis;

  if (allowCloudAnalysis) {
    buttonLabel = upgrade
      ? words.explainAgainWithCloud
      : words.explainWithCloud;
  }

  return (
    <div className="flex flex-col gap-3">
      {practice ? (
        <p className="text-base">{words.practiceNote}</p>
      ) : (
        <label
          className="hover:text-accent-foreground flex min-h-12 cursor-pointer items-start gap-3 text-base leading-relaxed transition-colors"
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
            {hasNotes ? words.cloudConsentWithNotes : words.cloudConsent}
          </span>
        </label>
      )}
      <Button
        aria-busy={busy}
        className="self-start whitespace-normal"
        disabled={busy || (upgrade && !allowCloudAnalysis)}
        onClick={async () => {
          setBusy(true);

          try {
            await request({ ...source, allowCloudAnalysis, refresh: upgrade });
          } catch (error) {
            toast.error(messageOf(error instanceof Error ? error : null));
          }

          setBusy(false);
        }}
        variant={upgrade ? "outline" : "default"}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

/**
 * "Help me understand this": a private explanation of one received message
 * or email, with optional replies that only fill the person's own message box.
 */
const ExplanationPanel = ({
  level = 2,
  onClose,
  returnFocusRef,
  onUseReply,
  source,
}: {
  level?: HeadingLevel;
  onClose?: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
  onUseReply: (draft: string) => void;
  source: ExplainSource;
}) => {
  const explanation = useQuery(api.explanations.forSource, source);
  const words = useWords();
  const { me } = usePreferences();
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);

  // Move focus to the panel when it opens; the parent remounts it for each message.
  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  const practice =
    me?.profile?.demoMode === true || explanation?.mode === "simulated";

  let body: ReactNode = (
    <LoadingRows layout="panel" label={words.loading} rows={2} />
  );

  if (explanation === null) {
    body = (
      <>
        <p className="text-lg">{words.intro}</p>
        <RequestForm practice={practice} source={source} upgrade={false} />
      </>
    );
  } else if (explanation?.status === "explaining") {
    body = <p className="text-lg">{words.reading}</p>;
  } else if (explanation !== undefined) {
    body = (
      <>
        <p className="text-base font-semibold">{methodWords(explanation)}</p>
        {explanation.method === "local" ? (
          <p className="text-base">{words.localLanguageNotice}</p>
        ) : null}
        <ExplanationBody
          explanation={explanation}
          level={level}
          onUseReply={onUseReply}
        />
        <RequestForm practice={practice} source={source} upgrade />
      </>
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      aria-live="polite"
      className="bg-surface text-foreground flex min-w-0 scroll-mt-24 flex-col gap-4 rounded-xl px-5 py-6"
      id="explanation-panel"
      ref={sectionRef}
      tabIndex={-1}
    >
      <div className="flex items-start justify-between gap-3">
        <Heading id={headingId} level={level}>
          {words.title}
        </Heading>
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
      <div className="flex flex-wrap items-center gap-2">
        {explanation ? <ModePill mode={explanation.mode} /> : null}
        <p className="text-muted-foreground text-base">{words.onlyYou}</p>
      </div>
      {body}
    </section>
  );
};

export { ExplanationPanel };

export type { ExplainSource };
