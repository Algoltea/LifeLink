"use client";

import {
  answerFreely,
  choose,
  recapOf,
  start,
} from "@lifelink/rehearsals/rehearsal";
import type { Rehearsal } from "@lifelink/rehearsals/rehearsal";
import { turnOf } from "@lifelink/rehearsals/script";
import type { Script } from "@lifelink/rehearsals/script";
import { scriptById, scripts } from "@lifelink/rehearsals/scripts";
import { Button } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { CopyIcon, MicIcon } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";

import {
  ReadAloudButton,
  SimulatedPill,
  useAutoReadAloud,
} from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import {
  dictationAvailable,
  startDictation,
} from "@/components/voice/dictation";
import { useBrowserCapability } from "@/lib/browser-capability";

import { loadRehearsal, saveRehearsal } from "./storage";

const NOTHING_REAL =
  "These are practice conversations with made-up people. Nothing you say here is sent, booked, or saved to your account.";

const subscribeToNothing = () => () => {
  // Nothing changes after mount; the snapshot only tells server from client.
};

const onClient = () => true;

const onServer = () => false;

const ScriptList = ({ onStart }: { onStart: (script: Script) => void }) => (
  <section aria-labelledby="choose-heading" className="flex flex-col gap-4">
    <h2 className="text-2xl leading-8 font-semibold" id="choose-heading">
      Choose a situation
    </h2>
    <ul className="grid gap-4 md:grid-cols-2">
      {scripts.map((script) => (
        <li
          className="border-border bg-raised flex flex-col gap-3 rounded-xl border px-5 py-5"
          key={script.id}
        >
          <h3 className="text-xl font-semibold">{script.title}</h3>
          <p className="text-lg leading-7">{script.summary}</p>
          <p className="text-muted-foreground text-base">
            You’ll talk with: {script.role}.
          </p>
          <Button
            className="self-start whitespace-normal"
            onClick={() => onStart(script)}
          >
            Start practising
            <span className="sr-only">: {script.title}</span>
          </Button>
        </li>
      ))}
    </ul>
  </section>
);

const OwnWords = ({ onAnswer }: { onAnswer: (words: string) => void }) => {
  const [words, setWords] = useState("");
  const [listening, setListening] = useState(false);
  const dictation = useRef<{ stop: () => void } | null>(null);
  const canDictate = useBrowserCapability(dictationAvailable);
  const inputId = useId();

  useEffect(() => () => dictation.current?.stop(), []);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        dictation.current?.stop();
        onAnswer(words);
        setWords("");
      }}
    >
      <Label htmlFor={inputId}>Or say it your own way</Label>
      <Textarea
        id={inputId}
        maxLength={300}
        onChange={(event) => setWords(event.target.value)}
        rows={2}
        value={words}
      />
      <div className="flex flex-wrap gap-3">
        <Button
          className="whitespace-normal"
          disabled={words.trim().length === 0}
          type="submit"
          variant="outline"
        >
          Say this
        </Button>
        {canDictate ? (
          <Button
            aria-pressed={listening}
            onClick={() => {
              if (listening) {
                dictation.current?.stop();

                return;
              }

              dictation.current = startDictation(
                (heard) => setWords(heard),
                () => {
                  dictation.current = null;
                  setListening(false);
                }
              );
              setListening(dictation.current !== null);
            }}
            type="button"
            variant="outline"
          >
            <MicIcon aria-hidden="true" />
            {listening ? "Stop listening" : "Speak instead"}
          </Button>
        ) : null}
      </div>
    </form>
  );
};

const copyPhrase = async (phrase: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(phrase);
    toast.success("Copied.");
  } catch {
    toast.error(
      "This browser would not copy it. You can select the words instead."
    );
  }
};

