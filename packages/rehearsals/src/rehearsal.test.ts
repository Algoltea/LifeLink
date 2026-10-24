import { describe, expect, it } from "vitest";

import {
  PRACTICE_NOTICE,
  answerFreely,
  choose,
  parseRehearsal,
  recapOf,
  serializeRehearsal,
  start,
} from "./rehearsal";
import type { Rehearsal } from "./rehearsal";
import { MAX_TURNS, isEnding, longestPath, scriptProblems } from "./script";
import type { Script } from "./script";
import { scriptById, scripts } from "./scripts";

const PHONE_NUMBER = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/u;
const LINK = /https?:\/\/|www\.|\.com\b/iu;

// The Practice-mode sample family and providers; rehearsals must never borrow real-looking contacts.
const SAMPLE_PEOPLE = /\b(?:Sam|Linda|Marcus|Rivera|Patel|Riverside)\b/u;

const allText = (script: Script): string =>
  [
    script.title,
    script.summary,
    script.setting,
    script.role,
    script.forReal ?? "",
    ...script.phrases,
    ...script.practised,
    ...script.turns.flatMap((turn) => [
      turn.says,
      turn.freeFeedback,
      ...turn.choices.flatMap((choice) => [choice.says, choice.feedback]),
    ]),
  ].join("\n");

/** Every path through a script, following each choice and the own-words answer. */
const everyEnding = (script: Script): Rehearsal[] => {
  const endings: Rehearsal[] = [];

  const walk = (rehearsal: Rehearsal): void => {
    if (rehearsal.finished) {
      endings.push(rehearsal);

      return;
    }

    const turn = script.turns.find(
      (candidate) => candidate.id === rehearsal.turnId
    );

    for (const choice of turn?.choices ?? []) {
      walk(choose(script, rehearsal, choice.id));
    }

    walk(answerFreely(script, rehearsal, "In my own words."));
  };

  walk(start(script));

  return endings;
};

describe.each(scripts.map((script) => [script.title, script] as const))(
  "%s",
  (_title, script) => {
    it("is sound: no dead ends, no loops, and short", () => {
      expect(scriptProblems(script)).toStrictEqual([]);
      expect(longestPath(script)).toBeLessThanOrEqual(MAX_TURNS);
    });

    it("reaches an ending with a practice recap on every path", () => {
      const endings = everyEnding(script);

      expect(endings.length).toBeGreaterThan(0);
      expect(
        endings.every(
          (ending) => recapOf(script, ending).notice === PRACTICE_NOTICE
        )
      ).toBeTruthy();
    });

    it("uses no links, phone numbers, or sample contacts", () => {
      const text = allText(script);

      expect(text).not.toMatch(LINK);
      expect(text).not.toMatch(PHONE_NUMBER);
      expect(text).not.toMatch(SAMPLE_PEOPLE);
    });

    it("has phrases to remember and things practised", () => {
      expect(script.phrases.length).toBeGreaterThan(0);
      expect(script.practised.length).toBeGreaterThan(0);
    });
  }
);

describe("playing a rehearsal", () => {
  const ride = scriptById("ask-for-ride");

  if (ride === null) {
    throw new Error("Expected the ride practice to exist.");
  }

  it("records the answer, its feedback, and the reply", () => {
    const after = choose(ride, start(ride), "clear");

    expect(after.lines.map((line) => line.from)).toStrictEqual([
      "them",
      "you",
      "them",
    ]);
    expect(after.lines[1]?.feedback).toContain("what, when, and where");
    expect(after.turnId).toBe("busy");
  });

  it("accepts the person's own words without grading them", () => {
    const after = answerFreely(
      ride,
      start(ride),
      "  Can you take me Wednesday?  "
    );

    expect(after.lines[1]).toMatchObject({
      from: "you",
      text: "Can you take me Wednesday?",
    });
  });

  it("ignores empty answers, unknown choices, and answers after the end", () => {
    const begun = start(ride);

    expect(answerFreely(ride, begun, "   ")).toBe(begun);
    expect(choose(ride, begun, "no-such-choice")).toBe(begun);

    const ended = choose(ride, choose(ride, begun, "clear"), "someone-else");

    expect(ended.finished).toBeTruthy();
    expect(choose(ride, ended, "clear")).toBe(ended);
  });

  it("recaps what the person said and that it was practice", () => {
    const ended = choose(
      ride,
      choose(ride, start(ride), "clear"),
      "check-thursday"
    );

    const recap = recapOf(ride, ended);

    expect(recap.yourWords).toHaveLength(2);
    expect(recap.notice).toBe(
      "This was practice. No appointment was booked and no message was sent."
    );
  });
});

describe("saving and resuming", () => {
  const caller = scriptById("suspicious-caller");

  if (caller === null) {
    throw new Error("Expected the caller practice to exist.");
  }

  it("round-trips a rehearsal", () => {
    const rehearsal = choose(caller, start(caller), "refuse");

    expect(parseRehearsal(serializeRehearsal(rehearsal))).toStrictEqual(
      rehearsal
    );
  });

  it.each([
    "not json",
    "{}",
    '{"version":2,"rehearsal":{}}',
    JSON.stringify({
      rehearsal: {
        finished: false,
        lines: [],
        scriptId: "no-such-script",
        turnId: "call",
      },
      version: 1,
    }),
    JSON.stringify({
      rehearsal: {
        finished: true,
        lines: [],
        scriptId: "suspicious-caller",
        turnId: "call",
      },
      version: 1,
    }),
  ])("rejects a damaged save: %s", (saved) => {
    expect(parseRehearsal(saved)).toBeNull();
  });

  it("knows an ending turn is the end", () => {
    const ending = caller.turns.find((turn) => turn.id === "ended");

    expect(ending !== undefined && isEnding(ending)).toBeTruthy();
  });
});
