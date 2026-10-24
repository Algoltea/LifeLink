import type { Card } from "@lifelink/solitaire/cards";
import type {
  Move,
  MoveSource,
  MoveTarget,
  Position,
} from "@lifelink/solitaire/game";
import { FOUNDATION_SUITS } from "@lifelink/solitaire/rules";
import { cn } from "@lifelink/ui/lib/utils";
import { RotateCcw } from "lucide-react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

import { useMessages } from "@/i18n/locale";

import {
  foundationLabel,
  sameSlot,
  sameSource,
  slotKey,
  sourceCovers,
  stockLabel,
  tableauCardLabel,
  targetMatches,
  wasteLabel,
} from "./board-model";
import type { Slot } from "./board-model";
import type { SolitaireMessages } from "./localization";
import { CardBack, CardFace, EmptyFoundation, EmptyPile } from "./playing-card";

type Mark = "hint" | "none" | "selected" | "target";

export interface BoardProps {
  readonly cursor: Slot;
  readonly hint: Move | null;
  readonly onActivate: (slot: Slot) => void;
  readonly onFocusSlot: (slot: Slot) => void;
  readonly onBoardKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  readonly onSendHome: (slot: Slot) => void;
  readonly registerSlot: (
    key: string,
    element: HTMLButtonElement | null
  ) => void;
  readonly selected: MoveSource | null;
  readonly state: Position;
  readonly targets: readonly MoveTarget[];
}

const MARK_STYLES: Readonly<Record<Exclude<Mark, "none">, string>> = {
  hint: "border-warning border-dashed",
  selected: "border-primary border-solid",
  target: "border-primary border-dashed",
};

/** A 3px ring drawn just outside the card, leaving room for the focus outline beyond it. */
const MarkRing = ({ mark }: { readonly mark: Mark }) =>
  mark === "none" ? null : (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -inset-0.5 rounded-md border-[3px]",
        MARK_STYLES[mark]
      )}
    />
  );

interface SlotButtonProps {
  readonly board: BoardProps;
  readonly children: ReactNode;
  readonly className?: string;
  readonly label: string;
  readonly mark: Mark;
  readonly slot: Slot;
}

const markSuffix = (mark: Mark, t: SolitaireMessages): string => {
  if (mark === "selected") {
    return t.selected;
  }

  if (mark === "target") {
    return t.target;
  }

  return mark === "hint" ? t.suggested : "";
};

const SlotButton = ({
  board,
  children,
  className,
  label,
  mark,
  slot,
}: SlotButtonProps) => {
  const t = useMessages().solitaire;
  const key = slotKey(slot);

  return (
    <button
      aria-label={`${label}${markSuffix(mark, t)}`}
      className={cn(
        "hover:outline-control relative block aspect-[5/7] w-full cursor-pointer rounded-md text-left hover:outline hover:outline-2 focus-visible:z-10",
        className
      )}
      onClick={() => board.onActivate(slot)}
      onDoubleClick={() => board.onSendHome(slot)}
      onFocus={() => board.onFocusSlot(slot)}
      onKeyDown={(event) => board.onBoardKeyDown(event)}
      ref={(element) => board.registerSlot(key, element)}
      tabIndex={sameSlot(board.cursor, slot) ? 0 : -1}
      type="button"
    >
      {children}
      <MarkRing mark={mark} />
    </button>
  );
};

const hintSource = (hint: Move | null): MoveSource | null =>
  hint?.type === "transfer" ? hint.source : null;

const hintTargets = (hint: Move | null): MoveTarget[] =>
  hint?.type === "transfer" ? [hint.target] : [];

const pileMark = (
  board: BoardProps,
  source: MoveSource | null,
  kind: MoveTarget["kind"] | null,
  index: number
): Mark => {
  if (source && sameSource(board.selected, source)) {
    return "selected";
  }

  if (kind && targetMatches(board.targets, kind, index)) {
    return "target";
  }

  if (source && sameSource(hintSource(board.hint), source)) {
    return "hint";
  }

  return kind && targetMatches(hintTargets(board.hint), kind, index)
    ? "hint"
    : "none";
};

