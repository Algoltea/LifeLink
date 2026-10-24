import { cardColor, cardName, KING, withFace } from "./cards";
import type { Card } from "./cards";
import { dealSeed, FOUNDATION_COUNT, TABLEAU_COLUMNS } from "./deal";
import {
  canPlaceOnFoundation,
  canPlaceOnTableau,
  foundationRefusal,
  isValidRun,
  tableauRefusal,
} from "./rules";

export type DrawCount = 1 | 3;

export const HISTORY_LIMIT = 200;

export const DECK_SIZE = 52;

export type MoveSource =
  | { readonly kind: "foundation"; readonly index: number }
  | {
      readonly cardIndex: number;
      readonly index: number;
      readonly kind: "tableau";
    }
  | { readonly kind: "waste" };

export type MoveTarget =
  | { readonly index: number; readonly kind: "foundation" }
  | { readonly index: number; readonly kind: "tableau" };

export type Move =
  | { readonly type: "draw" }
  | {
      readonly source: MoveSource;
      readonly target: MoveTarget;
      readonly type: "transfer";
    };

/** Everything that describes the table at one moment, without undo history. */
export interface Position {
  readonly drawCount: DrawCount;
  readonly foundations: readonly (readonly Card[])[];
  readonly moves: number;
  readonly recycleLimit: number | null;
  readonly recycles: number;
  readonly seed: number;
  readonly stock: readonly Card[];
  readonly tableau: readonly (readonly Card[])[];
  readonly waste: readonly Card[];
}

export interface GameState extends Position {
  /** Earlier positions, oldest first, capped at HISTORY_LIMIT. */
  readonly history: readonly Position[];
}

export type MoveErrorCode =
  | "empty-source"
  | "face-down"
  | "foundation-single"
  | "invalid-index"
  | "invalid-run"
  | "needs-card"
  | "nothing-to-draw"
  | "nothing-to-undo"
  | "recycle-limit"
  | "same-pile";

export interface MoveError {
  readonly code: MoveErrorCode;
  readonly message: string;
}

export type MoveResult =
  | {
      readonly description: string;
      readonly ok: true;
      readonly state: GameState;
    }
  | { readonly error: MoveError; readonly ok: false };

export interface NewGameOptions {
  readonly drawCount?: DrawCount;
  readonly recycleLimit?: number | null;
  readonly seed: number;
}

export interface AutoMoveResult {
  readonly moved: readonly Card[];
  readonly state: GameState;
}

const refuse = (code: MoveErrorCode, message: string): MoveResult => ({
  error: { code, message },
  ok: false,
});

export const newGame = (options: NewGameOptions): GameState => {
  const { stock, tableau } = dealSeed(options.seed);
  const foundations: Card[][] = [];

  for (let index = 0; index < FOUNDATION_COUNT; index += 1) {
    foundations.push([]);
  }

  return {
    drawCount: options.drawCount ?? 1,
    foundations,
    history: [],
    moves: 0,
    recycleLimit: options.recycleLimit ?? null,
    recycles: 0,
    seed: options.seed,
    stock,
    tableau,
    waste: [],
  };
};

export const positionOf = (state: Position): Position => ({
  drawCount: state.drawCount,
  foundations: state.foundations,
  moves: state.moves,
  recycleLimit: state.recycleLimit,
  recycles: state.recycles,
  seed: state.seed,
  stock: state.stock,
  tableau: state.tableau,
  waste: state.waste,
});

const advance = (previous: GameState, next: Position): GameState => ({
  ...next,
  history: [...previous.history, positionOf(previous)].slice(-HISTORY_LIMIT),
  moves: previous.moves + 1,
});

const replaceAt = <Item>(
  items: readonly Item[],
  index: number,
  item: Item
): Item[] =>
  items.map((current, position) => (position === index ? item : current));

