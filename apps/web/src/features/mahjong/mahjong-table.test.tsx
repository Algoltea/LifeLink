// @vitest-environment happy-dom

import { interfaceLocales } from "@lifelink/contracts/locale";
import { findHint, newGame } from "@lifelink/mahjong/game";
import type { GameState } from "@lifelink/mahjong/game";
import { layoutFor } from "@lifelink/mahjong/layouts";
import { blockerFor, freeSlots } from "@lifelink/mahjong/rules";
import { serializeGame } from "@lifelink/mahjong/serialize";
import { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { openingMessage, pairName, tileLabel, tileName } from "./localization";
import { MahjongTable } from "./mahjong-table";
import { STORAGE_KEY } from "./storage";

const SAVED_AT = new Date("2026-10-24T12:00:00.000Z");
const INITIAL = newGame({ layout: "easy", seed: 42 });

describe("Mahjong localization", () => {
  let container: HTMLDivElement;
  let root: Root;
  const output = () => container.querySelector("output span");

  const buttonNamed = (name: string): HTMLButtonElement => {
    const button = [...container.querySelectorAll("button")].find(
      (element) =>
        element.textContent === name ||
        element.getAttribute("aria-label") === name
    );

    if (!button) {
      throw new Error(`No button named ${name}`);
    }

    return button;
  };

  const tileAt = (index: number): HTMLButtonElement => {
    const button = container.querySelectorAll<HTMLButtonElement>(
      'section[aria-describedby="mahjong-board-keys"] button'
    )[index];

    if (!button) {
      throw new Error(`No tile at ${index}`);
    }

    return button;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    localStorage.clear();
    setLocale("en");
    localStorage.setItem(STORAGE_KEY, serializeGame(INITIAL, SAVED_AT));
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    localStorage.clear();
    setLocale("en");
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each(interfaceLocales)(
    "updates the opening notice, labels and rules in $id without resetting the game",
    ({ id }) => {
      act(() => root.render(<MahjongTable guest />));
      const notice = output();
      const saved = localStorage.getItem(STORAGE_KEY);
      act(() => setLocale(id));
      const messages = messagesFor(id).mahjong;
      expect(output()).toBe(notice);
      expect(notice?.textContent).toBe(
        openingMessage({
          discarded: null,
          resumedFrom: SAVED_AT.toISOString(),
          state: INITIAL,
        })(messages, id)
      );
      expect(tileAt(0).getAttribute("aria-label")).toBe(
        tileLabel(INITIAL, 0, messages)
      );
      expect({
        guest: container.textContent?.includes(messages.guestSubtitle),
        rules: container.textContent?.includes(messages.rules),
        saveNotice: container.textContent?.includes(messages.saved),
        saved: localStorage.getItem(STORAGE_KEY),
        tiles: container.textContent?.includes(
          messages.tilesLeft(INITIAL.tiles.length, INITIAL.tiles.length)
        ),
        undoDisabled: buttonNamed(messages.undo).disabled,
      }).toStrictEqual({
        guest: true,
        rules: true,
        saveNotice: true,
        saved,
        tiles: true,
        undoDisabled: true,
      });
    }
  );

  it("retranslates the English hydration notice into the stored active locale", () => {
    act(() => root.unmount());
    setLocale("es");
    container.innerHTML = renderToString(<MahjongTable />);
    expect(output()?.textContent).toBe(
      openingMessage({
        discarded: null,
        resumedFrom: SAVED_AT.toISOString(),
        state: INITIAL,
      })(messagesFor("en").mahjong, "en")
    );
    act(() => {
      root = hydrateRoot(container, <MahjongTable />);
    });
    expect(output()?.textContent).toBe(
      openingMessage({
        discarded: null,
        resumedFrom: SAVED_AT.toISOString(),
        state: INITIAL,
      })(messagesFor("es").mahjong, "es")
    );
  });

  it("keeps selected and hinted tiles when the language changes and translates moves", () => {
    act(() => root.render(<MahjongTable />));
    const hint = findHint(INITIAL);

    if (!hint) {
      throw new Error("Expected a hint");
    }

    const first = INITIAL.tiles[hint.first];
    const second = INITIAL.tiles[hint.second];

    if (!(first && second)) {
      throw new Error("Expected both tiles");
    }

    const en = messagesFor("en").mahjong;
    const es = messagesFor("es").mahjong;
    act(() => buttonNamed(en.hint).click());
    act(() => setLocale("es"));

    const hinted = {
      marked: tileAt(hint.first)
        .getAttribute("aria-label")
        ?.includes(es.suggested),
      message: output()?.textContent,
    };

    act(() => tileAt(hint.first).click());

    const pickedSpanish = output()?.textContent;
    act(() => setLocale("en"));
    expect({
      hinted,
      pickedEnglish: output()?.textContent,
      pickedSpanish,
      selected: tileAt(hint.first)
        .getAttribute("aria-label")
        ?.includes(en.selected),
    }).toStrictEqual({
      hinted: {
        marked: true,
        message: es.hintPair(pairName(first, second, es)),
      },
      pickedEnglish: en.picked(tileName(first, en)),
      pickedSpanish: es.picked(tileName(first, es)),
      selected: true,
    });
    act(() => tileAt(hint.second).click());
    expect(output()?.textContent).toBe(
      en.matched(pairName(first, second, en), INITIAL.tiles.length - 2)
    );
    act(() => setLocale("es"));
    expect(output()?.textContent).toBe(
      es.matched(pairName(first, second, es), INITIAL.tiles.length - 2)
    );
    act(() => buttonNamed(es.undo).click());
    expect(output()?.textContent).toBe(es.undone);
    act(() => buttonNamed(es.shuffle).click());
    expect(output()?.textContent).toBe(es.shuffled);
  });

  it("translates blocked picks, keyboard cancellation, invalid saves and save failures", () => {
    localStorage.setItem(STORAGE_KEY, "not a valid save");
    setLocale("fr");
    act(() => root.render(<MahjongTable />));
    const messages = messagesFor("fr").mahjong;
    expect(output()?.textContent).toBe(messages.discarded);
    act(() => root.unmount());
    root = createRoot(container);
    localStorage.setItem(STORAGE_KEY, serializeGame(INITIAL, SAVED_AT));
    act(() => root.render(<MahjongTable />));
    const [free] = freeSlots(layoutFor(INITIAL.layout), INITIAL.tiles);

    const blocked = INITIAL.tiles.findIndex(
      (_, index) =>
        blockerFor(layoutFor(INITIAL.layout), INITIAL.tiles, index) !== null
    );

    if (free === undefined || blocked === -1) {
      throw new Error("Expected free and blocked tiles");
    }

    act(() => tileAt(free).click());
    act(() => tileAt(blocked).click());

    const blocker = blockerFor(
      layoutFor(INITIAL.layout),
      INITIAL.tiles,
      blocked
    );

    if (!blocker) {
      throw new Error("Expected blocker");
    }

    expect(output()?.textContent).toBe(
      `${messages.blocked[blocker]} ${messages.stillSelected}`
    );
    act(() =>
      tileAt(free).dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
      )
    );
    expect(output()?.textContent).toBe(messages.putDown);
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    act(() => buttonNamed(messages.shuffle).click());
    expect(container.textContent).toContain(messages.saveFailed);
  });

  it("localizes the completed board and preserves undo", () => {
    const hint = findHint(INITIAL);

    if (!hint) {
      throw new Error("Expected matching pair");
    }

    const state: GameState = {
      ...INITIAL,
      tiles: INITIAL.tiles.map((tile, index) =>
        index === hint.first || index === hint.second ? tile : null
      ),
    };

    localStorage.setItem(STORAGE_KEY, serializeGame(state, SAVED_AT));
    setLocale("ko");
    act(() => root.render(<MahjongTable />));
    const messages = messagesFor("ko").mahjong;
    act(() => tileAt(0).click());
    act(() => tileAt(1).click());
    expect(container.textContent).toContain(messages.cleared(state.moves + 1));
    expect(output()?.textContent).toContain(messages.wellPlayed);
    expect(container.textContent).toContain(messages.clearBoard);
    act(() => buttonNamed(messages.undo).click());
    expect(
      container.querySelectorAll(
        'section[aria-describedby="mahjong-board-keys"] button'
      )
    ).toHaveLength(2);
  });
});
