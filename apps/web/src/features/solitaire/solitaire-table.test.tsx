// @vitest-environment happy-dom

import { newGame } from "@lifelink/solitaire/game";
import { serializeGame } from "@lifelink/solitaire/serialize";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { SolitaireTable } from "./solitaire-table";
import { STORAGE_KEY } from "./storage";

const SAVED_AT = new Date("2026-10-24T12:00:00.000Z");
const EN = messagesFor("en").solitaire;
const ES = messagesFor("es").solitaire;

describe("Solitaire language changes", () => {
  let container: HTMLDivElement;
  let root: Root;

  const buttonNamed = (name: string): HTMLButtonElement => {
    const button = [...container.querySelectorAll("button")].find(
      (element) =>
        element.getAttribute("aria-label") === name ||
        element.textContent === name
    );

    if (!button) {
      throw new Error(`No button named ${name}`);
    }

    return button;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    localStorage.clear();
    setLocale("en");
    localStorage.setItem(
      STORAGE_KEY,
      serializeGame(newGame({ drawCount: 1, seed: 42 }), SAVED_AT)
    );
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
    setLocale("en");
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each(["today", "an earlier day"] as const)(
    "translates the single opening notice for a game saved %s without remounting",
    (when) => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(
        when === "today" ? SAVED_AT : new Date("2026-11-01T12:00:00.000Z")
      );
      act(() => root.render(<SolitaireTable />));

      const announcement = container.querySelector("output span");
      const stock = buttonNamed("Stock, 24 cards. Press to draw.");
      const saved = localStorage.getItem(STORAGE_KEY);

      const englishTime = SAVED_AT.toLocaleTimeString("en-US", {
        timeStyle: "short",
      });

      const spanishTime = SAVED_AT.toLocaleTimeString("es-US", {
        timeStyle: "short",
      });

      const englishDay =
        when === "today"
          ? "today"
          : `on ${SAVED_AT.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;

      const spanishDay =
        when === "today"
          ? "hoy"
          : `el ${SAVED_AT.toLocaleDateString("es-US", { day: "numeric", month: "short" })}`;

      const englishNotice = `Resumed your game, saved ${englishDay} at ${englishTime}.`;
      const spanishNotice = `Se reanudó su partida, guardada ${spanishDay} a las ${spanishTime}.`;

      expect({
        message: announcement?.textContent,
        noticeCount:
          (container.textContent?.split(englishNotice).length ?? 1) - 1,
        offersFresh: container.textContent?.includes(EN.startFresh),
      }).toStrictEqual({
        message: englishNotice,
        noticeCount: 1,
        offersFresh: false,
      });
      act(() => stock.focus());

      act(() => setLocale("es"));

      expect({
        announcement: container.querySelector("output span") === announcement,
        focused: document.activeElement === stock,
        message: announcement?.textContent,
        noticeCount:
          (container.textContent?.split(spanishNotice).length ?? 1) - 1,
        saved: localStorage.getItem(STORAGE_KEY),
        stock: buttonNamed(ES.stock(ES.cards(24))) === stock,
      }).toStrictEqual({
        announcement: true,
        focused: true,
        message: spanishNotice,
        noticeCount: 1,
        saved,
        stock: true,
      });

      act(() => setLocale("en"));

      expect({
        announcement: container.querySelector("output span") === announcement,
        focused: document.activeElement === stock,
        message: announcement?.textContent,
        saved: localStorage.getItem(STORAGE_KEY),
      }).toStrictEqual({
        announcement: true,
        focused: true,
        message: englishNotice,
        saved,
      });
    }
  );

  it("updates board labels and narration without losing progress or undo, or repeating the resume notice", () => {
    act(() => root.render(<SolitaireTable />));
    act(() => buttonNamed(EN.draw).click());
    const saved = localStorage.getItem(STORAGE_KEY);
    const stock = buttonNamed("Stock, 23 cards. Press to draw.");
    const waste = buttonNamed("Waste pile, 6 of hearts on top.");

    const foundation = buttonNamed(
      "Clubs foundation, empty. It starts with the ace of clubs."
    );

    const card = buttonNamed("3 of spades, column 1.");
    const announcement = container.querySelector("output span");

    act(() => stock.focus());
    expect(container.querySelector("output")?.textContent).toBe(
      "Drew the 6 of hearts."
    );

    act(() => setLocale("es"));

    expect({
      announcement: container.querySelector("output span") === announcement,
      card: buttonNamed("3 de picas, columna 1.") === card,
      focused: document.activeElement === stock,
      foundation:
        buttonNamed(
          "Base de tréboles, vacía. Empieza con el as de tréboles."
        ) === foundation,
      hasMove: container.textContent?.includes("1 movimiento"),
      message: announcement?.textContent,
      stock: buttonNamed(ES.stock(ES.cards(23))) === stock,
      waste: buttonNamed("Descarte, 6 de corazones encima.") === waste,
    }).toStrictEqual({
      announcement: true,
      card: true,
      focused: true,
      foundation: true,
      hasMove: true,
      message: "Se robó el 6 de corazones.",
      stock: true,
      waste: true,
    });
    expect(container.textContent).not.toContain("Se reanudó");
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);

    act(() => {
      stock.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "u" })
      );
    });

    expect({
      hasNoMoves: container.textContent?.includes("0 movimientos"),
      message: container.querySelector("output")?.textContent,
      undoDisabled: buttonNamed(ES.undo).disabled,
    }).toStrictEqual({
      hasNoMoves: true,
      message: "Se deshizo el último movimiento.",
      undoDisabled: true,
    });
  });

  it("retains the selected card, focus and draw preference in both directions", () => {
    act(() => root.render(<SolitaireTable />));
    act(() => buttonNamed(EN.draw).click());

    const threeCards =
      container.querySelector<HTMLInputElement>('input[value="3"]');

    act(() => threeCards?.click());
    const card = buttonNamed("3 of spades, column 1.");
    act(() => {
      card.focus();
      card.click();
    });

    expect(card.getAttribute("aria-label")).toBe(
      "3 of spades, column 1. Selected."
    );
    const saved = localStorage.getItem(STORAGE_KEY);

    act(() => setLocale("es"));

    expect({
      focused: document.activeElement === card,
      label: card.getAttribute("aria-label"),
      message: container.querySelector("output")?.textContent,
      preferredDraw: threeCards?.checked,
      saved: localStorage.getItem(STORAGE_KEY),
      tabIndex: card.tabIndex,
    }).toStrictEqual({
      focused: true,
      label: "3 de picas, columna 1. Seleccionada.",
      message: ES.selectedBlocked("3 de picas"),
      preferredDraw: true,
      saved,
      tabIndex: 0,
    });
    expect(container.textContent).toContain("Robando una carta a la vez");

    act(() => setLocale("en"));

    expect({
      focused: document.activeElement === card,
      label: card.getAttribute("aria-label"),
      message: container.querySelector("output")?.textContent,
      preferredDraw: threeCards?.checked,
      saved: localStorage.getItem(STORAGE_KEY),
    }).toStrictEqual({
      focused: true,
      label: "3 of spades, column 1. Selected.",
      message: EN.selectedBlocked("3 of spades"),
      preferredDraw: true,
      saved,
    });
  });

  it("retains the hinted move and translates its marks and announcement", () => {
    act(() => root.render(<SolitaireTable />));
    act(() => buttonNamed(EN.hint).click());

    const marked = [...container.querySelectorAll("button")].filter((button) =>
      button.getAttribute("aria-label")?.includes(EN.suggested)
    );

    const saved = localStorage.getItem(STORAGE_KEY);

    expect(marked.length).toBeGreaterThan(0);
    expect(container.querySelector("output")?.textContent).toContain("Hint:");

    act(() => setLocale("es"));

    expect(
      marked.every(
        (button) =>
          button.isConnected &&
          button.getAttribute("aria-label")?.includes(ES.suggested)
      )
    ).toBeTruthy();

    expect(container.querySelector("output")?.textContent).toContain("Pista:");
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  });

  it("starts a new game with the preferred draw count and keeps its announcement when the language changes", () => {
    act(() => root.render(<SolitaireTable />));
    act(() => buttonNamed(EN.draw).click());

    const threeCards =
      container.querySelector<HTMLInputElement>('input[value="3"]');

    act(() => threeCards?.click());
    act(() => buttonNamed(EN.newGame).click());

    const announcement = container.querySelector("output span");
    const saved = localStorage.getItem(STORAGE_KEY);

    expect({
      message: announcement?.textContent,
      resumed: container.textContent?.includes("Resumed your game"),
      undoDisabled: buttonNamed(EN.undo).disabled,
    }).toStrictEqual({
      message: "Dealt a new game, drawing three cards at a time.",
      resumed: false,
      undoDisabled: true,
    });

    act(() => setLocale("es"));

    expect({
      announcement: container.querySelector("output span") === announcement,
      drawingThree: container.textContent?.includes(
        "Robando tres cartas a la vez"
      ),
      hasNoMoves: container.textContent?.includes("0 movimientos"),
      message: announcement?.textContent,
      preferredDraw: threeCards?.checked,
      resumed: container.textContent?.includes("Se reanudó"),
      saved: localStorage.getItem(STORAGE_KEY),
      undoDisabled: buttonNamed(ES.undo).disabled,
    }).toStrictEqual({
      announcement: true,
      drawingThree: true,
      hasNoMoves: true,
      message: "Se repartió una nueva partida, robando tres cartas a la vez.",
      preferredDraw: true,
      resumed: false,
      saved,
      undoDisabled: true,
    });

    act(() => buttonNamed(ES.draw).click());

    expect(buttonNamed(ES.stock(ES.cards(21)))).toBeDefined();
    expect(container.textContent).toContain("1 movimiento");
  });
});
