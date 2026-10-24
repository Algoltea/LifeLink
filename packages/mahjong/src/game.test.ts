import { describe, expect, it } from "vitest";

import { createRandom, dealBoard, placeWinnable } from "./deal";
import type { Placement } from "./deal";
import {
  applyMove,
  availablePairs,
  canUndo,
  findHint,
  hasMovesLeft,
  HISTORY_LIMIT,
  isWon,
  newGame,
  tilesLeft,
  undo,
} from "./game";
import type { GameState, Move, MoveResult } from "./game";
import { LAYOUT_IDS, layoutFor } from "./layouts";
import type { LayoutId } from "./layouts";
import { blockerFor, freeSlots } from "./rules";
import { flowerTile, matchGroup, suitTile, windTile } from "./tiles";
import type { Tile } from "./tiles";

const expectOk = (result: MoveResult): Extract<MoveResult, { ok: true }> => {
  if (!result.ok) {
    throw new Error(`Expected the move to succeed: ${result.error.message}`);
  }

  return result;
};

const expectError = (
  result: MoveResult
): Extract<MoveResult, { ok: false }> => {
  if (result.ok) {
    throw new Error(
      `Expected the move to fail, but it did: ${result.description}`
    );
  }

  return result;
};

/** The slot index of a position in a layout. */
const slotAt = (layout: LayoutId, x: number, y: number, z: number): number => {
  const index = layoutFor(layout).slots.findIndex(
    (slot) => slot.x === x && slot.y === y && slot.z === z
  );

  if (index === -1) {
    throw new Error(`No slot at ${x},${y},${z} in ${layout}.`);
  }

  return index;
};

/** A hand-built Easy board: only the listed slots hold tiles. */
const board = (placed: readonly (readonly [number, Tile])[]): GameState => {
  const tiles: (Tile | null)[] = layoutFor("easy").slots.map(() => null);

  for (const [index, tile] of placed) {
    tiles[index] = tile;
  }

  return { history: [], layout: "easy", moves: 0, seed: 1, shuffles: 0, tiles };
};

const occupancy = (state: GameState): string =>
  state.tiles.map((tile) => (tile ? "1" : "0")).join("");

/** Plays a placement's own solution through the real rules; true when every match is legal and the board ends clear. */
const solutionClears = (layout: LayoutId, placement: Placement): boolean => {
  let state: GameState = {
    history: [],
    layout,
    moves: 0,
    seed: 1,
    shuffles: 0,
    tiles: placement.board,
  };

  for (const pair of placement.solution) {
    const result = applyMove(state, { ...pair, type: "match" });

    if (!result.ok) {
      return false;
    }

    ({ state } = result);
  }

  return isWon(state);
};

/** A new game played part-way along its own winning order, so it never reaches a dead end. */
const playedGame = (
  layout: LayoutId,
  seed: number,
  steps: number
): GameState => {
  let game = newGame({ layout, seed });

  for (const pair of dealBoard(layoutFor(layout), seed).solution.slice(
    0,
    steps
  )) {
    game = expectOk(applyMove(game, { ...pair, type: "match" })).state;
  }

  return game;
};

const firstPair = (state: GameState): Move => {
  const [pair] = availablePairs(state);

  if (!pair) {
    throw new Error("Expected a free pair.");
  }

  return { ...pair, type: "match" };
};

const groupCounts = (tiles: readonly (Tile | null)[]): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const tile of tiles) {
    if (tile) {
      counts.set(tile.id, (counts.get(tile.id) ?? 0) + 1);
    }
  }

  return counts;
};