const draw = (state: GameState): MoveResult => {
  if (state.stock.length > 0) {
    const count = Math.min(state.drawCount, state.stock.length);

    const drawn = state.stock
      .slice(-count)
      .toReversed()
      .map((card) => withFace(card, true));

    const top = drawn.at(-1);

    const description =
      count === 1 || !top
        ? `Drew the ${top ? cardName(top) : "next card"}.`
        : `Drew ${count} cards. The ${cardName(top)} is on top.`;

    return {
      description,
      ok: true,
      state: advance(state, {
        ...state,
        stock: state.stock.slice(0, -count),
        waste: [...state.waste, ...drawn],
      }),
    };
  }

  if (state.waste.length === 0) {
    return refuse("nothing-to-draw", "There are no cards left to draw.");
  }

  if (state.recycleLimit !== null && state.recycles >= state.recycleLimit) {
    return refuse(
      "recycle-limit",
      "You have already gone through the deck as many times as this game allows."
    );
  }

  return {
    description: "Turned the waste pile over to make a new stock.",
    ok: true,
    state: advance(state, {
      ...state,
      recycles: state.recycles + 1,
      stock: state.waste.toReversed().map((card) => withFace(card, false)),
      waste: [],
    }),
  };
};

type SourceCards =
  | { readonly cards: readonly Card[]; readonly ok: true }
  | { readonly error: MoveError; readonly ok: false };

const fail = (code: MoveErrorCode, message: string): SourceCards => ({
  error: { code, message },
  ok: false,
});

/** The cards a source would move, or why it cannot move. */
export const sourceCards = (
  state: Position,
  source: MoveSource
): SourceCards => {
  if (source.kind === "waste") {
    const top = state.waste.at(-1);

    return top
      ? { cards: [top], ok: true }
      : fail(
          "empty-source",
          "The waste pile is empty. Draw from the stock first."
        );
  }

  if (source.kind === "foundation") {
    const top = state.foundations[source.index]?.at(-1);

    return top
      ? { cards: [top], ok: true }
      : fail("empty-source", "That foundation is empty.");
  }

  const column = state.tableau[source.index];

  if (!column || source.cardIndex < 0 || source.cardIndex >= column.length) {
    return fail("invalid-index", "There is no card there.");
  }

  const cards = column.slice(source.cardIndex);

  if (!cards[0]?.faceUp) {
    return fail(
      "face-down",
      "That card is face down. Turn it over by moving the cards on top of it."
    );
  }

  if (!isValidRun(cards)) {
    return fail(
      "invalid-run",
      "Those cards can't move together: only an unbroken run of alternating colours moves as a group."
    );
  }

  return { cards, ok: true };
};

const samePile = (source: MoveSource, target: MoveTarget): boolean => {
  if (source.kind === "waste") {
    return false;
  }

  return source.kind === target.kind && source.index === target.index;
};

interface Removal {
  readonly position: Position;
  /** The face-down card turned over by the move, if any. */
  readonly revealed: Card | null;
}

const removeFromSource = (state: Position, source: MoveSource): Removal => {
  if (source.kind === "waste") {
    return {
      position: { ...state, waste: state.waste.slice(0, -1) },
      revealed: null,
    };
  }

  if (source.kind === "foundation") {
    const pile = state.foundations[source.index] ?? [];

    return {
      position: {
        ...state,
        foundations: replaceAt(
          state.foundations,
          source.index,
          pile.slice(0, -1)
        ),
      },
      revealed: null,
    };
  }

  const column = (state.tableau[source.index] ?? []).slice(0, source.cardIndex);
  const newTop = column.at(-1);
  const revealed = newTop && !newTop.faceUp ? withFace(newTop, true) : null;
  const remaining = revealed ? [...column.slice(0, -1), revealed] : column;

  return {
    position: {
      ...state,
      tableau: replaceAt(state.tableau, source.index, remaining),
    },
    revealed,
  };
};