const RecapView = ({
  onAgain,
  onChooseAnother,
  rehearsal,
  script,
}: {
  onAgain: () => void;
  onChooseAnother: () => void;
  rehearsal: Rehearsal;
  script: Script;
}) => {
  const recap = recapOf(script, rehearsal);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="recap-heading"
      className="bg-surface flex flex-col gap-5 rounded-xl px-5 py-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2
          className="text-2xl leading-8 font-semibold outline-none"
          id="recap-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          End of practice
        </h2>
        <SimulatedPill />
      </div>
      <p className="text-lg font-semibold">{recap.notice}</p>

      <section
        aria-labelledby="practised-heading"
        className="flex flex-col gap-2"
      >
        <h3 className="text-xl font-semibold" id="practised-heading">
          What you practised
        </h3>
        <ul className="flex list-disc flex-col gap-1 pl-6 text-lg">
          {recap.practised.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="phrases-heading"
        className="flex flex-col gap-3"
      >
        <h3 className="text-xl font-semibold" id="phrases-heading">
          Words to remember
        </h3>
        <ul className="flex flex-col gap-3">
          {recap.phrases.map((phrase) => (
            <li
              className="border-rule flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between"
              key={phrase}
            >
              <span className="text-lg">“{phrase}”</span>
              <span className="flex flex-wrap gap-2">
                <ReadAloudButton label="Read aloud" text={phrase} />
                <Button
                  aria-label={`Copy: ${phrase}`}
                  onClick={() => copyPhrase(phrase)}
                  size="sm"
                  variant="outline"
                >
                  <CopyIcon aria-hidden="true" />
                  Copy
                </Button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {recap.yourWords.length > 0 ? (
        <section aria-labelledby="said-heading" className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold" id="said-heading">
            What you said
          </h3>
          <ol className="flex list-decimal flex-col gap-1 pl-6 text-lg">
            {recap.yourWords.map((words, index) => (
              // The same words can be said twice; their order never changes.
              <li key={`${index}-${words}`}>{words}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {script.forReal === null ? null : (
        <p className="text-lg leading-7">
          Ready to do it for real? In{" "}
          <Link className="font-semibold underline" href="/ask">
            Ask LifeLink
          </Link>
          , you could say: “{script.forReal}” You’ll review exactly what will be
          sent before anything happens.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={onAgain}>Practise this again</Button>
        <Button onClick={onChooseAnother} variant="outline">
          Choose another situation
        </Button>
      </div>
    </section>
  );
};

const Conversation = ({
  onChange,
  onChooseAnother,
  rehearsal,
  script,
}: {
  onChange: (rehearsal: Rehearsal) => void;
  onChooseAnother: () => void;
  rehearsal: Rehearsal;
  script: Script;
}) => {
  const turn = turnOf(script, rehearsal.turnId);
  const latest = rehearsal.lines.at(-1);
  const latestRef = useRef<HTMLLIElement>(null);
  const lineCount = rehearsal.lines.length;

  useAutoReadAloud(latest?.from === "them" ? latest.text : null);

  // After each answer, bring the newest line into view and focus for screen readers.
  useEffect(() => {
    if (lineCount > 1) {
      latestRef.current?.focus();
    }
  }, [lineCount]);

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="practice-heading"
        className="border-border bg-raised flex flex-col gap-4 rounded-xl border px-5 py-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2
            className="text-2xl leading-8 font-semibold"
            id="practice-heading"
          >
            {script.title} (practice)
          </h2>
          <SimulatedPill />
        </div>
        <p className="text-lg leading-7">{script.setting}</p>
        <ol aria-live="polite" className="flex flex-col gap-3">
          {rehearsal.lines.map((line, index) => (
            <li
              className={
                line.from === "them"
                  ? "border-border bg-parchment flex max-w-prose flex-col gap-1 rounded-xl border px-5 py-4 outline-none"
                  : "bg-surface flex max-w-prose flex-col gap-1 self-end rounded-xl px-5 py-4 outline-none"
              }
              // Lines are only ever appended, so their position is a stable identity.
              key={`${index}-${line.from}`}
              ref={index === lineCount - 1 ? latestRef : undefined}
              tabIndex={index === lineCount - 1 ? -1 : undefined}
            >
              <span className="text-muted-foreground text-base font-semibold">
                {line.speaker}
              </span>
              <span className="text-lg leading-7">{line.text}</span>
              {line.feedback ? (
                <span className="text-base leading-6">{line.feedback}</span>
              ) : null}
            </li>
          ))}
        </ol>
        {latest?.from === "them" ? (
          <ReadAloudButton
            className="self-start"
            label={`Hear what ${latest.speaker} said`}
            text={latest.text}
          />
        ) : null}
      </section>

      {rehearsal.finished || turn === null ? (
        <RecapView
          onAgain={() => onChange(start(script))}
          onChooseAnother={onChooseAnother}
          rehearsal={rehearsal}
          script={script}
        />
      ) : (
        <section
          aria-labelledby="answer-heading"
          className="bg-surface flex flex-col gap-4 rounded-xl px-5 py-6"
        >
          <h2 className="text-2xl leading-8 font-semibold" id="answer-heading">
            Your turn
          </h2>
          <p className="text-muted-foreground text-base">
            Pick an answer, or say it your own way. There are no wrong answers
            here.
          </p>
          <ul className="flex flex-col gap-3">
            {turn.choices.map((choice) => (
              <li key={choice.id}>
                <Button
                  className="h-auto w-full justify-start py-3 text-left whitespace-normal"
                  onClick={() => onChange(choose(script, rehearsal, choice.id))}
                  variant="outline"
                >
                  “{choice.says}”
                </Button>
              </li>
            ))}
          </ul>
          <OwnWords
            onAnswer={(words) =>
              onChange(answerFreely(script, rehearsal, words))
            }
          />
          <Button
            className="self-start"
            onClick={onChooseAnother}
            variant="ghost"
          >
            Stop and choose another situation
          </Button>
        </section>
      )}
    </div>
  );
};

const PracticeStudio = () => {
  const [rehearsal, setRehearsal] = useState<Rehearsal | null>(() =>
    loadRehearsal()
  );

  const script = rehearsal === null ? null : scriptById(rehearsal.scriptId);

  const update = (next: Rehearsal | null): void => {
    setRehearsal(next);
    saveRehearsal(next);
  };

  if (rehearsal === null || script === null) {
    return <ScriptList onStart={(chosen) => update(start(chosen))} />;
  }

  return (
    <Conversation
      onChange={update}
      onChooseAnother={() => update(null)}
      rehearsal={rehearsal}
      script={script}
    />
  );
};

/**
 * Practice everyday conversations with made-up people. Scripted, so it works
 * without any provider, and kept in this browser: nothing here reaches
 * LifeLink's server, so nothing can be booked, sent, or saved.
 */
const PracticeScreen = () => {
  const isClient = useSyncExternalStore(subscribeToNothing, onClient, onServer);

  return (
    <>
      <PageHeader subline={NOTHING_REAL} title="Conversation practice" />
      {isClient ? (
        <PracticeStudio />
      ) : (
        <output className="bg-parchment text-body block rounded-lg px-4 py-3">
          Getting the practice ready.
        </output>
      )}
    </>
  );
};

export { PracticeScreen };
