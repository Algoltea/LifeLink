"use client";

import {
  applyMove,
  canUndo,
  findHint,
  hasMovesLeft,
  isWon,
  layoutOf,
  pickable,
  tilesLeft,
  undo,
} from "@lifelink/mahjong/game";
import type { GameState, MoveResult } from "@lifelink/mahjong/game";
import { LAYOUT_IDS, layoutFor } from "@lifelink/mahjong/layouts";
import type { LayoutId } from "@lifelink/mahjong/layouts";
import type { Pair } from "@lifelink/mahjong/rules";
import { pairName, tileName } from "@lifelink/mahjong/tiles";
import { Button } from "@lifelink/ui/components/button";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { Board } from "./board";
import { clampCursor, firstFreeTile, moveCursor } from "./board-model";
import type { Direction } from "./board-model";
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

const layoutName = (layout: LayoutId): string => layoutFor(layout).name;

/** When the game was saved, as it reads in a sentence: "today at 5:43 PM" or "on Oct 24 at 5:43 PM". */
const savedWhen = (savedAt: string): string => {
  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return "earlier";
  }

  const time = date.toLocaleTimeString(undefined, { timeStyle: "short" });

  if (date.toDateString() === new Date().toDateString()) {
    return `today at ${time}`;
  }

  const day = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return `on ${day} at ${time}`;
};

const STUCK = "No pairs are free. Shuffle the tiles or undo.";

const outcomeNote = (state: GameState): string => {
  if (isWon(state)) {
    return ` You cleared the board in ${state.moves} moves. Well played.`;
  }

  return hasMovesLeft(state) ? "" : ` ${STUCK}`;
};

const openingMessage = (loaded: LoadedGame): string => {
  if (loaded.resumedFrom) {
    // A finished game is never resumed, so the only note it can need is that it is stuck.
    const stuck = hasMovesLeft(loaded.state) ? "" : ` ${STUCK}`;

    return `Resumed your game from ${savedWhen(loaded.resumedFrom)}.${stuck}`;
  }

  return loaded.discarded
    ? `Your saved game could not be opened, so a new game was dealt. ${loaded.discarded}`
    : "A new game is ready. Choose a bright tile to begin.";
};