const describeTransfer = (
  state: Position,
  cards: readonly Card[],
  target: MoveTarget
): string => {
  const [first] = cards;
  const name = first ? cardName(first) : "the card";

  if (target.kind === "foundation") {
    return `Moved ${name} to foundation ${target.index + 1}.`;
  }

  const top = state.tableau[target.index]?.at(-1);
  const extra = cards.length - 1;

  const moving =
    extra > 0
      ? `${name} and ${extra} more ${extra === 1 ? "card" : "cards"}`
      : name;

  return top
    ? `Moved ${moving} onto ${cardName(top)}.`
    : `Moved ${moving} to empty column ${target.index + 1}.`;
};

const transfer = (
  state: GameState,
  source: MoveSource,
  target: MoveTarget
): MoveResult => {
  if (samePile(source, target)) {
    return refuse("same-pile", "That card is already there.");
  }

  const picked = sourceCards(state, source);

  if (!picked.ok) {
    return { error: picked.error, ok: false };
  }

  const { cards } = picked;
  const [first] = cards;

  if (!first) {
    return refuse("empty-source", "There is no card there.");
  }

  if (target.kind === "foundation") {
    const foundation = state.foundations[target.index];

    if (!foundation) {
      return refuse("invalid-index", "There is no foundation there.");
    }

    if (cards.length !== 1) {
      return refuse(
        "foundation-single",
        "Only one card at a time can go onto a foundation."
      );
    }

    if (!canPlaceOnFoundation(first, foundation, target.index)) {
      return refuse(
        "needs-card",
        foundationRefusal(first, foundation, target.index)
      );
    }
  } else {
    const column = state.tableau[target.index];

    if (!column) {
      return refuse("invalid-index", "There is no column there.");
    }

    if (!canPlaceOnTableau(first, column.at(-1))) {
      return refuse("needs-card", tableauRefusal(column.at(-1)));
    }
  }

  const description = describeTransfer(state, cards, target);
  const { position, revealed } = removeFromSource(state, source);
  const placed = cards.map((card) => withFace(card, true));

  const next: Position =
    target.kind === "foundation"
      ? {
          ...position,
          foundations: replaceAt(position.foundations, target.index, [
            ...(position.foundations[target.index] ?? []),
            ...placed,
          ]),
        }
      : {
          ...position,
          tableau: replaceAt(position.tableau, target.index, [
            ...(position.tableau[target.index] ?? []),
            ...placed,
          ]),
        };

  const revealNote = revealed ? ` Turned over the ${cardName(revealed)}.` : "";

  return {
    description: `${description}${revealNote}`,
    ok: true,
    state: advance(state, next),
  };
};

export const applyMove = (state: GameState, move: Move): MoveResult =>
  move.type === "draw"
    ? draw(state)
    : transfer(state, move.source, move.target);

export const canUndo = (state: GameState): boolean => state.history.length > 0;

export const undo = (state: GameState): MoveResult => {
  const previous = state.history.at(-1);

  if (!previous) {
    return refuse("nothing-to-undo", "There is nothing to undo yet.");
  }

  return {
    description: "Undid the last move.",
    ok: true,
    state: { ...previous, history: state.history.slice(0, -1) },
  };
};

export const isWon = (state: Position): boolean =>
  state.foundations.length === FOUNDATION_COUNT &&
  state.foundations.every((pile) => pile.length === KING);

export const cardsOnFoundations = (state: Position): number =>
  state.foundations.reduce((total, pile) => total + pile.length, 0);

/**
 * Legal places for a source, best first: a foundation, then a column with
 * cards, then one empty column. Duplicate empty piles and pointless moves (a
 * king that already starts its column) are left out so tap-to-move can act on
 * a single answer.
 */
