"use client";

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

import { currentIntlLocale, currentMessages, useMessages } from "@/i18n/locale";

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
import { cardName, translateGameMessage } from "./localization";
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
  currentMessages().solitaire.drawWords(count);

const describeSource = (state: GameState, source: MoveSource): string => {
  const t = currentMessages().solitaire;
  const picked = sourceCards(state, source);

  if (!picked.ok) {
    return t.thatCard;
  }

  const [first] = picked.cards;
  const extra = picked.cards.length - 1;
  const name = first ? cardName(first) : t.thatCard;

  return extra > 0 ? t.sourceWithCards(name, extra) : name;
};

const describeTarget = (state: GameState, target: MoveTarget): string => {
  const t = currentMessages().solitaire;

  if (target.kind === "foundation") {
    return t.toFoundation;
  }

  const top = state.tableau[target.index]?.at(-1);

  return top ? t.onto(cardName(top)) : t.toColumn(target.index + 1);
};

const describeHint = (state: GameState, hint: Move): string =>
  hint.type === "draw"
    ? currentMessages().solitaire.hintDraw
    : currentMessages().solitaire.hintMove(
        describeSource(state, hint.source),
        describeTarget(state, hint.target)
      );

const emptyReason = (state: GameState, slot: Slot): string => {
  const t = currentMessages().solitaire;

  if (slot.area === "waste") {
    return t.emptyWaste;
  }

  if (slot.area === "foundation") {
    return t.emptyFoundation;
  }

  if (
    slot.area === "tableau" &&
    (state.tableau[slot.index]?.length ?? 0) === 0
  ) {
    return t.emptyColumn;
  }

  return t.faceDown;
};

const formatSavedAt = (savedAt: string): string => {
  const date = new Date(savedAt);

  return Number.isNaN(date.getTime())
    ? currentMessages().solitaire.earlier
    : date.toLocaleString(currentIntlLocale(), {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const outcomeNote = (state: GameState): string => {
  const t = currentMessages().solitaire;

  if (isWon(state)) {
    return t.wonNote(state.moves);
  }

  return hasMovesLeft(state) ? "" : t.noMovesNote;
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
  const t = currentMessages().solitaire;

  if (loaded.resumedFrom) {
    return t.resumed;
  }

  return loaded.discarded
    ? t.discarded(translateGameMessage(loaded.discarded))
    : t.ready;
};

const isInside = (
  root: HTMLElement | null,
  target: EventTarget | null
): boolean =>
  target === document.body ||
  (root !== null && target instanceof Node && root.contains(target));

/** The playable table. Client-only: it reads the saved game from localStorage while it first renders. */
export const SolitaireTable = ({ guest = false }: { guest?: boolean }) => {
  const t = useMessages().solitaire;
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
      commit(
        result.state,
        translateGameMessage(result.description),
        nextCursor
      );
    } else {
      announce(translateGameMessage(result.error.message));
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
        ? t.selectedBlocked(name)
        : t.selectedTargets(name, targets.length)
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
        commit(home.state, translateGameMessage(home.description));
      } else {
        setSelected(null);
        announce(t.putBack);
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
          translateGameMessage(result.description),
          slotForTarget(result.state, target)
        );
      } else {
        announce(
          `${translateGameMessage(result.error.message)} ${t.chooseAnother}`
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
      announce(t.noUsefulMoves);

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
      announce(t.noSafeCards);

      return;
    }

    const names = result.moved.map((card) => cardName(card)).join(", ");
    const count = result.moved.length;

    commit(result.state, t.sentSafe(count, names));
  };

  const startNewGame = (drawCount: DrawCount = preferredDraw) => {
    setOpening((current) => ({
      ...current,
      discarded: null,
      resumedFrom: null,
    }));
    commit(freshGame(drawCount), t.dealt(drawWords(drawCount)), STOCK_SLOT);
  };

  const changeDrawCount = (drawCount: DrawCount) => {
    setPreferredDraw(drawCount);

    if (game.moves === 0) {
      startNewGame(drawCount);

      return;
    }

    announce(t.drawSetting(drawWords(drawCount), drawWords(game.drawCount)));
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
      announce(t.nothingSelected);
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
            {t.title}
          </h1>
          <Button onClick={() => startNewGame()} variant="outline">
            {t.newGame}
          </Button>
        </div>
        <p className="text-muted-foreground text-body">
          {guest ? t.guestIntro : t.intro}
        </p>
        <p className="num text-muted-foreground text-label">
          {t.drawing(drawWords(game.drawCount))}
          {" · "}
          <span className="whitespace-nowrap">{t.moves(game.moves)}</span>
          {" · "}
          <span className="whitespace-nowrap">
            {t.foundationCount(cardsOnFoundations(game))}
          </span>
        </p>
      </header>

      {opening.resumedFrom === null ? null : (
        <div className="bg-parchment flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3">
          <p className="text-body">
            {t.resumedAt(formatSavedAt(opening.resumedFrom))}
          </p>
          <Button onClick={() => startNewGame()} size="sm" variant="outline">
            {t.startFresh}
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
            {t.undo}
          </Button>
          <Button onClick={requestDraw} variant="outline">
            {t.draw}
          </Button>
          <Button onClick={requestHint} variant="outline">
            {t.hint}
          </Button>
          <Button onClick={requestAutoMove} variant="outline">
            {t.safeCards}
          </Button>
        </div>
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">{t.cardsPerDraw}</legend>
          <span aria-hidden="true" className="text-label font-medium">
            {t.draw}
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
              {t.cards(count)}
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
          <p className="text-section font-semibold">{t.won(game.moves)}</p>
          <Button onClick={() => startNewGame()}>{t.dealAgain}</Button>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-muted-foreground text-label md:hidden">
          {t.scrollHint}
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
          {t.saveFailed}
        </p>
      ) : (
        <p className="text-muted-foreground text-label">{t.savedHint}</p>
      )}

      <HowToPlay />
    </section>
  );
};