describe("layouts", () => {
  it("has one tile for every slot, with no two slots in the same place", () => {
    for (const id of LAYOUT_IDS) {
      const layout = layoutFor(id);

      const places = new Set(
        layout.slots.map((slot) => `${slot.x},${slot.y},${slot.z}`)
      );

      expect(places.size).toBe(layout.slots.length);
      expect(layout.tiles).toHaveLength(layout.slots.length);
    }
  });

  it("uses 72 tiles on two layers for Easy and the 144-tile Turtle for Classic", () => {
    expect(layoutFor("easy").slots).toHaveLength(72);
    expect(layoutFor("easy").depth).toBe(2);
    expect(layoutFor("classic").slots).toHaveLength(144);
    expect(layoutFor("classic").depth).toBe(5);
  });

  it("gives every tile group an even count so every tile has a partner", () => {
    for (const id of LAYOUT_IDS) {
      const groups = new Map<string, number>();

      for (const tile of layoutFor(id).tiles) {
        groups.set(matchGroup(tile), (groups.get(matchGroup(tile)) ?? 0) + 1);
      }

      expect(
        [...groups.values()].every((count) => count % 2 === 0)
      ).toBeTruthy();
    }
  });

  it("links the Turtle's lone side tiles to the rows they sit beside", () => {
    const layout = layoutFor("classic");
    const leftEnd = slotAt("classic", 0, 7, 0);

    expect(layout.right[leftEnd]?.toSorted()).toStrictEqual(
      [slotAt("classic", 2, 6, 0), slotAt("classic", 2, 8, 0)].toSorted()
    );
    expect(layout.left[slotAt("classic", 28, 7, 0)]).toStrictEqual([
      slotAt("classic", 26, 7, 0),
    ]);
    expect(layout.above[slotAt("classic", 12, 6, 3)]).toStrictEqual([
      slotAt("classic", 13, 7, 4),
    ]);
  });
});

describe("dealing", () => {
  it("deals exactly the layout's tile set", () => {
    for (const id of LAYOUT_IDS) {
      const game = newGame({ layout: id, seed: 42 });

      expect(groupCounts(game.tiles)).toStrictEqual(
        groupCounts(layoutFor(id).tiles)
      );
      expect(tilesLeft(game)).toBe(layoutFor(id).slots.length);
    }
  });

  it("deals the same board for the same seed and a different one for another", () => {
    expect(dealBoard(layoutFor("easy"), 7)).toStrictEqual(
      dealBoard(layoutFor("easy"), 7)
    );
    expect(dealBoard(layoutFor("easy"), 7)).not.toStrictEqual(
      dealBoard(layoutFor("easy"), 8)
    );
  });

  it("starts with Easy and no moves", () => {
    const game = newGame({ seed: 3 });

    expect(game.layout).toBe("easy");
    expect(game.moves).toBe(0);
    expect(canUndo(game)).toBeFalsy();
  });

  it("deals boards that can always be cleared", () => {
    for (const id of LAYOUT_IDS) {
      for (let seed = 1; seed <= 100; seed += 1) {
        expect(solutionClears(id, dealBoard(layoutFor(id), seed))).toBeTruthy();
      }
    }
  });

  it("finds a winnable arrangement for the tiles left part-way through a game", () => {
    const game = playedGame("classic", 33, 30);
    const slots: number[] = [];
    const tiles: Tile[] = [];

    for (const [index, tile] of game.tiles.entries()) {
      if (tile) {
        slots.push(index);
        tiles.push(tile);
      }
    }

    const placement = placeWinnable(
      layoutFor("classic"),
      slots,
      tiles,
      createRandom(5)
    );

    expect(placement && solutionClears("classic", placement)).toBeTruthy();
  });
});

