import { describe, expect, it } from "vitest";

import { applyMove, availablePairs, newGame } from "./game";
import type { GameState } from "./game";
import type { ParseResult } from "./serialize";
import {
  parseSavedGame,
  SAVE_FORMAT,
  SAVED_HISTORY_LIMIT,
  serializeGame,
} from "./serialize";

const playPairs = (state: GameState, steps: number): GameState => {
  let current = state;

  for (let step = 0; step < steps; step += 1) {
    const [pair] = availablePairs(current);
    const result = pair ? applyMove(current, { ...pair, type: "match" }) : null;

    if (!result?.ok) {
      break;
    }

    current = result.state;
  }

  return current;
};

const freshSave = () => JSON.parse(serializeGame(newGame({ seed: 9 })));

const parsed = (text: string): Extract<ParseResult, { ok: true }> => {
  const result = parseSavedGame(text);

  if (!result.ok) {
    throw new Error(`Expected the save to load: ${result.reason}`);
  }

  return result;
};

const reasonFor = (text: string): string => {
  const result = parseSavedGame(text);

  if (result.ok) {
    throw new Error("Expected the save to be rejected.");
  }

  return result.reason;
};

describe("save and resume", () => {
  it("round-trips a game in progress, including undo history", () => {
    const played = playPairs(newGame({ layout: "classic", seed: 2024 }), 12);
    const shuffled = applyMove(played, { type: "shuffle" });

    if (!shuffled.ok) {
      throw new Error(shuffled.error.message);
    }

    const savedAt = new Date("2026-10-24T15:10:00.000Z");
    const result = parsed(serializeGame(shuffled.state, savedAt));

    expect(result.savedAt).toBe(savedAt.toISOString());
    expect(result.state).toStrictEqual(shuffled.state);
  });

  it("keeps only the most recent undo steps", () => {
    let game = newGame({ seed: 4 });

    for (let step = 0; step < SAVED_HISTORY_LIMIT + 5; step += 1) {
      const result = applyMove(game, { type: "shuffle" });

      if (result.ok) {
        game = result.state;
      }
    }

    expect(parsed(serializeGame(game)).state.history).toHaveLength(
      SAVED_HISTORY_LIMIT
    );
  });

  it("rejects text that is not a save", () => {
    expect(reasonFor("not json")).toBe("The saved game could not be read.");
    expect(reasonFor(JSON.stringify({ format: "lifelink/solitaire" }))).toBe(
      "This is not a saved mahjong game."
    );
    expect(reasonFor(JSON.stringify({ ...freshSave(), version: 99 }))).toBe(
      "This save comes from a different version of the game."
    );
  });

  it("rejects a damaged board", () => {
    const save = freshSave();

    expect(
      reasonFor(
        JSON.stringify({ ...save, game: { ...save.game, layout: "x" } })
      )
    ).toBe("The saved layout is not Easy or Classic.");

    expect(
      reasonFor(
        JSON.stringify({
          ...save,
          game: { ...save.game, tiles: save.game.tiles.slice(1) },
        })
      )
    ).toBe("The saved board should have 72 places.");

    expect(
      reasonFor(
        JSON.stringify({
          ...save,
          game: {
            ...save.game,
            tiles: ["dots-10", ...save.game.tiles.slice(1)],
          },
        })
      )
    ).toBe("The saved board holds a tile that could not be read.");

    expect(
      reasonFor(
        JSON.stringify({
          ...save,
          game: { ...save.game, tiles: [null, ...save.game.tiles.slice(1)] },
        })
      )
    ).toBe("The saved board has a tile without its pair.");
  });

  it("rejects tiles from another layout and negative counts", () => {
    const save = freshSave();

    expect(
      reasonFor(
        JSON.stringify({
          ...save,
          game: {
            ...save.game,
            tiles: ["dots-1", "dots-1", ...save.game.tiles.slice(2)],
          },
        })
      )
    ).toBe("The saved board holds tiles that are not in this layout.");

    expect(
      reasonFor(JSON.stringify({ ...save, game: { ...save.game, moves: -1 } }))
    ).toBe("The saved move counts are negative.");
  });

  it("rejects a damaged undo step", () => {
    const save = freshSave();

    expect(
      reasonFor(
        JSON.stringify({ ...save, history: [{ ...save.game, tiles: [] }] })
      )
    ).toBe("An undo step is damaged: The saved board should have 72 places.");

    const classic = JSON.parse(
      serializeGame(newGame({ layout: "classic", seed: 9 }))
    );

    expect(
      reasonFor(JSON.stringify({ ...save, history: [classic.game] }))
    ).toBe("An undo step is damaged: it belongs to a different layout.");
  });

  it("names its format", () => {
    expect(freshSave().format).toBe(SAVE_FORMAT);
  });
});