/** The playable board. Client-only: it reads the saved game from localStorage while it first renders. */
export const MahjongTable = ({ guest = false }: { guest?: boolean }) => {
  // Read once when the table mounts; the opening state never changes afterwards.
  // oxlint-disable-next-line react/hook-use-state -- Only the first value is needed.
  const [opening] = useState(() => loadGame("easy"));
  const [game, setGame] = useState<GameState>(opening.state);
  const [cursor, setCursor] = useState(() => firstFreeTile(opening.state));
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<Pair | null>(null);

  const [announcement, setAnnouncement] = useState<Announcement>({
    id: 0,
    text: openingMessage(opening),
  });

  const [saveFailed, setSaveFailed] = useState(false);

  const [preferredLayout, setPreferredLayout] = useState<LayoutId>(
    opening.state.layout
  );

  const boardElement = useRef<HTMLDivElement>(null);
  const tileElements = useRef(new Map<number, HTMLButtonElement>());
  const boardFocusPending = useRef(false);

  const announce = (text: string) => {
    setAnnouncement((previous) => ({ id: previous.id + 1, text }));
  };

  useEffect(() => {
    if (boardFocusPending.current) {
      boardFocusPending.current = false;
      tileElements.current.get(cursor)?.focus();
    }
  }, [cursor]);

  /**
   * Moves the keyboard's place on the board. Focus follows only when it is
   * already on the board, so a hint or a button never pulls focus away.
   */
  const moveCursorTo = (next: number) => {
    if (
      next !== cursor &&
      boardElement.current?.contains(document.activeElement)
    ) {
      boardFocusPending.current = true;
    }

    setCursor(next);
  };

  const commit = (next: GameState, text: string, nextCursor = cursor) => {
    setGame(next);
    setSaveFailed(!saveGame(next));
    setSelected(null);
    setHint(null);
    // A matched tile leaves the page; focus moves to the nearest free tile.
    moveCursorTo(clampCursor(next, nextCursor));
    announce(`${text}${outcomeNote(next)}`);
  };

  const run = (result: MoveResult) => {
    if (result.ok) {
      commit(result.state, result.description);
    } else {
      announce(result.error.message);
    }
  };

  const pick = (index: number) => {
    const picked = pickable(game, index);

    if (!picked.ok) {
      const still =
        selected === null ? "" : " The tile you picked is still selected.";

      announce(`${picked.error.message}${still}`);

      return;
    }

    const name = tileName(picked.tile);

    if (selected === null) {
      setSelected(index);

      // Picking half of the hinted pair keeps the ring on its partner.
      if (hint?.first !== index && hint?.second !== index) {
        setHint(null);
      }

      announce(`Picked the ${name}. Now tap the tile that matches it.`);

      return;
    }

    if (selected === index) {
      setSelected(null);
      announce("Put the tile down. Nothing is picked.");

      return;
    }

    const result = applyMove(game, {
      first: selected,
      second: index,
      type: "match",
    });

    if (result.ok) {
      commit(result.state, result.description, index);

      return;
    }

    const first = game.tiles[selected];

    setSelected(index);
    announce(
      first
        ? `The ${tileName(first)} and the ${name} don't match. Picked the ${name} instead.`
        : result.error.message
    );
  };

  const requestUndo = () => run(undo(game));

  const requestShuffle = () => run(applyMove(game, { type: "shuffle" }));

  const requestHint = () => {
    const next = findHint(game);

    if (!next) {
      announce(isWon(game) ? "The board is already clear." : STUCK);

      return;
    }

    const first = game.tiles[next.first];
    const second = game.tiles[next.second];

    setSelected(null);
    setHint(next);
    setCursor(next.first);

    if (first && second) {
      announce(`Hint: match ${pairName(first, second)}.`);
    }
  };

  const startNewGame = (layout: LayoutId = preferredLayout) => {
    const next = freshGame(layout);

    commit(
      next,
      `Dealt a new ${layoutName(layout)} game.`,
      firstFreeTile(next)
    );
  };

  const changeLayout = (layout: LayoutId) => {
    setPreferredLayout(layout);

    if (game.moves === 0) {
      startNewGame(layout);

      return;
    }

    announce(
      `New games will use the ${layoutName(layout)} layout. This game keeps the ${layoutName(game.layout)} layout.`
    );
  };

  const handleBoardKeys = (event: KeyboardEvent<HTMLElement>) => {
    const direction = directionFor(event.key);

    if (direction) {
      event.preventDefault();
      moveCursorTo(moveCursor(game, cursor, direction));

      return;
    }

    if (event.key === "Escape" && selected !== null) {
      event.preventDefault();
      setSelected(null);
      announce("Put the tile down. Nothing is picked.");
    }
  };

  const registerTile = (index: number, element: HTMLButtonElement | null) => {
    if (element) {
      tileElements.current.set(index, element);
    } else {
      tileElements.current.delete(index);
    }
  };

  const won = isWon(game);
  // When no pair is free, Shuffle becomes the main action so the way forward stands out.
  const stuck = !(won || hasMovesLeft(game));
  const total = layoutOf(game).slots.length;
  const left = tilesLeft(game);

  return (
    <section
      aria-labelledby="mahjong-title"
      className="flex min-w-0 flex-col gap-6"
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1
            className="text-mobile-title sm:text-page-title font-semibold"
            id="mahjong-title"
          >
            Mahjong
          </h1>
          <Button onClick={() => startNewGame()} variant="outline">
            New game
          </Button>
        </div>
        <p className="text-muted-foreground text-body">
          {guest
            ? "A quiet tile game. No account needed."
            : "A quiet tile game."}
        </p>
        <p className="num text-muted-foreground text-label">
          {layoutName(game.layout)} layout
          {" · "}
          <span className="whitespace-nowrap">
            {game.moves} {game.moves === 1 ? "move" : "moves"}
          </span>
          {" · "}
          <span className="whitespace-nowrap">
            {left} of {total} tiles left
          </span>
        </p>
      </header>

      <output
        aria-live="polite"
        className="bg-parchment text-body block min-h-14 rounded-lg px-4 py-3"
      >
        <span key={announcement.id}>{announcement.text}</span>
      </output>

      {won ? (
        <div className="bg-positive-wash text-positive flex flex-wrap items-center gap-4 rounded-lg px-4 py-4">
          <p className="text-section font-semibold">
            You cleared the board in {game.moves} moves.
          </p>
          <Button onClick={() => startNewGame()}>Deal another game</Button>
        </div>
      ) : null}

      <div className="grid min-w-0 items-start gap-6 @4xl/content:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="flex min-w-0 flex-col gap-3" ref={boardElement}>
          {/* A cleared board is an empty picture; a short note keeps the page compact instead. */}
          {won ? (
            <p className="bg-parchment text-muted-foreground text-body rounded-lg px-4 py-6">
              The board is clear. Undo takes back the last pair, or deal another
              game.
            </p>
          ) : (
            <Board
              cursor={cursor}
              hint={hint}
              onActivate={pick}
              onBoardKeyDown={handleBoardKeys}
              onFocusTile={setCursor}
              registerTile={registerTile}
              selected={selected}
              state={game}
            />
          )}
          {game.layout === "classic" ? (
            <p className="text-muted-foreground text-label @4xl/content:hidden">
              Scroll the board sideways if some tiles are out of view.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 @4xl/content:sticky @4xl/content:top-6">
          <fieldset className="grid grid-cols-3 gap-2 @4xl/content:grid-cols-1">
            <legend className="sr-only">Game actions</legend>
            <Button
              disabled={!canUndo(game)}
              onClick={requestUndo}
              size="lg"
              variant="outline"
            >
              Undo
            </Button>
            <Button
              disabled={won}
              onClick={requestHint}
              size="lg"
              variant="outline"
            >
              Hint
            </Button>
            <Button
              disabled={won}
              onClick={requestShuffle}
              size="lg"
              variant={stuck ? "default" : "outline"}
            >
              Shuffle
            </Button>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label pb-2 font-medium">Layout</legend>
            <div className="grid grid-cols-2 gap-2 @4xl/content:grid-cols-1">
              {LAYOUT_IDS.map((layout) => (
                <label
                  className="border-control text-label hover:border-foreground has-checked:border-primary has-checked:bg-neutral-wash flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-4"
                  key={layout}
                >
                  <input
                    checked={preferredLayout === layout}
                    className="accent-primary size-5"
                    name="mahjong-layout"
                    onChange={() => changeLayout(layout)}
                    type="radio"
                    value={layout}
                  />
                  <span className="flex flex-col">
                    {layoutName(layout)}
                    <span className="num text-muted-foreground">
                      {layoutFor(layout).slots.length} tiles
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
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
