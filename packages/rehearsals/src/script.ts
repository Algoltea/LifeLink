/**
 * The shape of a practice conversation. A script is a small graph of turns:
 * the other person says something, and the person picks a suggested answer
 * or says it their own way. A turn with no choices ends the conversation.
 *
 * Scripts are fiction. They name roles, never real contacts, and nothing in
 * them can book, send, or save anything.
 */

interface Choice {
  /** Encouraging, specific, never a score. */
  feedback: string;
  id: string;
  /** The turn this answer leads to. */
  next: string;
  /** The words the person says. */
  says: string;
}

interface Turn {
  choices: readonly Choice[];
  /** Feedback for an answer in the person's own words; it is accepted, never graded. */
  freeFeedback: string;
  /** Where an answer in the person's own words leads. */
  freeNext: string;
  id: string;
  says: string;
  speaker: string;
}

interface Script {
  /** Words to try in Ask LifeLink when the person is ready to do it for real. */
  forReal: string | null;
  id: string;
  /** Useful words to remember, shown and read aloud in the recap. */
  phrases: readonly string[];
  /** What the person practised, for the recap. */
  practised: readonly string[];
  /** The fictional other person. */
  role: string;
  /** What is going on, shown before the first turn. */
  setting: string;
  start: string;
  summary: string;
  title: string;
  turns: readonly Turn[];
}

const MAX_TURNS = 8;

const isEnding = (turn: Turn): boolean => turn.choices.length === 0;

const turnOf = (script: Script, id: string): Turn | null =>
  script.turns.find((turn) => turn.id === id) ?? null;

const nextIdsOf = (turn: Turn): string[] =>
  isEnding(turn)
    ? []
    : [...turn.choices.map((choice) => choice.next), turn.freeNext];

/** The longest number of turns any path can take, or null when a path can loop. */
const longestPath = (script: Script): number | null => {
  const depth = new Map<string, number>();
  const visiting = new Set<string>();

  const walk = (id: string): number | null => {
    const known = depth.get(id);

    if (known !== undefined) {
      return known;
    }

    if (visiting.has(id)) {
      return null;
    }

    const turn = turnOf(script, id);

    if (turn === null) {
      return null;
    }

    visiting.add(id);
    let deepest = 0;

    for (const next of nextIdsOf(turn)) {
      const below = walk(next);

      if (below === null) {
        return null;
      }

      deepest = Math.max(deepest, below);
    }

    visiting.delete(id);
    depth.set(id, deepest + 1);

    return deepest + 1;
  };

  return walk(script.start);
};

/** Every problem that would leave someone stuck or confused. An empty list means the script is sound. */
const scriptProblems = (script: Script): string[] => {
  const problems: string[] = [];
  const ids = new Set(script.turns.map((turn) => turn.id));

  if (ids.size !== script.turns.length) {
    problems.push("Two turns share an id.");
  }

  if (!ids.has(script.start)) {
    problems.push(`The start turn "${script.start}" does not exist.`);
  }

  for (const turn of script.turns) {
    for (const next of nextIdsOf(turn)) {
      if (!ids.has(next)) {
        problems.push(`Turn "${turn.id}" leads to a missing turn "${next}".`);
      }
    }

    if (turn.choices.length > 3) {
      problems.push(`Turn "${turn.id}" offers more than three choices.`);
    }

    const choiceIds = new Set(turn.choices.map((choice) => choice.id));

    if (choiceIds.size !== turn.choices.length) {
      problems.push(`Turn "${turn.id}" has two choices with the same id.`);
    }
  }

  const longest = longestPath(script);

  if (longest === null) {
    problems.push("A path loops or never ends.");
  } else if (longest > MAX_TURNS) {
    problems.push(`A path takes ${longest} turns; keep it to ${MAX_TURNS}.`);
  }

  return problems;
};

export { MAX_TURNS, isEnding, longestPath, scriptProblems, turnOf };

export type { Choice, Script, Turn };
