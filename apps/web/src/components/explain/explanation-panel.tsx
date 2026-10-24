"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { ModePill, ReadAloudButton } from "@/components/app/bits";
import { usePreferences } from "@/components/app/preferences";
import { LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

type Explanation = Doc<"messageExplanations">;

type ExplainSource = { emailId: Id<"emails"> } | { messageId: Id<"messages"> };

type HeadingLevel = 2 | 3;

const LOCAL_WORDS: Record<NonNullable<Explanation["localReason"]>, string> = {
  chosen:
    "Local reading: found by patterns, not full understanding. Nothing was sent to an AI provider.",
  failed:
    "Local reading. You asked for a cloud reading, but it didn’t finish. The provider may already have received this message.",
  limit:
    "Local reading. Today’s limit for cloud readings has been reached, so nothing more was sent.",
  practice:
    "Practice: a local reading. Practice messages are never sent to an AI provider.",
  unavailable:
    "Local reading. The cloud assistant isn’t set up, so nothing was sent to an AI provider.",
};

const methodWords = (explanation: Explanation): string =>
  explanation.method === "cloud"
    ? "Cloud AI reading, requested with your permission. Every quote was checked against the message."
    : LOCAL_WORDS[explanation.localReason ?? "chosen"];

const DROPPED_WORDS =
  "Some details the assistant gave were not in the message word for word, so they are shown as guesses or left out.";

const GUESS_WORDS = "These are guesses, not something the message says.";

const formatIsoDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("en-US", {
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
    explanation.plainSummary,
    ...explanation.requests.map(
      (item) => `They ask: ${item.text} In their words: ${item.quote}.`
    ),
    ...explanation.dates.map(
      (date) =>
        `Date mentioned: ${date.quote}${date.isoDate ? `, ${formatIsoDate(date.isoDate)}` : ""}.`
    ),
    ...explanation.missingDetails.map((detail) => `Not said yet: ${detail}`),
    explanation.interpretations.length > 0 ? GUESS_WORDS : "",
    ...explanation.interpretations.map((item) => `A guess: ${item.text}`),
  ]
    .filter((part) => part.length > 0)
    .join(" ");

const ExplanationBody = ({
  explanation,
  level,
  onUseReply,
}: {
  explanation: Explanation;
  level: HeadingLevel;
  onUseReply: (draft: string) => void;
}) => (
  <div className="flex flex-col gap-5">
    <Part level={level} title="In plain words">
      <p className="text-lg leading-relaxed">{explanation.plainSummary}</p>
    </Part>

    {explanation.requests.length > 0 ? (
      <Part level={level} title="What they’re asking">
        <ul className="flex flex-col gap-3">
          {explanation.requests.map((item) => (
            <li className="flex flex-col gap-1" key={item.quote}>
              <span className="text-lg">{item.text}</span>
              <Quote>{item.quote}</Quote>
            </li>
          ))}
        </ul>
      </Part>
    ) : null}

    {explanation.dates.length > 0 ? (
      <Part level={level} title="Dates and times mentioned">
        <ul className="flex flex-col gap-2 text-lg">
          {explanation.dates.map((date) => (
            <li key={date.quote}>
              “{date.quote}”
              {date.isoDate ? ` (${formatIsoDate(date.isoDate)})` : ""}
            </li>
          ))}
        </ul>
      </Part>
    ) : null}

    {explanation.missingDetails.length > 0 ? (
      <Part level={level} title="Not said yet">
        <ul className="flex list-disc flex-col gap-1 pl-6 text-lg">
          {explanation.missingDetails.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </Part>
    ) : null}

    {explanation.statedFacts.length > 0 ? (
      <Part level={level} title="What the message says">
        <ul className="flex flex-col gap-3">
          {explanation.statedFacts.map((item) => (
            <li className="flex flex-col gap-1" key={item.quote}>
              <span className="text-lg">{item.text}</span>
              <Quote>{item.quote}</Quote>
            </li>
          ))}
        </ul>
      </Part>
    ) : null}

    {explanation.interpretations.length > 0 ? (
      <Part level={level} title="What it might mean">
        <p className="text-base font-semibold">{GUESS_WORDS}</p>
        <ul className="flex flex-col gap-3">
          {explanation.interpretations.map((item) => (
            <li className="flex flex-col gap-1" key={item.text}>
              <span className="text-lg">{item.text}</span>
              <span className="text-muted-foreground text-base">
                {item.why}
              </span>
            </li>
          ))}
        </ul>
      </Part>
    ) : null}

    {explanation.droppedCount > 0 ? (
      <p className="text-base font-semibold">{DROPPED_WORDS}</p>
    ) : null}

    <ReadAloudButton
      className="self-start"
      label="Read the explanation aloud"
      text={spokenText(explanation)}
    />

    {explanation.suggestedReplies.length > 0 ? (
      <Part level={level} title="Possible replies">
        <p className="text-muted-foreground text-base">
          Nothing is sent. A reply goes into your message box, where you can
          change it and review it before anything happens.
        </p>
        <ul className="flex flex-col gap-4">
          {explanation.suggestedReplies.map((reply) => (
            <li
              className="border-rule flex flex-col gap-2 border-b pb-4"
              key={reply.kind}
            >
              <span className="text-lg font-bold">{reply.label}</span>
              <p className="text-lg leading-7 whitespace-pre-wrap">
                {reply.draft}
              </p>
              <Button
                aria-label={`Use this reply: ${reply.label}`}
                className="self-start whitespace-normal"
                onClick={() => onUseReply(reply.draft)}
                variant="outline"
              >
                Use this reply
              </Button>
            </li>
          ))}
        </ul>
      </Part>
    ) : null}
  </div>
);

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
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const [busy, setBusy] = useState(false);
  const consentId = useId();

  if (upgrade && practice) {
    return null;
  }

  let buttonLabel = "Explain this message";

  if (allowCloudAnalysis) {
    buttonLabel = upgrade
      ? "Explain again with cloud AI"
      : "Explain with cloud AI";
  }

  return (
    <div className="flex flex-col gap-3">
      {practice ? (
        <p className="text-base">
          In Practice mode, LifeLink reads the message locally. Practice
          messages are never sent to an AI provider.
        </p>
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
            Use the cloud assistant for a fuller explanation. The message text
            is sent to the AI provider. Leave unchecked for a local reading.
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
            await request({ ...source, allowCloudAnalysis });
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
  onUseReply,
  source,
}: {
  level?: HeadingLevel;
  onClose?: () => void;
  onUseReply: (draft: string) => void;
  source: ExplainSource;
}) => {
  const explanation = useQuery(api.explanations.forSource, source);
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
    <LoadingRows label="Loading the explanation" rows={2} />
  );

  if (explanation === null) {
    body = (
      <>
        <p className="text-lg">
          LifeLink can say what this message asks, which dates it mentions, and
          what it leaves out.
        </p>
        <RequestForm practice={practice} source={source} upgrade={false} />
      </>
    );
  } else if (explanation?.status === "explaining") {
    body = <p className="text-lg">Reading the message…</p>;
  } else if (explanation !== undefined) {
    body = (
      <>
        <p className="text-base font-semibold">{methodWords(explanation)}</p>
        <ExplanationBody
          explanation={explanation}
          level={level}
          onUseReply={onUseReply}
        />
        {explanation.method === "local" ? (
          <RequestForm practice={practice} source={source} upgrade />
        ) : null}
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
          Help understanding this message
        </Heading>
        {onClose ? (
          <Button
            aria-label="Close the explanation"
            onClick={onClose}
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
        <p className="text-muted-foreground text-base">
          Only you can see this. It is never sent or shared with family.
        </p>
      </div>
      {body}
    </section>
  );
};

export { ExplanationPanel };

export type { ExplainSource };