export const legalTargets = (
  state: Position,
  source: MoveSource
): MoveTarget[] => {
  const picked = sourceCards(state, source);

  if (!picked.ok) {
    return [];
  }

  const [first] = picked.cards;

  if (!first) {
    return [];
  }

  const targets: MoveTarget[] = [];

  if (picked.cards.length === 1 && source.kind !== "foundation") {
    const index = state.foundations.findIndex((pile, pileIndex) =>
      canPlaceOnFoundation(first, pile, pileIndex)
    );

    if (index !== -1) {
      targets.push({ index, kind: "foundation" });
    }
  }

  let emptyColumn: MoveTarget | null = null;
  const startsColumn = source.kind === "tableau" && source.cardIndex === 0;

  for (let index = 0; index < state.tableau.length; index += 1) {
    const column = state.tableau[index] ?? [];
    const target: MoveTarget = { index, kind: "tableau" };
    const isOwnColumn = samePile(source, target);
    const top = column.at(-1);

    if (!isOwnColumn && canPlaceOnTableau(first, top)) {
      if (top) {
        targets.push(target);
      } else if (!startsColumn && emptyColumn === null) {
        emptyColumn = target;
      }
    }
  }

  if (emptyColumn) {
    targets.push(emptyColumn);
  }

  return targets;
};

/** Sources that currently hold movable cards: the waste top, each column's face-up runs, and each foundation top. */
export const movableSources = (state: Position): MoveSource[] => {
  const sources: MoveSource[] = [];

  if (state.waste.length > 0) {
    sources.push({ kind: "waste" });
  }

  for (let index = 0; index < state.tableau.length; index += 1) {
    const column = state.tableau[index] ?? [];

    for (let cardIndex = 0; cardIndex < column.length; cardIndex += 1) {
      if (column[cardIndex]?.faceUp && isValidRun(column.slice(cardIndex))) {
        sources.push({ cardIndex, index, kind: "tableau" });
      }
    }
  }

  for (let index = 0; index < state.foundations.length; index += 1) {
    if ((state.foundations[index]?.length ?? 0) > 0) {
      sources.push({ index, kind: "foundation" });
    }
  }

  return sources;
};

const FOUNDATION_SCORE = 100;
const REVEAL_SCORE = 50;
const KING_TO_EMPTY_SCORE = 45;
const WASTE_SCORE = 40;
const CLEAR_COLUMN_SCORE = 30;

const scoreMove = (
  state: Position,
  source: MoveSource,
  target: MoveTarget
): number => {
  if (source.kind === "foundation") {
    return 0;
  }

  const revealsCard =
    source.kind === "tableau" &&
    source.cardIndex > 0 &&
    state.tableau[source.index]?.[source.cardIndex - 1]?.faceUp === false;

  if (target.kind === "foundation") {
    return FOUNDATION_SCORE + (revealsCard ? REVEAL_SCORE : 0);
  }

  if (source.kind === "waste") {
    return WASTE_SCORE;
  }

  const targetIsEmpty = (state.tableau[target.index]?.length ?? 0) === 0;

  if (revealsCard) {
    return targetIsEmpty ? KING_TO_EMPTY_SCORE : REVEAL_SCORE;
  }

  return source.cardIndex === 0 && !targetIsEmpty ? CLEAR_COLUMN_SCORE : 0;
};

const canDraw = (state: Position): boolean =>
  state.stock.length > 0 ||
  (state.waste.length > 0 &&
    (state.recycleLimit === null || state.recycles < state.recycleLimit));

/** The most useful move right now, or a draw, or null when nothing helps. */
export const findHint = (state: Position): Move | null => {
  let best: Move | null = null;
  let bestScore = 0;

  for (const source of movableSources(state)) {
    for (const target of legalTargets(state, source)) {
      const score = scoreMove(state, source, target);

      if (score > bestScore) {
        best = { source, target, type: "transfer" };
        bestScore = score;
      }
    }
  }

  if (best) {
    return best;
  }

  return canDraw(state) ? { type: "draw" } : null;
};

const couldPlaceAnywhere = (state: Position, card: Card): boolean =>
  state.foundations.some((pile, index) =>
    canPlaceOnFoundation(card, pile, index)
  ) || state.tableau.some((column) => canPlaceOnTableau(card, column.at(-1)));

