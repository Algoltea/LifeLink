import { interfaceLocales, intlLocaleOf } from "@lifelink/contracts/locale";
import { newGame } from "@lifelink/mahjong/game";
import type { MoveErrorCode } from "@lifelink/mahjong/game";
import {
  DRAGONS,
  FLOWERS,
  RANKS,
  SEASONS,
  SUITS,
  WINDS,
  dragonTile,
  flowerTile,
  seasonTile,
  suitTile,
  windTile,
} from "@lifelink/mahjong/tiles";
import { describe, expect, it } from "vitest";

import { messagesFor } from "@/i18n/locale";
import type { MahjongMessages } from "@/i18n/messages/en/mahjong";

import {
  moveError,
  openingMessage,
  savedWhen,
  tileLabel,
  tileName,
} from "./localization";

const catalogKeys = (messages: MahjongMessages) => ({
  blocked: Object.keys(messages.blocked).toSorted(),
  dragons: Object.keys(messages.dragons).toSorted(),
  errors: Object.keys(messages.errors).toSorted(),
  flowers: Object.keys(messages.flowers).toSorted(),
  groups: Object.entries(messages.groups)
    .map(([name, group]) => [name, Object.keys(group).toSorted()])
    .toSorted(),
  layouts: Object.keys(messages.layouts).toSorted(),
  root: Object.keys(messages).toSorted(),
  seasons: Object.keys(messages.seasons).toSorted(),
  suits: Object.keys(messages.suits).toSorted(),
  winds: Object.keys(messages.winds).toSorted(),
});

const ERROR_CODES: readonly MoveErrorCode[] = [
  "blocked",
  "cannot-shuffle",
  "invalid-index",
  "no-match",
  "nothing-to-shuffle",
  "nothing-to-undo",
  "same-tile",
];

const ALL_TILES = [
  ...SUITS.flatMap((suit) => RANKS.map((rank) => suitTile(suit, rank))),
  ...WINDS.map(windTile),
  ...DRAGONS.map(dragonTile),
  ...FLOWERS.map(flowerTile),
  ...SEASONS.map(seasonTile),
];

describe.each(interfaceLocales)("Mahjong $id catalog", ({ id }) => {
  const messages = messagesFor(id).mahjong;

  it("provides every typed nested English key", () => {
    expect(catalogKeys(messages)).toStrictEqual(
      catalogKeys(messagesFor("en").mahjong)
    );
  });

  it("names every tile and builds all template messages without missing values", () => {
    for (const tile of ALL_TILES) {
      expect(tileName(tile, messages)).not.toMatch(/undefined|null/u);
      expect(tileName(tile, messages).length).toBeGreaterThan(0);
    }

    const outputs = [
      messages.cleared(3),
      messages.dealt("A"),
      messages.dragonTile("A"),
      messages.flowerTile("A"),
      messages.hintPair("A"),
      messages.layoutLabel("A"),
      messages.layoutSetting("A", "B"),
      messages.matched("A", 3),
      messages.mismatch("A", "B"),
      messages.moves(3),
      messages.onDateAt("A", "B"),
      messages.pair("A", "B"),
      messages.picked("A"),
      messages.resumed("A"),
      messages.seasonTile("A"),
      messages.suitTile(3, "A"),
      messages.tilePosition("A", 1, 2, 3),
      messages.tiles(3),
      messages.tilesLeft(3, 4),
      messages.todayAt("A"),
      messages.windTile("A"),
    ];

    for (const output of outputs) {
      expect(output).not.toMatch(/undefined|null/u);
      expect(output.length).toBeGreaterThan(0);
    }
  });

  it("uses localized typed errors and blockers, never engine error prose", () => {
    const state = newGame({ layout: "easy", seed: 42 });

    for (const code of ERROR_CODES) {
      expect(
        moveError({ code, message: "RAW ENGINE ERROR" }, state, messages)
      ).toBe(messages.errors[code]);
    }

    expect(
      moveError(
        { code: "blocked", message: "RAW ENGINE ERROR" },
        { ...state, tiles: state.tiles.map(() => null) },
        messages,
        0
      )
    ).toBe(messages.blocked.removed);
    expect(
      openingMessage({
        discarded: "RAW SAVE PARSE ERROR",
        resumedFrom: null,
        state,
      })(messages, id)
    ).toBe(messages.discarded);
    expect(tileLabel(state, -1, messages)).toBe(messages.blocked.removed);
  });

  it("formats save dates with the selected Intl locale", () => {
    const savedAt = "2020-01-02T12:34:00.000Z";
    const date = new Date(savedAt);
    const intl = intlLocaleOf(id);

    const day = new Intl.DateTimeFormat(intl, {
      day: "numeric",
      month: "short",
    }).format(date);

    const time = new Intl.DateTimeFormat(intl, { timeStyle: "short" }).format(
      date
    );

    expect(savedWhen(savedAt, id, messages)).toBe(messages.onDateAt(day, time));
    expect(savedWhen("bad date", id, messages)).toBe(messages.earlier);
  });
});
