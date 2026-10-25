// @vitest-environment happy-dom

import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { LOCALE_STORAGE_KEY } from "@/i18n/boot";
import { messagesFor, setLocale } from "@/i18n/locale";

import { ShellFrame } from "./shell";

describe("game brand navigation", () => {
  it.each([true, false])(
    "links both Mahjong logos to the landing page with guest=%s",
    (guest) => {
      const container = document.createElement("div");

      container.innerHTML = renderToStaticMarkup(
        <PathnameContext value="/mahjong">
          <ShellFrame
            account={null}
            groups={[]}
            guest={guest}
            homeHref="/family"
          >
            Mahjong
          </ShellFrame>
        </PathnameContext>
      );

      const brandLinks = [...container.querySelectorAll("a")].filter(
        (link) => link.textContent === "LifeLink"
      );

      expect(brandLinks).toHaveLength(2);
      expect(brandLinks.map((link) => link.getAttribute("href"))).toStrictEqual(
        ["/welcome", "/welcome"]
      );
    }
  );

  it("preserves the signed-in home destination outside Mahjong", () => {
    const container = document.createElement("div");

    container.innerHTML = renderToStaticMarkup(
      <PathnameContext value="/family">
        <ShellFrame account={null} groups={[]} homeHref="/family">
          Family
        </ShellFrame>
      </PathnameContext>
    );

    const brandLinks = [...container.querySelectorAll("a")].filter(
      (link) => link.textContent === "LifeLink"
    );

    expect(brandLinks.map((link) => link.getAttribute("href"))).toStrictEqual([
      "/family",
      "/family",
    ]);
  });
});

describe("game language picker", () => {
  it.each(["/mahjong", "/solitaire"])(
    "switches language from the %s sidebar without replacing the game",
    (pathname) => {
      vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
      setLocale("en");
      const container = document.createElement("div");
      document.body.append(container);
      const root = createRoot(container);

      try {
        act(() =>
          root.render(
            <PathnameContext value={pathname}>
              <ShellFrame account={null} groups={[]}>
                <div data-game="saved-game">Game</div>
              </ShellFrame>
            </PathnameContext>
          )
        );
        const game = container.querySelector("[data-game]");
        const picker = container.querySelector("aside select");

        if (!(picker instanceof HTMLSelectElement)) {
          throw new Error("Expected sidebar language picker");
        }

        expect(picker.options).toHaveLength(10);
        act(() => {
          picker.value = "es";
          picker.dispatchEvent(new Event("change", { bubbles: true }));
        });
        expect({
          gamePreserved: container.querySelector("[data-game]") === game,
          label: picker.closest("label")?.textContent,
          locale: picker.value,
          saved: localStorage.getItem(LOCALE_STORAGE_KEY),
        }).toStrictEqual({
          gamePreserved: true,
          label: expect.stringContaining(messagesFor("es").settings.language),
          locale: "es",
          saved: "es",
        });
      } finally {
        act(() => root.unmount());
        container.remove();
        localStorage.clear();
        setLocale("en");
        vi.unstubAllGlobals();
      }
    }
  );

  it("keeps the compact picker at the bottom of the guest sidebar", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <PathnameContext value="/mahjong">
        <ShellFrame account={null} groups={[]} guest>
          Mahjong
        </ShellFrame>
      </PathnameContext>
    );
    expect(
      container.querySelector("aside > :last-child select")
    ).not.toBeNull();
  });

  it("does not add a language picker outside games", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <PathnameContext value="/family">
        <ShellFrame account={null} groups={[]}>
          Family
        </ShellFrame>
      </PathnameContext>
    );
    expect(container.querySelector("select")).toBeNull();
  });
});
