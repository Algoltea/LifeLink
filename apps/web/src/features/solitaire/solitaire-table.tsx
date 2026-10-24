"use client";

import { cardName } from "@lifelink/solitaire/cards";
import {
  applyMove,
  autoMoveToFoundations,
  canUndo,
  cardsOnFoundations,
  findHint,
  hasMovesLeft,
  isWon,
  legalTargets,
  sendToFoundation,
  sourceCards,
  undo,
} from "@lifelink/solitaire/game";
import type {
  DrawCount,
  GameState,
  Move,
  MoveResult,
  MoveSource,
  MoveTarget,
} from "@lifelink/solitaire/game";
import { Button } from "@lifelink/ui/components/button";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { Board } from "./board";
import {
  clampSlot,
  moveSlot,
  sameSource,
  slotForSource,
  slotForTarget,
  slotKey,
  sourceForSlot,
  STOCK_SLOT,
  targetForSlot,
} from "./board-model";
import type { Direction, Slot } from "./board-model";
import { HowToPlay } from "./how-to-play";
import { freshGame, loadGame, saveGame } from "./storage";
import type { LoadedGame } from "./storage";

interface Announcement {
  readonly id: number;
  readonly text: string;
}

const directionFor = (key: string): Direction | null => {
  switch (key) {
    case "ArrowDown": {
      return "down";
    }

    case "ArrowLeft": {
      return "left";
    }

    case "ArrowRight": {
      return "right";
    }

    case "ArrowUp": {
      return "up";
    }

    default: {
      return null;
    }
  }
};

const drawWords = (count: DrawCount): string =>
  count === 1 ? "one card" : "three cards";

const describeSource = (state: GameState, source: MoveSource): string => {
  const picked = sourceCards(state, source);

  if (!picked.ok) {
    return "that card";
  }

  const [first] = picked.cards;
  const extra = picked.cards.length - 1;
  const name = first ? cardName(first) : "that card";

  return extra > 0
    ? `${name} and the ${extra === 1 ? "card" : `${extra} cards`} on it`
    : name;
};

const describeTarget = (state: GameState, target: MoveTarget): string => {
  if (target.kind === "foundation") {
    return "to a foundation";
  }

  const top = state.tableau[target.index]?.at(-1);

  return top ? `onto ${cardName(top)}` : `to empty column ${target.index + 1}`;
};

const describeHint = (state: GameState, hint: Move): string =>
  hint.type === "draw"
    ? "Hint: draw from the stock."
    : `Hint: move ${describeSource(state, hint.source)} ${describeTarget(state, hint.target)}.`;

const emptyReason = (state: GameState, slot: Slot): string => {
  if (slot.area === "waste") {
    return "The waste pile is empty. Draw from the stock first.";
  }

  if (slot.area === "foundation") {
    return "This foundation is empty. Aces go here first.";
  }

  if (
    slot.area === "tableau" &&
    (state.tableau[slot.index]?.length ?? 0) === 0
  ) {
    return "This column is empty. Only a king can go here.";
  }

  return "That card is face down. Move the cards on top of it to turn it over.";
};