describe("free tiles", () => {
  const corner = slotAt("easy", 0, 0, 0);
  const next = slotAt("easy", 2, 0, 0);
  const third = slotAt("easy", 4, 0, 0);
  const underTop = slotAt("easy", 4, 4, 0);
  const top = slotAt("easy", 4, 3, 1);

  it("lets a tile go when one long side is open", () => {
    const game = board([
      [corner, windTile("east")],
      [next, windTile("east")],
    ]);

    expect(blockerFor(layoutFor("easy"), game.tiles, corner)).toBeNull();
    expect(blockerFor(layoutFor("easy"), game.tiles, next)).toBeNull();
  });

  it("holds a tile with neighbours on both sides", () => {
    const game = board([
      [corner, windTile("east")],
      [next, windTile("south")],
      [third, windTile("east")],
    ]);

    expect(blockerFor(layoutFor("easy"), game.tiles, next)).toBe("boxed-in");
    expect(freeSlots(layoutFor("easy"), game.tiles)).toStrictEqual([
      corner,
      third,
    ]);
  });

  it("holds a tile with another resting on it, even on a half step", () => {
    const game = board([
      [underTop, windTile("east")],
      [top, windTile("east")],
    ]);

    expect(blockerFor(layoutFor("easy"), game.tiles, underTop)).toBe("covered");
    expect(blockerFor(layoutFor("easy"), game.tiles, top)).toBeNull();
  });
});

describe("matching", () => {
  const left = slotAt("easy", 0, 0, 0);
  const right = slotAt("easy", 14, 0, 0);
  const middle = slotAt("easy", 6, 0, 0);
  const middleLeft = slotAt("easy", 4, 0, 0);
  const middleRight = slotAt("easy", 8, 0, 0);

  it("removes two identical free tiles and says what happened", () => {
    const game = board([
      [left, suitTile("bamboo", 3)],
      [right, suitTile("bamboo", 3)],
      [middle, windTile("north")],
      [slotAt("easy", 6, 12, 0), windTile("north")],
    ]);

    const result = expectOk(
      applyMove(game, { first: left, second: right, type: "match" })
    );

    expect(result.description).toBe("Matched the two 3 Bamboo. 2 tiles left.");
    expect(result.state.tiles[left]).toBeNull();
    expect(result.state.tiles[right]).toBeNull();
    expect(result.state.moves).toBe(1);
  });

  it("names a pair of winds or dragons in the plural", () => {
    const game = board([
      [left, windTile("east")],
      [right, windTile("east")],
    ]);

    expect(
      expectOk(applyMove(game, { first: left, second: right, type: "match" }))
        .description
    ).toBe("Matched the two East Winds.");
  });

  it("matches any two flowers", () => {
    const game = board([
      [left, flowerTile("plum")],
      [right, flowerTile("orchid")],
    ]);

    const result = expectOk(
      applyMove(game, { first: left, second: right, type: "match" })
    );

    expect(result.description).toBe("Matched the Plum and Orchid flowers.");
    expect(isWon(result.state)).toBeTruthy();
  });

  it("refuses tiles that differ and names both", () => {
    const game = board([
      [left, suitTile("characters", 3)],
      [right, suitTile("dots", 5)],
    ]);

    const result = expectError(
      applyMove(game, { first: left, second: right, type: "match" })
    );

    expect(result.error.code).toBe("no-match");
    expect(result.error.message).toBe(
      "The 3 Characters and the 5 Dots don't match. Pick two tiles that are the same."
    );
  });

  it("refuses a boxed-in tile and explains why", () => {
    const game = board([
      [middleLeft, windTile("west")],
      [middle, windTile("east")],
      [middleRight, windTile("west")],
      [left, windTile("east")],
    ]);

    const result = expectError(
      applyMove(game, { first: middle, second: left, type: "match" })
    );

    expect(result.error.code).toBe("blocked");
    expect(result.error.message).toBe(
      "That tile is boxed in on both sides. Pick a tile with a free left or right side."
    );
  });

  it("refuses the same tile twice and an empty slot", () => {
    const game = board([
      [left, windTile("east")],
      [right, windTile("east")],
    ]);

    expect(
      expectError(applyMove(game, { first: left, second: left, type: "match" }))
        .error.code
    ).toBe("same-tile");
    expect(
      expectError(
        applyMove(game, { first: left, second: middle, type: "match" })
      ).error.message
    ).toBe("That tile has already been matched.");
    expect(
      expectError(applyMove(game, { first: left, second: 999, type: "match" }))
        .error.code
    ).toBe("invalid-index");
  });
});