/**
 * Best effort: false only when no useful transfer exists and no card waiting
 * in the stock or waste could be placed anywhere on the current table.
 */
export const hasMovesLeft = (state: Position): boolean => {
  if (isWon(state)) {
    return false;
  }

  const hint = findHint(state);

  if (hint?.type === "transfer") {
    return true;
  }

  if (!canDraw(state)) {
    return false;
  }

  const waiting = [...state.stock, ...state.waste];

  return waiting.some((card) =>
    couldPlaceAnywhere(state, withFace(card, true))
  );
};

const topRankBySuit = (state: Position, suit: Card["suit"]): number => {
  for (const pile of state.foundations) {
    const top = pile.at(-1);

    if (top?.suit === suit) {
      return top.rank;
    }
  }

  return 0;
};

/**
 * A card is safe to send home when no card that could still need it is left:
 * aces and twos always, otherwise once both opposite-colour foundations have
 * reached one rank below it.
 */
export const isSafeForFoundation = (state: Position, card: Card): boolean => {
  if (card.rank <= 2) {
    return true;
  }

  const color = cardColor(card.suit);

  const opposite: Card["suit"][] =
    color === "red" ? ["clubs", "spades"] : ["diamonds", "hearts"];

  return opposite.every((suit) => topRankBySuit(state, suit) >= card.rank - 1);
};

const nextSafeMove = (state: GameState): Move | null => {
  const sources: MoveSource[] = [{ kind: "waste" }];

  for (let index = 0; index < TABLEAU_COLUMNS; index += 1) {
    const length = state.tableau[index]?.length ?? 0;

    if (length > 0) {
      sources.push({ cardIndex: length - 1, index, kind: "tableau" });
    }
  }

  for (const source of sources) {
    const picked = sourceCards(state, source);
    const card = picked.ok ? picked.cards[0] : undefined;

    if (card && isSafeForFoundation(state, card)) {
      const index = state.foundations.findIndex((pile, pileIndex) =>
        canPlaceOnFoundation(card, pile, pileIndex)
      );

      if (index !== -1) {
        return {
          source,
          target: { index, kind: "foundation" },
          type: "transfer",
        };
      }
    }
  }

  return null;
};

/** Sends every safe card to the foundations as one undoable step. */
export const autoMoveToFoundations = (state: GameState): AutoMoveResult => {
  const moved: Card[] = [];
  let current = state;
  let move = nextSafeMove(current);

  while (move && move.type === "transfer") {
    const picked = sourceCards(current, move.source);
    const result = applyMove(current, move);

    if (!result.ok) {
      break;
    }

    if (picked.ok && picked.cards[0]) {
      moved.push(picked.cards[0]);
    }

    current = result.state;
    move = nextSafeMove(current);
  }

  if (moved.length === 0) {
    return { moved, state };
  }

  return {
    moved,
    state: {
      ...positionOf(current),
      history: [...state.history, positionOf(state)].slice(-HISTORY_LIMIT),
      moves: state.moves + 1,
    },
  };
};

/** Sends the source's card to a foundation when that is legal. */
export const sendToFoundation = (
  state: GameState,
  source: MoveSource
): MoveResult => {
  const target = legalTargets(state, source).find(
    (candidate) => candidate.kind === "foundation"
  );

  if (!target) {
    const picked = sourceCards(state, source);

    if (!picked.ok) {
      return { error: picked.error, ok: false };
    }

    return refuse(
      "needs-card",
      picked.cards.length > 1
        ? "Only one card at a time can go onto a foundation."
        : "That card can't go onto a foundation yet."
    );
  }

  return applyMove(state, { source, target, type: "transfer" });
};

export const totalCards = (state: Position): number =>
  state.stock.length +
  state.waste.length +
  cardsOnFoundations(state) +
  state.tableau.reduce((total, column) => total + column.length, 0);