const StockPile = ({ board }: { readonly board: BoardProps }) => {
  const t = useMessages().solitaire;
  const { state } = board;
  const mark: Mark = board.hint?.type === "draw" ? "hint" : "none";

  return (
    <div className="[container-type:inline-size]">
      <SlotButton
        board={board}
        label={stockLabel(state, t)}
        mark={mark}
        slot={{ area: "stock" }}
      >
        {state.stock.length > 0 ? (
          <CardBack />
        ) : (
          <span className="border-control text-muted-foreground flex size-full items-center justify-center rounded-md border-2 border-dashed">
            {state.waste.length > 0 ? (
              <RotateCcw aria-hidden="true" className="size-[40cqi]" />
            ) : null}
          </span>
        )}
      </SlotButton>
    </div>
  );
};

const FAN_OFFSETS = ["left-0", "left-[24cqi]", "left-[48cqi]"] as const;

const WastePile = ({ board }: { readonly board: BoardProps }) => {
  const t = useMessages().solitaire;
  const { state } = board;
  const visible = state.waste.slice(-state.drawCount);
  const top = visible.at(-1);
  const under = visible.slice(0, -1);
  const source: MoveSource | null = top ? { kind: "waste" } : null;
  const mark = pileMark(board, source, null, 0);
  const topOffset = FAN_OFFSETS[under.length] ?? "left-0";

  return (
    <div className="col-span-2">
      <div className="[container-type:inline-size] relative w-[calc((100%_-_var(--board-gap))/2)]">
        {under.map((card: Card, position) => (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-0 block aspect-[5/7] w-full",
              FAN_OFFSETS[position]
            )}
            key={card.id}
          >
            <CardFace card={card} />
          </span>
        ))}
        <SlotButton
          board={board}
          className={cn(under.length > 0 && "absolute top-0", topOffset)}
          label={wasteLabel(state, t)}
          mark={mark}
          slot={{ area: "waste" }}
        >
          {top ? (
            <CardFace
              card={top}
              tone={mark === "selected" ? "selected" : "plain"}
            />
          ) : (
            <EmptyPile label={t.waste} />
          )}
        </SlotButton>
        {under.length > 0 ? (
          <span aria-hidden="true" className="block aspect-[5/7] w-full" />
        ) : null}
      </div>
    </div>
  );
};

const FoundationPile = ({
  board,
  index,
}: {
  readonly board: BoardProps;
  readonly index: number;
}) => {
  const t = useMessages().solitaire;
  const top = board.state.foundations[index]?.at(-1);
  const suit = FOUNDATION_SUITS[index];
  const source: MoveSource | null = top ? { index, kind: "foundation" } : null;
  const mark = pileMark(board, source, "foundation", index);

  return (
    <div className="[container-type:inline-size]">
      <SlotButton
        board={board}
        label={foundationLabel(board.state, index, t)}
        mark={mark}
        slot={{ area: "foundation", index }}
      >
        {top ? (
          <CardFace
            card={top}
            tone={mark === "selected" ? "selected" : "plain"}
          />
        ) : null}
        {!top && suit ? <EmptyFoundation suit={suit} /> : null}
      </SlotButton>
    </div>
  );
};

/** Keep a 3rem exposed target on stacked face-up cards; face-down cards show a thin edge. */
const stackOffset = (previous: Card | undefined): string => {
  if (!previous) {
    return "";
  }

  return previous.faceUp ? "-mt-[calc(140cqi_-_3rem)]" : "-mt-[124cqi]";
};

