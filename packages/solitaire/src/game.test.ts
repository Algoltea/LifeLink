import { describe, expect, it } from "vitest";

import { makeCard } from "./cards";
import type { Card, Rank, Suit } from "./cards";
import { dealSeed } from "./deal";
import {
  applyMove,
  autoMoveToFoundations,
  canUndo,
  findHint,
  hasMovesLeft,
  HISTORY_LIMIT,
  isWon,
  legalTargets,
  newGame,
  positionOf,
  sendToFoundation,
  totalCards,
  undo,
} from "./game";
import type { GameState, Move, MoveResult } from "./game";

const up = (suit: Suit, rank: Rank): Card => makeCard(suit, rank, true);

const down = (suit: Suit, rank: Rank): Card => makeCard(suit, rank, false);

interface TableSetup {
  readonly drawCount?: 1 | 3;
  readonly foundations?: Card[][];
  readonly recycleLimit?: number | null;
  readonly stock?: Card[];
  readonly tableau?: Card[][];
  readonly waste?: Card[];
}

const emptyColumns = (): Card[][] => [[], [], [], [], [], [], []];

/** A hand-built table for rule tests; it need not hold a full deck. */
const table = (setup: TableSetup): GameState => ({
  drawCount: setup.drawCount ?? 1,
  foundations: setup.foundations ?? [[], [], [], []],
  history: [],
  moves: 0,
  recycleLimit: setup.recycleLimit ?? null,
  recycles: 0,
  seed: 1,
  stock: setup.stock ?? [],
  tableau: setup.tableau ?? emptyColumns(),
  waste: setup.waste ?? [],
});

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

const columns = (...piles: Card[][]): Card[][] => [
  ...piles,
  ...emptyColumns().slice(piles.length),
];

const toColumn = (index: number, cardIndex = 0): Move => ({
  source: { cardIndex, index, kind: "tableau" },
  target: { index: 1, kind: "tableau" },
  type: "transfer",
});

describe("dealing", () => {
  it("deals 52 unique cards with the classic layout", () => {
    const game = newGame({ seed: 42 });
    const all = [...game.stock, ...game.tableau.flat()];

    expect(all).toHaveLength(52);
    expect(new Set(all.map((card) => card.id)).size).toBe(52);
    expect(game.stock).toHaveLength(24);
    expect(game.tableau.map((column) => column.length)).toStrictEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(game.stock.every((card) => !card.faceUp)).toBeTruthy();

    for (const column of game.tableau) {
      expect(column.at(-1)?.faceUp).toBeTruthy();
      expect(column.slice(0, -1).every((card) => !card.faceUp)).toBeTruthy();
    }
  });

  it("deals the same game for the same seed and a different one for another", () => {
    expect(dealSeed(7)).toStrictEqual(dealSeed(7));
    expect(dealSeed(7)).not.toStrictEqual(dealSeed(8));
  });
});

