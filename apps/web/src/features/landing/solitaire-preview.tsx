"use client";

import { cn } from "@lifelink/ui/lib/utils";
import Link from "next/link";
import type { CSSProperties } from "react";

import { useMessages } from "@/i18n/locale";

import { HEADING, PAGE } from "./parts";
import { Reveal } from "./reveal";

/* Board geometry in rem, matching the app's 5:7 cards. */
const CARD_WIDTH = 4.222;
const CARD_HEIGHT = 5.889;
const COLUMN_STEP = 4.833;
const BOARD_PAD = 1.111;
const TABLEAU_TOP = 8.444;
const DOWN_OFFSET = 0.778;
const UP_OFFSET = 1.667;

type Suit = "♠" | "♣" | "♥" | "♦";

interface FaceUp {
  readonly rank: string;
  readonly suit: Suit;
}

/** A Klondike game in progress: face-down count and face-up run for each column. */
const TABLEAU: readonly {
  readonly down: number;
  readonly up: readonly FaceUp[];
}[] = [
  {
    down: 0,
    up: [
      { rank: "K", suit: "♥" },
      { rank: "Q", suit: "♠" },
      { rank: "J", suit: "♥" },
    ],
  },
  { down: 1, up: [{ rank: "9", suit: "♣" }] },
  {
    down: 2,
    up: [
      { rank: "6", suit: "♦" },
      { rank: "5", suit: "♠" },
    ],
  },
  {
    down: 3,
    up: [
      { rank: "Q", suit: "♣" },
      { rank: "J", suit: "♦" },
      { rank: "10", suit: "♠" },
      { rank: "9", suit: "♥" },
    ],
  },
  { down: 4, up: [] },
  {
    down: 5,
    up: [
      { rank: "4", suit: "♥" },
      { rank: "3", suit: "♣" },
    ],
  },
  { down: 5, up: [{ rank: "10", suit: "♦" }] },
];

/* The eight of spades starts on column five and moves onto the nine of hearts. */
const MOVING_FROM = { column: 4, top: TABLEAU_TOP + 4 * DOWN_OFFSET };

const MOVING_TO = {
  column: 3,
  top: TABLEAU_TOP + 3 * DOWN_OFFSET + 4 * UP_OFFSET,
};

const columnLeft = (column: number) => BOARD_PAD + column * COLUMN_STEP;
const isRed = (suit: Suit) => suit === "♥" || suit === "♦";
const rem = (value: number) => `${value.toFixed(3)}rem`;

/** Suits are drawn, so no system ever swaps them for emoji. */
const SuitIcon = ({ className, suit }: { className: string; suit: Suit }) => {
  if (suit === "♣") {
    return (
      <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
        <circle cx="12" cy="6.6" fill="currentColor" r="4.4" />
        <circle cx="6.7" cy="13.4" fill="currentColor" r="4.4" />
        <circle cx="17.3" cy="13.4" fill="currentColor" r="4.4" />
        <path d="M10.6 12h2.8l1.6 10H9z" fill="currentColor" />
      </svg>
    );
  }

  const paths: Record<Exclude<Suit, "♣">, string> = {
    "♠": "M12 2C9 5.6 4 9.2 4 13.4 4 16.2 6 18 8.4 18c1.3 0 2.4-.6 3-1.4-.2 2.2-.9 3.7-2.4 4.9h6c-1.5-1.2-2.2-2.7-2.4-4.9.6.8 1.7 1.4 3 1.4 2.4 0 4.4-1.8 4.4-4.6C20 9.2 15 5.6 12 2z",
    "♥": "M12 21.2C6.6 17.2 2.8 13.6 2.8 9.2 2.8 6.4 5 4.4 7.6 4.4c1.8 0 3.4 1 4.4 2.6 1-1.6 2.6-2.6 4.4-2.6 2.6 0 4.8 2 4.8 4.8 0 4.4-3.8 8-9.2 12z",
    "♦": "M12 2l7.6 10L12 22 4.4 12z",
  };

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path d={paths[suit]} fill="currentColor" />
    </svg>
  );
};

const cardBox = (left: number, top: number): CSSProperties => ({
  height: rem(CARD_HEIGHT),
  left: rem(left),
  top: rem(top),
  width: rem(CARD_WIDTH),
});

const FaceUpCard = ({
  card,
  className,
  style,
}: {
  card: FaceUp;
  className?: string;
  style: CSSProperties;
}) => (
  <span
    className={cn(
      "bg-raised border-control absolute flex flex-col rounded-[0.333rem] border-2 px-[0.389rem] py-[0.278rem]",
      isRed(card.suit) ? "text-negative" : "text-foreground",
      className
    )}
    style={style}
  >
    <span className="flex items-center gap-[0.111rem] text-[1.167rem] leading-none font-semibold whitespace-nowrap">
      {card.rank}
      <SuitIcon className="size-[0.889rem]" suit={card.suit} />
    </span>
    <SuitIcon
      className="mt-auto size-[1.889rem] self-center"
      suit={card.suit}
    />
  </span>
);

const FaceDownCard = ({ style }: { style: CSSProperties }) => (
  <span
    className="bg-neutral-wash border-control absolute rounded-[0.333rem] border-2"
    style={style}
  >
    <span className="border-brass absolute inset-[0.333rem] rounded-[0.167rem] border" />
  </span>
);