const tableauMark = (
  board: BoardProps,
  index: number,
  cardIndex: number,
  isTop: boolean
): Mark => {
  if (sourceCovers(board.selected, index, cardIndex)) {
    return "selected";
  }

  if (isTop && targetMatches(board.targets, "tableau", index)) {
    return "target";
  }

  if (sourceCovers(hintSource(board.hint), index, cardIndex)) {
    return "hint";
  }

  return isTop && targetMatches(hintTargets(board.hint), "tableau", index)
    ? "hint"
    : "none";
};

const TableauColumn = ({
  board,
  index,
}: {
  readonly board: BoardProps;
  readonly index: number;
}) => {
  const t = useMessages().solitaire;
  const column = board.state.tableau[index] ?? [];

  if (column.length === 0) {
    const mark = tableauMark(board, index, 0, true);

    return (
      <div className="[container-type:inline-size]">
        <SlotButton
          board={board}
          label={tableauCardLabel(column, index, 0, t)}
          mark={mark}
          slot={{ area: "tableau", cardIndex: 0, index }}
        >
          <EmptyPile label={t.king} />
        </SlotButton>
      </div>
    );
  }

  return (
    <div className="[container-type:inline-size] flex flex-col">
      {column.map((card, cardIndex) => {
        const offset = stackOffset(column[cardIndex - 1]);

        if (!card.faceUp) {
          return (
            <span
              aria-hidden="true"
              className={cn("block aspect-[5/7] w-full", offset)}
              key={card.id}
            >
              <CardBack />
            </span>
          );
        }

        const mark = tableauMark(
          board,
          index,
          cardIndex,
          cardIndex === column.length - 1
        );

        return (
          <SlotButton
            board={board}
            className={offset}
            key={card.id}
            label={tableauCardLabel(column, index, cardIndex, t)}
            mark={mark}
            slot={{ area: "tableau", cardIndex, index }}
          >
            <CardFace
              card={card}
              tone={mark === "selected" ? "selected" : "plain"}
            />
          </SlotButton>
        );
      })}
    </div>
  );
};

const FOUNDATION_INDEXES = [0, 1, 2, 3] as const;

const COLUMN_INDEXES = [0, 1, 2, 3, 4, 5, 6] as const;

/*
 * Seven equal columns: 7 × 4rem cards + 6 × 0.75rem gaps = 32.5rem minimum.
 * Both rows share one grid width, capped at 56rem, and scroll together when
 * the shell is narrower. Card sizes follow the person's text-size setting.
 *
 * The width is also capped by the screen height so a fresh deal fits without
 * scrolling: the dealt table is about 4.1 card widths tall, and the header,
 * controls, message, and padding take about 23.5rem. Width = 7 cards + 4.5rem
 * of gaps.
 */
const TALL_PER_WIDE = 7 / 4.1;

const ROOM_AROUND_TABLE = "23.5rem";

const TABLE_WIDTH: CSSProperties = {
  maxWidth: `min(56rem, calc((100svh - ${ROOM_AROUND_TABLE}) * ${TALL_PER_WIDE.toFixed(3)} + 4.5rem))`,
};

// Every slot button forwards arrow keys and Escape to the board; Enter and Space click it natively.
export const Board = (board: BoardProps) => {
  const t = useMessages().solitaire;

  return (
    <section
      aria-label={t.table}
      className="bg-parchment min-w-0 overflow-x-auto overscroll-x-contain rounded-lg p-4 [--board-gap:0.75rem] sm:p-6"
    >
      <div className="mx-auto w-full min-w-[32.5rem]" style={TABLE_WIDTH}>
        <div className="grid grid-cols-7 gap-(--board-gap)">
          <StockPile board={board} />
          <WastePile board={board} />
          {FOUNDATION_INDEXES.map((index) => (
            <FoundationPile board={board} index={index} key={index} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-7 items-start gap-(--board-gap) pb-2">
          {COLUMN_INDEXES.map((index) => (
            <TableauColumn board={board} index={index} key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
