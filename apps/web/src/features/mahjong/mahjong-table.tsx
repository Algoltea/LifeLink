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
import { Button } from "@lifelink/ui/components/button";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { messagesFor, useLocale } from "@/i18n/locale";

import { Board } from "./board";
import { clampCursor, firstFreeTile, moveCursor } from "./board-model";
import type { Direction } from "./board-model";
import { HowToPlay } from "./how-to-play";
import {
  moveError,
  openingMessage,
  outcomeNote,
  pairName,
  tileName,
} from "./localization";
import type { Notice } from "./localization";
import { freshGame, loadGame, saveGame } from "./storage";

interface Announcement {
  readonly id: number;
  readonly text: Notice;
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

/** The playable board. Client-only: it reads the saved game from localStorage while it first renders. */
export const MahjongTable = ({ guest = false }: { guest?: boolean }) => {
  const locale = useLocale();
  const messages = messagesFor(locale).mahjong;
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

  const announce = (text: Notice) => {
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

  const commit = (next: GameState, text: Notice, nextCursor = cursor) => {
    setGame(next);
    setSaveFailed(!saveGame(next));
    setSelected(null);
    setHint(null);
    // A matched tile leaves the page; focus moves to the nearest free tile.
    moveCursorTo(clampCursor(next, nextCursor));
    announce(
      (words, language) => `${text(words, language)}${outcomeNote(next, words)}`
    );
  };

  const run = (result: MoveResult, text: Notice) => {
    if (result.ok) {
      commit(result.state, text);
    } else {
      announce((words) => moveError(result.error, game, words));
    }
  };

  const pick = (index: number) => {
    const picked = pickable(game, index);

    if (!picked.ok) {
      announce(
        (words) =>
          `${moveError(picked.error, game, words, index)}${selected === null ? "" : ` ${words.stillSelected}`}`
      );

      return;
    }

    if (selected === null) {
      setSelected(index);

      // Picking half of the hinted pair keeps the ring on its partner.
      if (hint?.first !== index && hint?.second !== index) {
        setHint(null);
      }

      announce((words) => words.picked(tileName(picked.tile, words)));

      return;
    }

    if (selected === index) {
      setSelected(null);
      announce((words) => words.putDown);

      return;
    }

    const result = applyMove(game, {
      first: selected,
      second: index,
      type: "match",
    });

    if (result.ok) {
      const first = game.tiles[selected];
      commit(
        result.state,
        (words) =>
          words.matched(
            first
              ? pairName(first, picked.tile, words)
              : tileName(picked.tile, words),
            tilesLeft(result.state)
          ),
        index
      );

      return;
    }

    const first = game.tiles[selected];

    setSelected(index);
    announce((words) =>
      first
        ? words.mismatch(tileName(first, words), tileName(picked.tile, words))
        : moveError(result.error, game, words, index)
    );
  };

  const requestUndo = () => run(undo(game), (words) => words.undone);

  const requestShuffle = () =>
    run(applyMove(game, { type: "shuffle" }), (words) => words.shuffled);

  const requestHint = () => {
    const next = findHint(game);

    if (!next) {
      announce((words) => (isWon(game) ? words.alreadyClear : words.stuck));

      return;
    }

    const first = game.tiles[next.first];
    const second = game.tiles[next.second];

    setSelected(null);
    setHint(next);
    setCursor(next.first);

    if (first && second) {
      announce((words) => words.hintPair(pairName(first, second, words)));
    }
  };

  const startNewGame = (layout: LayoutId = preferredLayout) => {
    const next = freshGame(layout);

    commit(
      next,
      (words) => words.dealt(words.layouts[layout]),
      firstFreeTile(next)
    );
  };

  const changeLayout = (layout: LayoutId) => {
    setPreferredLayout(layout);

    if (game.moves === 0) {
      startNewGame(layout);

      return;
    }

    announce((words) =>
      words.layoutSetting(words.layouts[layout], words.layouts[game.layout])
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
      announce((words) => words.putDown);
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
            {messages.title}
          </h1>
          <Button onClick={() => startNewGame()} variant="outline">
            {messages.newGame}
          </Button>
        </div>
        <p className="text-muted-foreground text-body">
          {guest ? messages.guestSubtitle : messages.subtitle}
        </p>
        <p className="num text-muted-foreground text-label">
          {messages.layoutLabel(messages.layouts[game.layout])}
          {" · "}
          <span className="whitespace-nowrap">
            {messages.moves(game.moves)}
          </span>
          {" · "}
          <span className="whitespace-nowrap">
            {messages.tilesLeft(left, total)}
          </span>
        </p>
      </header>

      <output
        aria-live="polite"
        className="bg-parchment text-body block min-h-14 rounded-lg px-4 py-3"
      >
        <span key={announcement.id}>{announcement.text(messages, locale)}</span>
      </output>

      {won ? (
        <div className="bg-positive-wash text-positive flex flex-wrap items-center gap-4 rounded-lg px-4 py-4">
          <p className="text-section font-semibold">
            {messages.cleared(game.moves)}
          </p>
          <Button onClick={() => startNewGame()}>{messages.dealAgain}</Button>
        </div>
      ) : null}

      <div className="grid min-w-0 items-start gap-6 @4xl/content:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="flex min-w-0 flex-col gap-3" ref={boardElement}>
          {/* A cleared board is an empty picture; a short note keeps the page compact instead. */}
          {won ? (
            <p className="bg-parchment text-muted-foreground text-body rounded-lg px-4 py-6">
              {messages.clearBoard}
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
              {messages.scroll}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 @4xl/content:sticky @4xl/content:top-6">
          <fieldset className="grid grid-cols-3 gap-2 @4xl/content:grid-cols-1">
            <legend className="sr-only">{messages.actions}</legend>
            <Button
              disabled={!canUndo(game)}
              onClick={requestUndo}
              size="lg"
              variant="outline"
            >
              {messages.undo}
            </Button>
            <Button
              disabled={won}
              onClick={requestHint}
              size="lg"
              variant="outline"
            >
              {messages.hint}
            </Button>
            <Button
              disabled={won}
              onClick={requestShuffle}
              size="lg"
              variant={stuck ? "default" : "outline"}
            >
              {messages.shuffle}
            </Button>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label pb-2 font-medium">
              {messages.layout}
            </legend>
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
                    {messages.layouts[layout]}
                    <span className="num text-muted-foreground">
                      {messages.tiles(layoutFor(layout).slots.length)}
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
          {messages.saveFailed}
        </p>
      ) : (
        <p className="text-muted-foreground text-label">{messages.saved}</p>
      )}

      <HowToPlay />
    </section>
  );
};
