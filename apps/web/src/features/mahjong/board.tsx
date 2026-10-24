import { layoutOf } from "@lifelink/mahjong/game";
import type { Position } from "@lifelink/mahjong/game";
import { isFree } from "@lifelink/mahjong/rules";
import type { Pair } from "@lifelink/mahjong/rules";
import { cn } from "@lifelink/ui/lib/utils";
import type { KeyboardEvent } from "react";

import { boardStyle, tileLabel, tileStyle } from "./board-model";
import { TileFace } from "./tile-face";
import type { TileTone } from "./tile-face";

type Mark = "hint" | "none" | "selected";

export interface BoardProps {
  readonly cursor: number;
  readonly hint: Pair | null;
  readonly onActivate: (index: number) => void;
  readonly onBoardKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  readonly onFocusTile: (index: number) => void;
  readonly registerTile: (
    index: number,
    element: HTMLButtonElement | null
  ) => void;
  readonly selected: number | null;
  readonly state: Position;
}

const MARK_STYLES: Readonly<Record<Exclude<Mark, "none">, string>> = {
  hint: "border-warning border-dashed",
  selected: "border-primary border-solid",
};

const markSuffix = (mark: Mark): string => {
  if (mark === "selected") {
    return " Selected.";
  }

  return mark === "hint" ? " Suggested by the hint." : "";
};

const markFor = (board: BoardProps, index: number): Mark => {
  if (board.selected === index) {
    return "selected";
  }

  return board.hint?.first === index || board.hint?.second === index
    ? "hint"
    : "none";
};

const toneFor = (mark: Mark, free: boolean): TileTone => {
  if (mark === "selected") {
    return "selected";
  }

  return free ? "free" : "blocked";
};

/*
 * Tiles are absolutely placed in percentages of the board, so the whole
 * layout scales as one picture. Each tile is a button; only the keyboard's
 * current tile is in the tab order, and the arrow keys move between free
 * tiles. Enter and Space click the focused tile natively.
 */
export const Board = (board: BoardProps) => {
  const { state } = board;
  const layout = layoutOf(state);

  return (
    <section
      aria-describedby="mahjong-board-keys"
      aria-label="Tile board"
      className="bg-parchment min-w-0 overflow-x-auto overscroll-x-contain rounded-lg p-4 sm:p-6"
    >
      <p className="sr-only" id="mahjong-board-keys">
        Use the arrow keys to move between free tiles. Press Enter to pick a
        tile, and Escape to put it down.
      </p>
      <div className="relative mx-auto w-full" style={boardStyle(layout)}>
        {state.tiles.map((tile, index) => {
          const slot = layout.slots[index];

          if (!(tile && slot)) {
            return null;
          }

          const mark = markFor(board, index);
          const free = isFree(layout, state.tiles, index);

          return (
            <button
              aria-label={`${tileLabel(state, index)}${markSuffix(mark)}`}
              className={cn(
                "[container-type:inline-size] absolute z-(--tile-layer) block touch-manipulation rounded-[10%] select-none focus-visible:z-50",
                // Only free tiles answer the pointer; a free tile has nothing on top, so lifting it is safe.
                free
                  ? "hover:outline-control cursor-pointer hover:z-40 hover:outline-2 hover:outline-offset-1"
                  : "cursor-default"
              )}
              // Slot indexes are stable for the whole game, so they key the tiles.
              key={index}
              onClick={() => board.onActivate(index)}
              onFocus={() => board.onFocusTile(index)}
              onKeyDown={(event) => board.onBoardKeyDown(event)}
              ref={(element) => board.registerTile(index, element)}
              style={tileStyle(layout, slot, mark !== "none")}
              tabIndex={board.cursor === index ? 0 : -1}
              type="button"
            >
              <TileFace tile={tile} tone={toneFor(mark, free)} />
              {mark === "none" ? null : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -inset-0.5 rounded-[12cqi] border-[3px]",
                    MARK_STYLES[mark]
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
