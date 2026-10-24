import { describe, expect, it } from "vitest";

import { makeCard } from "./cards";
import { applyMove, findHint, newGame } from "./game";
import type { GameState } from "./game";
import {
  decodeCard,
  encodeCard,
  parseSavedGame,
  SAVE_FORMAT,
  SAVED_HISTORY_LIMIT,
  serializeGame,
} from "./serialize";

const playHints = (state: GameState, steps: number): GameState => {
  let current = state;

  for (let step = 0; step < steps; step += 1) {
    const hint = findHint(current);
    const result = hint ? applyMove(current, hint) : null;

    if (!result?.ok) {
      break;
    }

    current = result.state;
  }

  return current;
};

const isHeartsAce = (code: string) => code.startsWith("H01");

const freshSave = () => JSON.parse(serializeGame(newGame({ seed: 9 })));

const reasonFor = (text: string): string => {
  const result = parseSavedGame(text);

  if (result.ok) {
    throw new Error("Expected the save to be rejected.");
  }

  return result.reason;
};

describe("card codes", () => {
  it("round-trips every card and face", () => {
    const card = makeCard("hearts", 10, true);

    expect(encodeCard(card)).toBe("H10U");
    expect(decodeCard("H10U")).toStrictEqual(card);
    expect(decodeCard("S01D")).toStrictEqual(makeCard("spades", 1, false));
    expect(decodeCard("X01D")).toBeNull();
    expect(decodeCard("H14U")).toBeNull();
  });
});

describe("save and resume", () => {
  it("round-trips a game in progress, including undo history", () => {
    const played = playHints(newGame({ drawCount: 3, seed: 2024 }), 20);

    const result = parseSavedGame(
      serializeGame(played, new Date("2026-10-23T12:00:00Z"))
    );

    if (!result.ok) {
      throw new Error(result.reason);
    }

    expect(result.savedAt).toBe("2026-10-23T12:00:00.000Z");
    expect(result.state).toStrictEqual(played);
  });

  it("keeps only the most recent undo steps", () => {
    let state = newGame({ seed: 5 });

    for (let step = 0; step < SAVED_HISTORY_LIMIT + 20; step += 1) {
      const drawn = applyMove(state, { type: "draw" });

      if (drawn.ok) {
        ({ state } = drawn);
      }
    }

    const result = parseSavedGame(serializeGame(state));

    expect(result.ok && result.state.history.length).toBe(SAVED_HISTORY_LIMIT);
  });

  it("rejects text that is not JSON or not a solitaire save", () => {
    expect(reasonFor("{not json")).toBe("The saved game could not be read.");
    expect(reasonFor("[]")).toBe("This is not a saved solitaire game.");
    expect(reasonFor(JSON.stringify({ format: "other", version: 1 }))).toBe(
      "This is not a saved solitaire game."
    );
    expect(
      reasonFor(JSON.stringify({ format: SAVE_FORMAT, version: 99 }))
    ).toBe("This save comes from a different version of the game.");
  });

  it("rejects a save with a duplicated or missing card", () => {
    const save = JSON.parse(serializeGame(newGame({ seed: 9 })));

    const [, second] = save.game.stock;

    save.game.stock[0] = second;

    expect(reasonFor(JSON.stringify(save))).toBe(
      "The saved game does not hold exactly one full deck."
    );
  });

  it("moves foundations saved in any spot to their suit's spot", () => {
    const save = JSON.parse(serializeGame(newGame({ seed: 9 })));

    // Take the ace of hearts off the table, turning up whatever it uncovers.
    save.game.stock = save.game.stock.filter(
      (code: string) => !isHeartsAce(code)
    );
    save.game.tableau = save.game.tableau.map((column: string[]) => {
      const kept = column.filter((code) => !isHeartsAce(code));
      const top = kept.at(-1);

      return kept.length < column.length && top
        ? [...kept.slice(0, -1), top.replace(/D$/u, "U")]
        : kept;
    });
    // Older saves could hold it in the first spot, which now belongs to spades.
    save.game.foundations[0] = ["H01U"];

    const result = parseSavedGame(JSON.stringify(save));

    if (!result.ok) {
      throw new Error(result.reason);
    }

    expect(result.state.foundations.map((pile) => pile.length)).toStrictEqual([
      0, 1, 0, 0,
    ]);
    expect(result.state.foundations[1]?.[0]?.id).toBe("hearts-1");
  });

  it("rejects damaged fields", () => {
    const badDraw = freshSave();
    const badCard = freshSave();
    const badColumns = freshSave();
    const faceUpStock = freshSave();

    badDraw.game.drawCount = 2;
    badCard.game.waste = ["H99U"];
    badColumns.game.tableau = badColumns.game.tableau.slice(0, 6);
    faceUpStock.game.stock[0] = faceUpStock.game.stock[0].replace(/D$/u, "U");

    expect(reasonFor(JSON.stringify(badDraw))).toBe(
      "The saved draw setting is not 1 or 3."
    );
    expect(reasonFor(JSON.stringify(badCard))).toBe(
      "The waste pile holds a card that could not be read."
    );
    expect(reasonFor(JSON.stringify(badColumns))).toBe(
      "The columns should have 7 piles."
    );
    expect(reasonFor(JSON.stringify(faceUpStock))).toBe(
      "The saved stock has a face-up card."
    );
  });
});