describe("tableau rules", () => {
  it("allows a card one rank lower and of the opposite colour", () => {
    const game = table({
      tableau: columns([up("hearts", 7)], [up("spades", 8)]),
    });

    const result = expectOk(applyMove(game, toColumn(0)));

    expect(result.description).toBe("Moved 7 of hearts onto 8 of spades.");
    expect(result.state.tableau[1]?.map((card) => card.id)).toStrictEqual([
      "spades-8",
      "hearts-7",
    ]);
    expect(result.state.moves).toBe(1);
  });

  it("refuses the same colour and explains what is needed", () => {
    const game = table({
      tableau: columns([up("diamonds", 8)], [up("hearts", 9)]),
    });

    const result = expectError(applyMove(game, toColumn(0)));

    expect(result.error.code).toBe("needs-card");
    expect(result.error.message).toBe(
      "That card can't go there: it needs a black 8."
    );
  });

  it("refuses a card of the wrong rank", () => {
    const game = table({
      tableau: columns([up("clubs", 6)], [up("hearts", 9)]),
    });

    expect(expectError(applyMove(game, toColumn(0))).error.code).toBe(
      "needs-card"
    );
  });

  it("only lets a king into an empty column", () => {
    const queen = table({
      tableau: columns([down("clubs", 2), up("hearts", 12)], []),
    });

    const king = table({
      tableau: columns([down("clubs", 2), up("hearts", 13)], []),
    });

    expect(expectError(applyMove(queen, toColumn(0, 1))).error.message).toBe(
      "Only a king can go into an empty column."
    );

    const moved = expectOk(applyMove(king, toColumn(0, 1)));

    expect(moved.description).toBe(
      "Moved king of hearts to empty column 2. Turned over the 2 of clubs."
    );
    expect(moved.state.tableau[0]?.[0]?.faceUp).toBeTruthy();
  });

  it("moves a valid run together and refuses a broken one", () => {
    const run = table({
      tableau: columns(
        [down("clubs", 1), up("spades", 9), up("hearts", 8), up("clubs", 7)],
        [up("diamonds", 10)]
      ),
    });

    const moved = expectOk(applyMove(run, toColumn(0, 1)));

    expect(moved.description).toBe(
      "Moved 9 of spades and 2 more cards onto 10 of diamonds. Turned over the ace of clubs."
    );

    const broken = table({
      tableau: columns([up("spades", 9), up("clubs", 8)], [up("diamonds", 10)]),
    });

    expect(expectError(applyMove(broken, toColumn(0))).error.code).toBe(
      "invalid-run"
    );
  });

  it("refuses to move a face-down card", () => {
    const game = table({
      tableau: columns(
        [down("spades", 9), up("hearts", 4)],
        [up("diamonds", 10)]
      ),
    });

    expect(expectError(applyMove(game, toColumn(0))).error.code).toBe(
      "face-down"
    );
  });
});

const toFoundation = (index: number): Move => ({
  source: { kind: "waste" },
  target: { index, kind: "foundation" },
  type: "transfer",
});

describe("foundation rules", () => {
  it("starts with an ace and continues in suit", () => {
    const game = table({ waste: [up("hearts", 2), up("hearts", 1)] });

    const ace = expectOk(
      applyMove(game, {
        source: { kind: "waste" },
        target: { index: 1, kind: "foundation" },
        type: "transfer",
      })
    );

    expect(ace.description).toBe("Moved ace of hearts to foundation 2.");

    const two = expectOk(
      applyMove(ace.state, {
        source: { kind: "waste" },
        target: { index: 1, kind: "foundation" },
        type: "transfer",
      })
    );

    expect(two.state.foundations[1]?.map((card) => card.id)).toStrictEqual([
      "hearts-1",
      "hearts-2",
    ]);
  });

  it("keeps each foundation to its own suit, starting with the ace", () => {
    const wrongSuit = table({ waste: [up("hearts", 1)] });
    const notAce = table({ waste: [up("spades", 2)] });

    const skipped = table({
      foundations: [[], [up("hearts", 1)], [], []],
      waste: [up("hearts", 3)],
    });

    expect(
      expectError(applyMove(wrongSuit, toFoundation(0))).error.message
    ).toBe("That card can't go there: this foundation is for spades.");
    expect(expectError(applyMove(notAce, toFoundation(0))).error.message).toBe(
      "That card can't go there: this foundation starts with the ace of spades."
    );
    expect(expectError(applyMove(skipped, toFoundation(1))).error.message).toBe(
      "That card can't go there: this foundation needs the 2 of hearts."
    );
  });

  it("offers only the matching suit's foundation as a target", () => {
    const game = table({ waste: [up("clubs", 1)] });

    expect(legalTargets(game, { kind: "waste" })).toStrictEqual([
      { index: 2, kind: "foundation" },
    ]);
  });

  it("refuses more than one card at a time", () => {
    const game = table({
      foundations: [
        [up("clubs", 1), up("clubs", 2), up("clubs", 3)],
        [],
        [],
        [],
      ],
      tableau: columns([up("clubs", 4), up("hearts", 3)]),
    });

    expect(
      expectError(
        applyMove(game, {
          source: { cardIndex: 0, index: 0, kind: "tableau" },
          target: { index: 0, kind: "foundation" },
          type: "transfer",
        })
      ).error.code
    ).toBe("foundation-single");
  });

  it("lets a card come back from a foundation to a column", () => {
    const game = table({
      foundations: [
        [up("hearts", 1), up("hearts", 2), up("hearts", 3)],
        [],
        [],
        [],
      ],
      tableau: columns([up("spades", 4)]),
    });

    const result = expectOk(
      applyMove(game, {
        source: { index: 0, kind: "foundation" },
        target: { index: 0, kind: "tableau" },
        type: "transfer",
      })
    );

    expect(result.state.foundations[0]).toHaveLength(2);
    expect(result.state.tableau[0]?.map((card) => card.id)).toStrictEqual([
      "spades-4",
      "hearts-3",
    ]);
  });
});

