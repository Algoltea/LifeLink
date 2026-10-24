import type {
  Dragon,
  Flower,
  Rank,
  Season,
  Suit,
  Tile,
  Wind,
} from "@lifelink/mahjong/tiles";
import { cn } from "@lifelink/ui/lib/utils";

/*
 * Tiles are drawn with real Chinese characters as plain text, never Unicode
 * mahjong symbols (iPhones show those as emoji) and never pictures, so every
 * tile stays sharp, follows the theme, and needs nothing extra offline. Sizes
 * are container units (cqi): each tile is its own inline-size container.
 */

/** System Chinese fonts, so the characters render without downloading anything. */
const HAN_FONT =
  "[font-family:'PingFang_TC','Hiragino_Sans_CNS','Noto_Sans_TC','Noto_Sans_CJK_TC','Microsoft_JhengHei',sans-serif]";

const NUMERALS: Readonly<Record<Rank, string>> = {
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
  7: "七",
  8: "八",
  9: "九",
};

const SUIT_CHARACTERS: Readonly<Record<Suit, string>> = {
  bamboo: "條",
  characters: "萬",
  dots: "筒",
};

/** Suits differ by colour as well as by character; the character always tells them apart on its own. */
const SUIT_INK: Readonly<Record<Suit, string>> = {
  bamboo: "text-brass-ink",
  characters: "text-accent-foreground",
  dots: "text-foreground",
};

const WIND_CHARACTERS: Readonly<Record<Wind, string>> = {
  east: "東",
  north: "北",
  south: "南",
  west: "西",
};

const WIND_LETTERS: Readonly<Record<Wind, string>> = {
  east: "E",
  north: "N",
  south: "S",
  west: "W",
};

const DRAGON_CHARACTERS: Readonly<Record<Exclude<Dragon, "white">, string>> = {
  green: "發",
  red: "中",
};

const FLOWER_CHARACTERS: Readonly<Record<Flower, string>> = {
  bamboo: "竹",
  chrysanthemum: "菊",
  orchid: "蘭",
  plum: "梅",
};

const SEASON_CHARACTERS: Readonly<Record<Season, string>> = {
  autumn: "秋",
  spring: "春",
  summer: "夏",
  winter: "冬",
};

const Corner = ({
  children,
  className,
}: {
  readonly children: string;
  readonly className?: string;
}) => (
  <span
    className={cn(
      "absolute top-[5cqi] left-[8cqi] text-[24cqi] leading-none font-semibold",
      className
    )}
  >
    {children}
  </span>
);

const Large = ({
  children,
  className,
}: {
  readonly children: string;
  readonly className?: string;
}) => (
  <span className={cn(HAN_FONT, "text-[58cqi] leading-none", className)}>
    {children}
  </span>
);

const Glyph = ({ tile }: { readonly tile: Tile }) => {
  switch (tile.kind) {
    case "suit": {
      const ink = SUIT_INK[tile.suit];

      return (
        <>
          <Corner className={ink}>{String(tile.rank)}</Corner>
          <span className="flex flex-col items-center gap-[4cqi] pt-[10cqi]">
            <span
              className={cn(
                HAN_FONT,
                "text-foreground text-[40cqi] leading-none"
              )}
            >
              {NUMERALS[tile.rank]}
            </span>
            <span className={cn(HAN_FONT, "text-[40cqi] leading-none", ink)}>
              {SUIT_CHARACTERS[tile.suit]}
            </span>
          </span>
        </>
      );
    }

    case "wind": {
      return (
        <>
          <Corner className="text-foreground">{WIND_LETTERS[tile.wind]}</Corner>
          <Large className="text-foreground pt-[10cqi]">
            {WIND_CHARACTERS[tile.wind]}
          </Large>
        </>
      );
    }

    case "dragon": {
      if (tile.dragon === "white") {
        return (
          <span className="border-brass block h-[62%] w-[56%] rounded-[6cqi] border-[5cqi]" />
        );
      }

      return (
        <Large
          className={
            tile.dragon === "red" ? "text-negative" : "text-foreground"
          }
        >
          {DRAGON_CHARACTERS[tile.dragon]}
        </Large>
      );
    }

    case "flower": {
      return (
        <>
          <Corner className={cn(HAN_FONT, "text-accent-foreground")}>花</Corner>
          <Large className="text-accent-foreground pt-[10cqi]">
            {FLOWER_CHARACTERS[tile.flower]}
          </Large>
        </>
      );
    }

    default: {
      return (
        <>
          <Corner className={cn(HAN_FONT, "text-brass-ink")}>季</Corner>
          <Large className="text-brass-ink pt-[10cqi]">
            {SEASON_CHARACTERS[tile.season]}
          </Large>
        </>
      );
    }
  }
};

export type TileTone = "blocked" | "free" | "selected";

interface TileFaceProps {
  readonly tile: Tile;
  readonly tone?: TileTone;
}

/**
 * A tile with depth: the writing-paper face sits up and to the left of a
 * brass-coloured edge. Blocked tiles fade to 55%, the same treatment the app
 * uses for anything unavailable; the tile's label always says so in words.
 */
export const TileFace = ({ tile, tone = "free" }: TileFaceProps) => (
  <span aria-hidden="true" className="relative block size-full" lang="zh-Hant">
    <span className="bg-brass-soft border-control absolute inset-0 rounded-[10cqi] border" />
    <span
      className={cn(
        "border-control absolute top-0 right-[7cqi] bottom-[7cqi] left-0 flex items-center justify-center overflow-hidden rounded-[10cqi] border-2",
        tone === "selected" && "bg-accent",
        tone === "blocked" && "bg-parchment",
        tone === "free" && "bg-raised"
      )}
    >
      <span
        className={cn(
          "flex size-full items-center justify-center",
          tone === "blocked" && "opacity-55"
        )}
      >
        <Glyph tile={tile} />
      </span>
    </span>
  </span>
);
