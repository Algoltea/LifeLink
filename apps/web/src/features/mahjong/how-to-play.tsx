import {
  dragonTile,
  DRAGONS,
  FLOWERS,
  flowerTile,
  SEASONS,
  seasonTile,
  suitTile,
  windTile,
  WINDS,
} from "@lifelink/mahjong/tiles";
import type { Tile } from "@lifelink/mahjong/tiles";
import { ChevronDownIcon } from "lucide-react";

import { TileFace } from "./tile-face";

interface TileGroup {
  readonly matches: string;
  readonly name: string;
  readonly samples: readonly Tile[];
}

const GROUPS: readonly TileGroup[] = [
  {
    matches: "Numbers 1 to 9. Match two of the same number.",
    name: "Characters (萬)",
    samples: ([1, 5, 9] as const).map((rank) => suitTile("characters", rank)),
  },
  {
    matches: "Numbers 1 to 9, in the Classic layout only.",
    name: "Dots (筒) and Bamboo (條)",
    samples: [suitTile("dots", 3), suitTile("bamboo", 7)],
  },
  {
    matches: "East, South, West, and North. Match two of the same wind.",
    name: "Winds",
    samples: WINDS.map(windTile),
  },
  {
    matches: "Red, Green, and White. Match two of the same dragon.",
    name: "Dragons",
    samples: DRAGONS.map(dragonTile),
  },
  {
    matches: "Marked 花 in the corner. Any flower matches any other flower.",
    name: "Flowers",
    samples: FLOWERS.map(flowerTile),
  },
  {
    matches: "Marked 季 in the corner. Any season matches any other season.",
    name: "Seasons",
    samples: SEASONS.map(seasonTile),
  },
];

export const HowToPlay = () => (
  <details className="group border-border text-body rounded-lg border px-4 py-2 sm:px-6">
    <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 font-semibold">
      How to play
      <ChevronDownIcon
        aria-hidden="true"
        className="text-muted-foreground size-5 shrink-0 group-open:rotate-180"
      />
    </summary>
    <div className="flex flex-col gap-6 pt-4 pb-4">
      <p className="max-w-prose">
        Clear the board by matching tiles in pairs. You can only take a free
        tile: one with nothing on top of it and an open left or right side. Free
        tiles are bright; tiles you can’t take yet are faded.
      </p>
      <p className="max-w-prose">
        Tap a tile to pick it, then tap the tile that matches it. Tap the picked
        tile again to put it down. If you get stuck, Hint shows a pair, Shuffle
        rearranges the tiles left, and Undo takes back your last move. Every
        game, and every shuffle, can be cleared.
      </p>
      <section
        aria-labelledby="mahjong-tile-guide"
        className="flex flex-col gap-3"
      >
        <h2 className="text-body font-semibold" id="mahjong-tile-guide">
          The tiles
        </h2>
        <ul className="flex flex-col">
          {GROUPS.map((group) => (
            <li
              className="border-rule flex flex-wrap items-center gap-x-6 gap-y-3 border-t py-3"
              key={group.name}
            >
              <span aria-hidden="true" className="flex gap-1.5">
                {group.samples.map((tile) => (
                  <span
                    className="[container-type:inline-size] block aspect-[4/5] w-11"
                    key={tile.id}
                  >
                    <TileFace tile={tile} />
                  </span>
                ))}
              </span>
              <span className="text-label flex min-w-[14rem] flex-1 flex-col">
                <span className="font-semibold">{group.name}</span>
                <span className="text-muted-foreground">{group.matches}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  </details>
);