describe("stock and waste", () => {
  it("draws one card face up in draw-1", () => {
    const game = table({ stock: [down("clubs", 5), down("hearts", 9)] });
    const result = expectOk(applyMove(game, { type: "draw" }));

    expect(result.description).toBe("Drew the 9 of hearts.");
    expect(result.state.waste.map((card) => card.id)).toStrictEqual([
      "hearts-9",
    ]);
    expect(result.state.waste[0]?.faceUp).toBeTruthy();
    expect(result.state.stock).toHaveLength(1);
  });

  it("draws three cards with the last drawn on top in draw-3", () => {
    const game = table({
      drawCount: 3,
      stock: [
        down("clubs", 1),
        down("clubs", 2),
        down("clubs", 3),
        down("clubs", 4),
      ],
    });

    const result = expectOk(applyMove(game, { type: "draw" }));

    expect(result.state.waste.map((card) => card.id)).toStrictEqual([
      "clubs-4",
      "clubs-3",
      "clubs-2",
    ]);
    expect(result.description).toBe("Drew 3 cards. The 2 of clubs is on top.");

    const rest = expectOk(applyMove(result.state, { type: "draw" }));

    expect(rest.state.waste.at(-1)?.id).toBe("clubs-1");
    expect(rest.state.stock).toHaveLength(0);
  });

  it("turns the waste over into the stock in its original order", () => {
    const game = table({ stock: [down("clubs", 1), down("clubs", 2)] });
    const first = expectOk(applyMove(game, { type: "draw" }));
    const second = expectOk(applyMove(first.state, { type: "draw" }));
    const recycled = expectOk(applyMove(second.state, { type: "draw" }));

    expect(recycled.description).toBe(
      "Turned the waste pile over to make a new stock."
    );
    expect(recycled.state.stock.map((card) => card.id)).toStrictEqual([
      "clubs-1",
      "clubs-2",
    ]);
    expect(recycled.state.stock.every((card) => !card.faceUp)).toBeTruthy();
    expect(recycled.state.recycles).toBe(1);
  });

  it("respects a recycle limit and an empty deck", () => {
    const limited = {
      ...table({ recycleLimit: 1, waste: [up("clubs", 1)] }),
      recycles: 1,
    };

    expect(expectError(applyMove(limited, { type: "draw" })).error.code).toBe(
      "recycle-limit"
    );
    expect(expectError(applyMove(table({}), { type: "draw" })).error.code).toBe(
      "nothing-to-draw"
    );
  });
});

describe(undo, () => {
  it("restores the exact prior state, face-down cards included", () => {
    const game = table({
      tableau: columns([down("clubs", 2), up("hearts", 7)], [up("spades", 8)]),
    });

    const moved = expectOk(applyMove(game, toColumn(0, 1)));

    expect(canUndo(moved.state)).toBeTruthy();

    const restored = expectOk(undo(moved.state));

    expect(restored.state).toStrictEqual(game);
    expect(canUndo(restored.state)).toBeFalsy();
    expect(expectError(undo(restored.state)).error.code).toBe(
      "nothing-to-undo"
    );
  });

  it("caps the history", () => {
    let state = table({ stock: [down("clubs", 1), down("clubs", 2)] });

    for (let step = 0; step < HISTORY_LIMIT + 10; step += 1) {
      ({ state } = expectOk(applyMove(state, { type: "draw" })));
    }

    expect(state.history).toHaveLength(HISTORY_LIMIT);
  });
});