const EmptyFoundation = ({ left, suit }: { left: number; suit: Suit }) => (
  <span
    className="border-control text-muted-foreground absolute flex items-center justify-center rounded-[0.333rem] border-2 border-dashed"
    style={cardBox(left, BOARD_PAD)}
  >
    <SuitIcon className="size-[1.667rem]" suit={suit} />
  </span>
);

const tableauCards = () =>
  TABLEAU.flatMap((column, columnIndex) => {
    const left = columnLeft(columnIndex);

    const downCards = Array.from({ length: column.down }, (_, depth) => (
      <FaceDownCard
        key={`down-${columnIndex}-${depth}`}
        style={cardBox(left, TABLEAU_TOP + depth * DOWN_OFFSET)}
      />
    ));

    const upCards = column.up.map((card, depth) => (
      <FaceUpCard
        card={card}
        key={`${card.rank}${card.suit}`}
        style={cardBox(
          left,
          TABLEAU_TOP + column.down * DOWN_OFFSET + depth * UP_OFFSET
        )}
      />
    ));

    return [...downCards, ...upCards];
  });

const BOARD_WIDTH =
  BOARD_PAD * 2 + 7 * CARD_WIDTH + 6 * (COLUMN_STEP - CARD_WIDTH);

const BOARD_HEIGHT = MOVING_TO.top + CARD_HEIGHT + BOARD_PAD;

// SAFETY: CSSProperties has no index for custom properties; these two are plain rem strings read only by landing.css.
const movingStyle = {
  ...cardBox(columnLeft(MOVING_TO.column), MOVING_TO.top),
  "--move-from-x": rem(
    columnLeft(MOVING_FROM.column) - columnLeft(MOVING_TO.column)
  ),
  "--move-from-y": rem(MOVING_FROM.top - MOVING_TO.top),
} as CSSProperties;

const Board = () => (
  <div
    aria-hidden="true"
    className="bg-parchment relative shrink-0 rounded-[0.667rem]"
    data-ui="solitaire"
    style={{ height: rem(BOARD_HEIGHT), width: rem(BOARD_WIDTH) }}
  >
    <FaceDownCard style={cardBox(columnLeft(0), BOARD_PAD)} />
    <FaceUpCard
      card={{ rank: "7", suit: "♣" }}
      style={cardBox(columnLeft(1), BOARD_PAD)}
    />
    <FaceUpCard
      card={{ rank: "2", suit: "♥" }}
      style={cardBox(columnLeft(3), BOARD_PAD)}
    />
    <FaceUpCard
      card={{ rank: "A", suit: "♠" }}
      style={cardBox(columnLeft(4), BOARD_PAD)}
    />
    <EmptyFoundation left={columnLeft(5)} suit="♦" />
    <FaceUpCard
      card={{ rank: "A", suit: "♣" }}
      style={cardBox(columnLeft(6), BOARD_PAD)}
    />
    {tableauCards()}
    <FaceUpCard
      card={{ rank: "8", suit: "♠" }}
      className="landing-card-move z-10"
      style={movingStyle}
    />
  </div>
);

const SolitairePreview = () => {
  const t = useMessages().landing.solitaire;

  return (
    <section
      aria-labelledby="solitaire-title"
      className="landing-ink py-[5.333rem] lg:py-[10rem]"
      id="solitaire"
    >
      <div
        className={`${PAGE} flex flex-col gap-[2.667rem] lg:flex-row lg:items-center lg:justify-between`}
      >
        <div className="flex flex-col gap-[1.556rem] lg:max-w-[24.444rem]">
          <Reveal>
            <h2 className={HEADING} id="solitaire-title">
              {t.titleLine1}
              <br />
              {t.titleLine2}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[1rem] leading-[1.556] md:text-[1.111rem]">
              {t.intro}
            </p>
          </Reveal>
          <Reveal
            className="flex flex-col gap-[0.889rem] sm:flex-row sm:items-center sm:gap-[1.333rem]"
            delay={160}
          >
            <Link
              className="bg-raised text-foreground hover:bg-warning-wash flex min-h-[3.111rem] items-center justify-center px-[1.444rem] text-[1rem] font-semibold no-underline transition-colors duration-150 active:scale-[0.98]"
              href="/solitaire"
              prefetch={false}
            >
              {t.play}
            </Link>
            <span className="text-neutral-wash text-[0.944rem]">
              {t.noAccount}
            </span>
          </Reveal>
        </div>
        <Reveal
          className="flex max-w-full flex-col gap-[0.778rem] overflow-hidden"
          delay={120}
        >
          <div className="max-w-full overflow-hidden rounded-[0.667rem]">
            <p className="sr-only">{t.boardDescription}</p>
            <Board />
          </div>
          <div
            aria-hidden="true"
            className="flex flex-wrap items-center gap-[0.444rem]"
          >
            {t.controls.map((control) => (
              <span
                className="bg-parchment text-foreground flex min-h-[2.667rem] items-center rounded-[0.444rem] px-[1rem] text-[0.889rem] font-semibold"
                key={control}
              >
                {control}
              </span>
            ))}
            <span className="text-neutral-wash ml-auto text-[0.889rem]">
              {t.saved}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export { SolitairePreview };
