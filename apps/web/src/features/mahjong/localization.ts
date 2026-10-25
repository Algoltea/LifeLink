import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { hasMovesLeft, isWon, layoutOf } from "@lifelink/mahjong/game";
import type { GameState, MoveError, Position } from "@lifelink/mahjong/game";
import { blockerFor } from "@lifelink/mahjong/rules";
import type { Tile } from "@lifelink/mahjong/tiles";

import type { MahjongMessages } from "@/i18n/messages/en/mahjong";

import type { LoadedGame } from "./storage";

export type Notice = (
  messages: MahjongMessages,
  locale: InterfaceLocale
) => string;

export const tileName = (tile: Tile, messages: MahjongMessages): string => {
  switch (tile.kind) {
    case "suit": {
      return messages.suitTile(tile.rank, messages.suits[tile.suit]);
    }

    case "wind": {
      return messages.windTile(messages.winds[tile.wind]);
    }

    case "dragon": {
      return messages.dragonTile(messages.dragons[tile.dragon]);
    }

    case "flower": {
      return messages.flowerTile(messages.flowers[tile.flower]);
    }

    default: {
      return messages.seasonTile(messages.seasons[tile.season]);
    }
  }
};

export const pairName = (
  first: Tile,
  second: Tile,
  messages: MahjongMessages
): string =>
  messages.pair(tileName(first, messages), tileName(second, messages));

export const tileLabel = (
  state: Position,
  index: number,
  messages: MahjongMessages
): string => {
  const layout = layoutOf(state);
  const tile = state.tiles[index];
  const slot = layout.slots[index];

  if (!(tile && slot)) {
    return messages.blocked.removed;
  }

  const blocker = blockerFor(layout, state.tiles, index);

  return `${messages.tilePosition(tileName(tile, messages), slot.z + 1, Math.floor(slot.y / 2) + 1, Math.floor(slot.x / 2) + 1)} ${blocker ? messages.blocked[blocker] : messages.free}`;
};

export const moveError = (
  error: MoveError,
  state: Position,
  messages: MahjongMessages,
  index?: number
): string => {
  if (error.code === "blocked" && index !== undefined) {
    const blocker = blockerFor(layoutOf(state), state.tiles, index);

    if (blocker) {
      return messages.blocked[blocker];
    }
  }

  return messages.errors[error.code];
};

export const savedWhen = (
  savedAt: string,
  locale: InterfaceLocale,
  messages: MahjongMessages
): string => {
  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return messages.earlier;
  }

  const intlLocale = intlLocaleOf(locale);

  const time = new Intl.DateTimeFormat(intlLocale, {
    timeStyle: "short",
  }).format(date);

  if (date.toDateString() === new Date().toDateString()) {
    return messages.todayAt(time);
  }

  const day = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "short",
  }).format(date);

  return messages.onDateAt(day, time);
};

export const outcomeNote = (
  state: GameState,
  messages: MahjongMessages
): string => {
  if (isWon(state)) {
    return ` ${messages.cleared(state.moves)} ${messages.wellPlayed}`;
  }

  return hasMovesLeft(state) ? "" : ` ${messages.stuck}`;
};

export const openingMessage =
  (loaded: LoadedGame): Notice =>
  (messages, locale) => {
    if (loaded.resumedFrom) {
      return `${messages.resumed(savedWhen(loaded.resumedFrom, locale, messages))}${hasMovesLeft(loaded.state) ? "" : ` ${messages.stuck}`}`;
    }

    return loaded.discarded ? messages.discarded : messages.ready;
  };