describe(undo, () => {
  it("puts the last pair back", () => {
    const game = newGame({ seed: 11 });
    const played = expectOk(applyMove(game, firstPair(game))).state;
    const undone = expectOk(undo(played));

    expect(undone.description).toBe("Undid the last move.");
    expect(undone.state.tiles).toStrictEqual(game.tiles);
    expect(undone.state.moves).toBe(0);
    expect(canUndo(undone.state)).toBeFalsy();
  });

  it("refuses when nothing has happened yet", () => {
    expect(expectError(undo(newGame({ seed: 1 }))).error.code).toBe(
      "nothing-to-undo"
    );
  });

  it("keeps at most the history limit", () => {
    let game = newGame({ seed: 5 });

    for (let step = 0; step < HISTORY_LIMIT + 10; step += 1) {
      game = expectOk(applyMove(game, { type: "shuffle" })).state;
    }

    expect(game.history).toHaveLength(HISTORY_LIMIT);
  });
});

describe("shuffle", () => {
  it("rearranges the tiles left into the same places, still winnable", () => {
    const game = playedGame("classic", 21, 10);
    const result = expectOk(applyMove(game, { type: "shuffle" }));

    expect(result.description).toBe(
      "Shuffled the 124 tiles left. The board can still be cleared."
    );
    expect(groupCounts(result.state.tiles)).toStrictEqual(
      groupCounts(game.tiles)
    );
    expect(occupancy(result.state)).toBe(occupancy(game));
    expect(result.state.tiles).not.toStrictEqual(game.tiles);
    expect(result.state.shuffles).toBe(1);
  });

  it("can be undone like any other move", () => {
    const game = playedGame("easy", 21, 4);
    const shuffled = expectOk(applyMove(game, { type: "shuffle" })).state;

    expect(expectOk(undo(shuffled)).state.tiles).toStrictEqual(game.tiles);
  });

  it("refuses when the tiles left can never be cleared", () => {
    const game = board([
      [slotAt("easy", 4, 4, 0), windTile("east")],
      [slotAt("easy", 4, 3, 1), windTile("east")],
    ]);

    expect(hasMovesLeft(game)).toBeFalsy();
    expect(expectError(applyMove(game, { type: "shuffle" })).error.code).toBe(
      "cannot-shuffle"
    );
  });

  it("refuses on a cleared board", () => {
    expect(
      expectError(applyMove(board([]), { type: "shuffle" })).error.code
    ).toBe("nothing-to-shuffle");
  });
});

describe("hints", () => {
  it("suggests a free matching pair", () => {
    const game = newGame({ seed: 8 });
    const hint = findHint(game);

    expect(hint).not.toBeNull();

    if (hint) {
      expectOk(applyMove(game, { ...hint, type: "match" }));
    }
  });

  it("prefers the pair that opens up more of the board", () => {
    const game = board([
      [slotAt("easy", 0, 0, 0), windTile("west")],
      [slotAt("easy", 14, 0, 0), windTile("west")],
      [slotAt("easy", 0, 12, 0), windTile("east")],
      [slotAt("easy", 2, 12, 0), windTile("north")],
      [slotAt("easy", 14, 12, 0), windTile("east")],
    ]);

    expect(findHint(game)).toStrictEqual({
      first: slotAt("easy", 0, 12, 0),
      second: slotAt("easy", 14, 12, 0),
    });
  });

  it("has nothing to suggest when no pair is free", () => {
    const game = board([
      [slotAt("easy", 0, 0, 0), windTile("east")],
      [slotAt("easy", 14, 0, 0), windTile("south")],
    ]);

    expect(findHint(game)).toBeNull();
    expect(hasMovesLeft(game)).toBeFalsy();
  });
});