const formatSavedAt = (savedAt: string): string => {
  const date = new Date(savedAt);

  return Number.isNaN(date.getTime())
    ? "earlier"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const outcomeNote = (state: GameState): string => {
  if (isWon(state)) {
    return ` You won in ${state.moves} moves. Well played.`;
  }

  return hasMovesLeft(state)
    ? ""
    : " No moves are left in this deal. You can undo or start a new game.";
};

/** The parts of a key press that shortcuts read; React and DOM keyboard events both provide them. */
interface KeyChord {
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly key: string;
  readonly metaKey: boolean;
}

const isPlainLetter = (event: KeyChord): boolean =>
  !(event.altKey || event.ctrlKey || event.metaKey);

const isUndoChord = (event: KeyChord): boolean =>
  (event.ctrlKey || event.metaKey) &&
  !event.altKey &&
  event.key.toLowerCase() === "z";

const openingMessage = (loaded: LoadedGame): string => {
  if (loaded.resumedFrom) {
    return "Resumed your last game.";
  }

  return loaded.discarded
    ? `Your saved game could not be opened, so a new game was dealt. ${loaded.discarded}`
    : "A new game is ready. Choose a card to begin.";
};

const isInside = (
  root: HTMLElement | null,
  target: EventTarget | null
): boolean =>
  target === document.body ||
  (root !== null && target instanceof Node && root.contains(target));

/** The playable table. Client-only: it reads the saved game from localStorage while it first renders. */
export const SolitaireTable = ({ guest = false }: { guest?: boolean }) => {
  const [opening, setOpening] = useState(() => loadGame(1));
  const [game, setGame] = useState<GameState>(opening.state);
  const [cursor, setCursor] = useState<Slot>(STOCK_SLOT);
  const [selected, setSelected] = useState<MoveSource | null>(null);
  const [hint, setHint] = useState<Move | null>(null);

  const [announcement, setAnnouncement] = useState<Announcement>({
    id: 0,
    text: openingMessage(opening),
  });

  const [saveFailed, setSaveFailed] = useState(false);

  const [preferredDraw, setPreferredDraw] = useState<DrawCount>(
    opening.state.drawCount
  );

  const rootElement = useRef<HTMLElement>(null);
  const slotElements = useRef(new Map<string, HTMLButtonElement>());
  const boardFocusPending = useRef(false);

  const announce = (text: string) => {
    setAnnouncement((previous) => ({ id: previous.id + 1, text }));
  };

  useEffect(() => {
    if (boardFocusPending.current) {
      boardFocusPending.current = false;
      slotElements.current.get(slotKey(cursor))?.focus();
    }
  }, [cursor]);

  const commit = (next: GameState, text: string, nextCursor: Slot = cursor) => {
    setGame(next);
    setSaveFailed(!saveGame(next));
    setSelected(null);
    setHint(null);
    setCursor(clampSlot(next, nextCursor));
    announce(`${text}${outcomeNote(next)}`);
  };

  const run = (result: MoveResult, nextCursor?: Slot) => {
    if (result.ok) {
      commit(result.state, result.description, nextCursor);
    } else {
      announce(result.error.message);
    }
  };

  const pick = (slot: Slot) => {
    const source = sourceForSlot(game, slot);

    if (!source) {
      announce(emptyReason(game, slot));

      return;
    }

    const targets = legalTargets(game, source);
    const [only] = targets;

    if (targets.length === 1 && only) {
      run(
        applyMove(game, { source, target: only, type: "transfer" }),
        slotForTarget(game, only)
      );

      return;
    }

    setSelected(source);
    setHint(null);

    const name = describeSource(game, source);

    announce(
      targets.length === 0
        ? `Selected ${name}. It has no place to go right now. Press Escape to put it back.`
        : `Selected ${name}. It can go to ${targets.length} places. Choose one, or press Escape.`
    );
  };

  const activate = (slot: Slot) => {
    if (slot.area === "stock") {
      setSelected(null);
      run(applyMove(game, { type: "draw" }), STOCK_SLOT);

      return;
    }

    const target = targetForSlot(slot);

    if (selected && sameSource(selected, sourceForSlot(game, slot))) {
      const home = sendToFoundation(game, selected);

      if (home.ok) {
        commit(home.state, home.description);
      } else {
        setSelected(null);
        announce("Put the card back. Nothing is selected.");
      }

      return;
    }

    if (selected && target) {
      const result = applyMove(game, {
        source: selected,
        target,
        type: "transfer",
      });

      if (result.ok) {
        commit(
          result.state,
          result.description,
          slotForTarget(result.state, target)
        );
      } else {
        announce(
          `${result.error.message} Choose another place, or press Escape to pick a different card.`
        );
      }

      return;
    }

    pick(slot);
  };

  const sendHome = (slot: Slot) => {
    const source = sourceForSlot(game, slot);

    if (source) {
      run(sendToFoundation(game, source));
    }
  };

  const requestUndo = () => run(undo(game));

  const requestDraw = () => {
    setSelected(null);
    run(applyMove(game, { type: "draw" }));
  };

  const requestHint = () => {
    const next = findHint(game);

    if (!next) {
      announce("There are no useful moves left. Try undo or start a new game.");

      return;
    }

    setSelected(null);
    setHint(next);
    announce(describeHint(game, next));

    if (next.type === "transfer") {
      setCursor(slotForSource(next.source));
    }
  };

  const requestAutoMove = () => {
    const result = autoMoveToFoundations(game);

    if (result.moved.length === 0) {
      announce("No cards are safe to send to the foundations right now.");

      return;
    }

    const names = result.moved.map((card) => cardName(card)).join(", ");
    const count = result.moved.length;

    commit(
      result.state,
      `Sent ${count} ${count === 1 ? "card" : "cards"} to the foundations: ${names}.`
    );
  };

  const startNewGame = (drawCount: DrawCount = preferredDraw) => {
    setOpening((current) => ({
      ...current,
      discarded: null,
      resumedFrom: null,
    }));
    commit(
      freshGame(drawCount),
      `Dealt a new game, drawing ${drawWords(drawCount)} at a time.`,
      STOCK_SLOT
    );
  };

  const changeDrawCount = (drawCount: DrawCount) => {
    setPreferredDraw(drawCount);

    if (game.moves === 0) {
      startNewGame(drawCount);

      return;
    }

    announce(
      `New games will draw ${drawWords(drawCount)} at a time. This game keeps drawing ${drawWords(game.drawCount)}.`
    );
  };

  const handleBoardKeys = (event: KeyboardEvent<HTMLElement>) => {
    const direction = directionFor(event.key);

    if (direction) {
      event.preventDefault();
      boardFocusPending.current = true;
      setCursor(moveSlot(game, cursor, direction));

      return;
    }

    if (event.key === "Escape" && selected) {
      event.preventDefault();
      setSelected(null);
      announce("Nothing is selected.");
    }
  };

  const handleShortcuts = (event: globalThis.KeyboardEvent) => {
    if (isUndoChord(event)) {
      event.preventDefault();
      requestUndo();

      return;
    }

    if (!isPlainLetter(event)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === "u") {
      requestUndo();
    } else if (key === "d") {
      requestDraw();
    } else if (key === "h") {
      requestHint();
    } else if (key === "f") {
      requestAutoMove();
    }
  };

  const registerSlot = (key: string, element: HTMLButtonElement | null) => {
    if (element) {
      slotElements.current.set(key, element);
    } else {
      slotElements.current.delete(key);
    }
  };

  const onWindowKeyDown = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (
      !event.defaultPrevented &&
      isInside(rootElement.current, event.target)
    ) {
      handleShortcuts(event);
    }
  });

  useEffect(() => {
    const listener = (event: globalThis.KeyboardEvent) =>
      onWindowKeyDown(event);

    window.addEventListener("keydown", listener);

    return () => window.removeEventListener("keydown", listener);
  }, []);

  const won = isWon(game);
  const targets = selected ? legalTargets(game, selected) : [];

  return (
    <section
      aria-labelledby="solitaire-title"
      className="flex min-w-0 flex-col gap-6"
      ref={rootElement}
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1
            className="text-mobile-title sm:text-page-title font-semibold"
            id="solitaire-title"
          >
            Solitaire
          </h1>
          <Button onClick={() => startNewGame()} variant="outline">
            New game
          </Button>
        </div>
        <p className="text-muted-foreground text-body">
          {guest
            ? "A quiet game. No account needed."
            : "A quiet game. Available offline."}
        </p>
        <p className="num text-muted-foreground text-label">
          Drawing {drawWords(game.drawCount)} at a time
          {" · "}
          <span className="whitespace-nowrap">
            {game.moves} {game.moves === 1 ? "move" : "moves"}
          </span>
          {" · "}
          <span className="whitespace-nowrap">
            {cardsOnFoundations(game)} of 52 cards
          </span>
          {" on the foundations"}
        </p>
      </header>

      {opening.resumedFrom === null ? null : (
        <div className="bg-parchment flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3">
          <p className="text-body">
            Resumed your last game, saved {formatSavedAt(opening.resumedFrom)}.
          </p>
          <Button onClick={() => startNewGame()} size="sm" variant="outline">
            Start fresh instead
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={!canUndo(game)}
            onClick={requestUndo}
            variant="outline"
          >
            Undo
          </Button>
          <Button onClick={requestDraw} variant="outline">
            Draw
          </Button>
          <Button onClick={requestHint} variant="outline">
            Hint
          </Button>
          <Button onClick={requestAutoMove} variant="outline">
            Send safe cards home
          </Button>
        </div>
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Cards per draw</legend>
          <span aria-hidden="true" className="text-label font-medium">
            Draw
          </span>
          {([1, 3] as const).map((count) => (
            <label
              className="border-control text-label hover:border-foreground has-checked:border-primary has-checked:bg-neutral-wash flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-4"
              key={count}
            >
              <input
                checked={preferredDraw === count}
                className="accent-primary size-5"
                name="draw-count"
                onChange={() => changeDrawCount(count)}
                type="radio"
                value={count}
              />
              {count} {count === 1 ? "card" : "cards"}
            </label>
          ))}
        </fieldset>
      </div>

      <output
        aria-live="polite"
        className="bg-parchment text-body block min-h-14 rounded-lg px-4 py-3"
      >
        <span key={announcement.id}>{announcement.text}</span>
      </output>

      {won ? (
        <div className="bg-positive-wash text-positive flex flex-wrap items-center gap-4 rounded-lg px-4 py-4">
          <p className="text-section font-semibold">
            You won in {game.moves} moves.
          </p>
          <Button onClick={() => startNewGame()}>Deal another game</Button>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-muted-foreground text-label md:hidden">
          Scroll the table sideways to reach every pile, or turn your phone
          sideways for more room.
        </p>
        <Board
          cursor={cursor}
          hint={hint}
          onActivate={activate}
          onFocusSlot={setCursor}
          onBoardKeyDown={handleBoardKeys}
          onSendHome={sendHome}
          registerSlot={registerSlot}
          selected={selected}
          state={game}
          targets={targets}
        />
      </div>

      {saveFailed ? (
        <p className="bg-warning-wash text-warning text-body rounded-lg px-4 py-3">
          This browser is not letting the game save, so your progress will be
          lost if you close this page.
        </p>
      ) : (
        <p className="text-muted-foreground text-label">
          Your game saves on this device after every move, even without an
          internet connection.
        </p>
      )}

      <HowToPlay />
    </section>
  );
};
