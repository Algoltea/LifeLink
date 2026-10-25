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

import { useMessages } from "@/i18n/locale";
import type { MahjongMessages } from "@/i18n/messages/en/mahjong";

import { TileFace } from "./tile-face";

interface TileGroup {
  readonly key: keyof MahjongMessages["groups"];
  readonly samples: readonly Tile[];
}

const GROUPS: readonly TileGroup[] = [
  {
    key: "characters",
    samples: ([1, 5, 9] as const).map((rank) => suitTile("characters", rank)),
  },
  {
    key: "otherSuits",
    samples: [suitTile("dots", 3), suitTile("bamboo", 7)],
  },
  {
    key: "winds",
    samples: WINDS.map(windTile),
  },
  {
    key: "dragons",
    samples: DRAGONS.map(dragonTile),
  },
  {
    key: "flowers",
    samples: FLOWERS.map(flowerTile),
  },
  {
    key: "seasons",
    samples: SEASONS.map(seasonTile),
  },
];

export const HowToPlay = () => {
  const messages = useMessages().mahjong;

  return (
    <details className="group border-border text-body rounded-lg border px-4 py-2 sm:px-6">
      <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 font-semibold">
        {messages.howToPlay}
        <ChevronDownIcon
          aria-hidden="true"
          className="text-muted-foreground size-5 shrink-0 group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-6 pt-4 pb-4">
        <p className="max-w-prose">{messages.rules}</p>
        <p className="max-w-prose">{messages.gestures}</p>
        <section
          aria-labelledby="mahjong-tile-guide"
          className="flex flex-col gap-3"
        >
          <h2 className="text-body font-semibold" id="mahjong-tile-guide">
            {messages.tileGuide}
          </h2>
          <ul className="flex flex-col">
            {GROUPS.map((group) => (
              <li
                className="border-rule flex flex-wrap items-center gap-x-6 gap-y-3 border-t py-3"
                key={group.key}
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
                  <span className="font-semibold">
                    {messages.groups[group.key].name}
                  </span>
                  <span className="text-muted-foreground">
                    {messages.groups[group.key].matches}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </details>
  );
};
