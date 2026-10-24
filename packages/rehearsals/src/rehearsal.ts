/**
 * Playing a practice conversation. Pure functions over plain data, so a
 * rehearsal can be saved and resumed in the browser and tested here. Nothing
 * in a rehearsal reaches LifeLink's server: it cannot book, send, or save.
 */
import { z } from "zod";

import { isEnding, turnOf } from "./script";
import type { Script } from "./script";
import { scriptById } from "./scripts";

const PRACTICE_NOTICE =
  "This was practice. No appointment was booked and no message was sent.";

const MAX_OWN_WORDS = 300;

interface Line {
  /** Feedback on the person's answer; empty for the other person's lines. */
  feedback: string;
  from: "them" | "you";
  speaker: string;
  text: string;
}

interface Rehearsal {
  finished: boolean;
  lines: readonly Line[];
  scriptId: string;
  turnId: string;
}

interface Recap {
  notice: string;
  phrases: readonly string[];
  practised: readonly string[];
  title: string;
  /** What the person said, in order. */
  yourWords: readonly string[];
}

const themLine = (speaker: string, text: string): Line => ({
  feedback: "",
  from: "them",
  speaker,
  text,
});

const start = (script: Script): Rehearsal => {
  const first = turnOf(script, script.start);

  if (first === null) {
    throw new Error(`The practice "${script.id}" has no first turn.`);
  }

  return {
    finished: isEnding(first),
    lines: [themLine(first.speaker, first.says)],
    scriptId: script.id,
    turnId: first.id,
  };
};

const advance = (
  script: Script,
  rehearsal: Rehearsal,
  said: { feedback: string; next: string; text: string }
): Rehearsal => {
  const next = turnOf(script, said.next);

  if (next === null) {
    return rehearsal;
  }

  return {
    finished: isEnding(next),
    lines: [
      ...rehearsal.lines,
      { feedback: said.feedback, from: "you", speaker: "You", text: said.text },
      themLine(next.speaker, next.says),
    ],
    scriptId: rehearsal.scriptId,
    turnId: next.id,
  };
};

/** Answer with one of the suggested choices. */
const choose = (
  script: Script,
  rehearsal: Rehearsal,
  choiceId: string
): Rehearsal => {
  const turn = turnOf(script, rehearsal.turnId);
  const choice = turn?.choices.find((candidate) => candidate.id === choiceId);

  if (rehearsal.finished || choice === undefined) {
    return rehearsal;
  }

  return advance(script, rehearsal, {
    feedback: choice.feedback,
    next: choice.next,
    text: choice.says,
  });
};

/** Answer in the person's own words. They are accepted as said, never graded. */
const answerFreely = (
  script: Script,
  rehearsal: Rehearsal,
  words: string
): Rehearsal => {
  const turn = turnOf(script, rehearsal.turnId);
  const text = words.trim().slice(0, MAX_OWN_WORDS);

  if (rehearsal.finished || turn === null || text.length === 0) {
    return rehearsal;
  }

  return advance(script, rehearsal, {
    feedback: turn.freeFeedback,
    next: turn.freeNext,
    text,
  });
};

const recapOf = (script: Script, rehearsal: Rehearsal): Recap => ({
  notice: PRACTICE_NOTICE,
  phrases: script.phrases,
  practised: script.practised,
  title: script.title,
  yourWords: rehearsal.lines
    .filter((line) => line.from === "you")
    .map((line) => line.text),
});

// ── Saving and resuming ───────────────────────────────────────────────────

const SAVE_VERSION = 1;

const savedSchema = z.object({
  rehearsal: z.object({
    finished: z.boolean(),
    lines: z
      .array(
        z.object({
          feedback: z.string().max(1000),
          from: z.enum(["them", "you"]),
          speaker: z.string().max(100),
          text: z.string().max(1000),
        })
      )
      .max(40),
    scriptId: z.string(),
    turnId: z.string(),
  }),
  version: z.literal(SAVE_VERSION),
});

type JsonValue =
  | JsonObject
  | readonly JsonValue[]
  | boolean
  | number
  | string
  | null;

interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}

const readJson = (text: string): JsonValue | undefined => {
  try {
    const value: JsonValue = JSON.parse(text);

    return value;
  } catch {
    return undefined;
  }
};

const serializeRehearsal = (rehearsal: Rehearsal): string =>
  JSON.stringify({ rehearsal, version: SAVE_VERSION });

/** A saved rehearsal, or null when it is damaged or no longer matches its script. */
const parseRehearsal = (saved: string): Rehearsal | null => {
  const parsed = savedSchema.safeParse(readJson(saved));

  if (!parsed.success) {
    return null;
  }

  const { rehearsal } = parsed.data;
  const script = scriptById(rehearsal.scriptId);
  const turn = script === null ? null : turnOf(script, rehearsal.turnId);

  if (turn === null || isEnding(turn) !== rehearsal.finished) {
    return null;
  }

  return rehearsal;
};

export {
  PRACTICE_NOTICE,
  answerFreely,
  choose,
  parseRehearsal,
  recapOf,
  serializeRehearsal,
  start,
};

export type { Line, Recap, Rehearsal };