describe("tap-to-move targets", () => {
  it("orders a foundation first, then columns with cards, then one empty column", () => {
    const game = table({
      foundations: [[up("spades", 1)], [], [], []],
      tableau: columns([up("diamonds", 3)], [], [], [up("hearts", 3)], []),
      waste: [up("spades", 2)],
    });

    expect(legalTargets(game, { kind: "waste" })).toStrictEqual([
      { index: 0, kind: "foundation" },
      { index: 0, kind: "tableau" },
      { index: 3, kind: "tableau" },
    ]);
  });

  it("offers a king one empty column, and none when it already starts its column", () => {
    const loose = table({
      tableau: columns([down("clubs", 4), up("spades", 13)], [], []),
    });

    const settled = table({ tableau: columns([up("spades", 13)], [], []) });

    expect(
      legalTargets(loose, { cardIndex: 1, index: 0, kind: "tableau" })
    ).toStrictEqual([{ index: 1, kind: "tableau" }]);
    expect(
      legalTargets(settled, { cardIndex: 0, index: 0, kind: "tableau" })
    ).toStrictEqual([]);
  });

  it("sends a card to the foundation when legal", () => {
    const game = table({ waste: [up("diamonds", 1)] });

    expect(
      expectOk(sendToFoundation(game, { kind: "waste" })).state.foundations[3]
    ).toHaveLength(1);
    expect(
      expectError(
        sendToFoundation(table({ waste: [up("diamonds", 5)] }), {
          kind: "waste",
        })
      ).error.code
    ).toBe("needs-card");
  });
});

describe("hints and auto-move", () => {
  it("prefers a foundation move, then falls back to drawing", () => {
    const game = table({
      stock: [down("clubs", 9)],
      tableau: columns([up("hearts", 1)], [up("spades", 12)]),
    });

    expect(findHint(game)).toStrictEqual({
      source: { cardIndex: 0, index: 0, kind: "tableau" },
      target: { index: 1, kind: "foundation" },
      type: "transfer",
    });
    expect(findHint(table({ stock: [down("clubs", 9)] }))).toStrictEqual({
      type: "draw",
    });
    expect(findHint(table({}))).toBeNull();
  });

  it("auto-moves safe cards as one undoable step", () => {
    const game = table({
      tableau: columns([up("spades", 2), up("hearts", 1)], [up("spades", 1)]),
    });

    const result = autoMoveToFoundations(game);

    expect(result.moved.map((card) => card.id)).toStrictEqual([
      "hearts-1",
      "spades-1",
      "spades-2",
    ]);
    expect(result.state.history).toHaveLength(1);
    expect(expectOk(undo(result.state)).state).toStrictEqual(game);
  });

  it("detects a dead end", () => {
    const stuck = table({
      tableau: columns([up("hearts", 5)], [up("diamonds", 9)]),
    });

    expect(hasMovesLeft(stuck)).toBeFalsy();
    expect(hasMovesLeft(newGame({ seed: 3 }))).toBeTruthy();
  });
});

describe("winning", () => {
  it("is won when every foundation holds a full suit", () => {
    const suits: Suit[] = ["clubs", "diamonds", "hearts", "spades"];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    const full = table({
      foundations: suits.map((suit) => ranks.map((rank) => up(suit, rank))),
    });

    expect(isWon(full)).toBeTruthy();
    expect(totalCards(full)).toBe(52);
    expect(isWon(newGame({ seed: 1 }))).toBeFalsy();
  });

  it("keeps the full deck through a run of hinted moves", () => {
    let state = newGame({ seed: 11 });

    for (let step = 0; step < 150; step += 1) {
      const hint = findHint(state);
      const result = hint ? applyMove(state, hint) : null;

      if (!result?.ok) {
        break;
      }

      ({ state } = result);
    }

    expect(totalCards(positionOf(state))).toBe(52);
  });
});
