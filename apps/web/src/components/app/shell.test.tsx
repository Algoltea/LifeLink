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

describe("sidebar language", () => {
  it.each(["/mahjong", "/solitaire", "/family", "/settings", "/messages"])(
    "switches language from %s without replacing the page",
    async (pathname) => {
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
        const picker = container.querySelector('aside [role="combobox"]');

        if (!(picker instanceof HTMLButtonElement)) {
          throw new Error("Expected sidebar language picker");
        }

        await act(() => picker.click());
        const options = [...document.querySelectorAll('[role="option"]')];
        expect(options).toHaveLength(10);

        const spanish = options.find(
          (option) => option.textContent === "Español"
        );

        if (!(spanish instanceof HTMLElement)) {
          throw new Error("Expected Spanish language option");
        }

        await act(() => spanish.click());
        expect({
          gamePreserved: container.querySelector("[data-game]") === game,
          label: picker.textContent,
          saved: localStorage.getItem(LOCALE_STORAGE_KEY),
        }).toStrictEqual({
          gamePreserved: true,
          label: `${messagesFor("es").settings.language}Español`,
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

  it("puts guest language before authentication links in both layouts", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <PathnameContext value="/mahjong">
        <ShellFrame account={null} groups={[]} guest>
          Mahjong
        </ShellFrame>
      </PathnameContext>
    );
    const pickers = [...container.querySelectorAll('[role="combobox"]')];

    const signUpLinks = [
      ...container.querySelectorAll('a[href="/sign-in?mode=sign-up"]'),
    ];

    expect(pickers).toHaveLength(2);
    expect(signUpLinks).toHaveLength(2);

    for (const [index, picker] of pickers.entries()) {
      const signUp = signUpLinks[index];

      if (!signUp) {
        throw new Error("Expected sign-up link");
      }

      expect(picker.compareDocumentPosition(signUp)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(picker.textContent).toBe("LanguageEnglish");
    }
  });

  it.each(["/", "/family", "/settings", "/solitaire"])(
    "puts language immediately above signed-in account controls on %s",
    (pathname) => {
      const container = document.createElement("div");
      container.innerHTML = renderToStaticMarkup(
        <PathnameContext value={pathname}>
          <ShellFrame
            account={<button type="button">Account</button>}
            groups={[]}
          >
            Page
          </ShellFrame>
        </PathnameContext>
      );
      const footer = container.querySelector("aside > :last-child");
      const controls = [...(footer?.querySelectorAll("button") ?? [])];
      expect(controls.map((control) => control.textContent)).toStrictEqual([
        "LanguageEnglish",
        "Account",
      ]);
    }
  );

  it("keeps language above the account inside the mobile menu", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    try {
      act(() =>
        root.render(
          <PathnameContext value="/messages">
            <ShellFrame
              account={<button type="button">Account</button>}
              groups={[]}
            >
              Messages
            </ShellFrame>
          </PathnameContext>
        )
      );

      const menu = container.querySelector(
        `button[aria-label="${messagesFor("en").shell.openMenu}"]`
      );

      if (!(menu instanceof HTMLButtonElement)) {
        throw new Error("Expected mobile menu trigger");
      }

      await act(() => menu.click());
      const dialog = document.querySelector('[role="dialog"]');
      const language = dialog?.querySelector('[role="combobox"]');

      const account = [...(dialog?.querySelectorAll("button") ?? [])].find(
        (button) => button.textContent === "Account"
      );

      expect(language?.textContent).toBe("LanguageEnglish");
      expect(account).toBeDefined();

      if (!language || !account) {
        throw new Error("Expected language and account controls");
      }

      expect(language.compareDocumentPosition(account)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    } finally {
      act(() => root.unmount());
      container.remove();
      vi.unstubAllGlobals();
    }
  });
});
