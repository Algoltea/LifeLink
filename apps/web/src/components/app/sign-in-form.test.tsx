// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { SignInForm } from "./sign-in-form";

const EN = messagesFor("en").appExtras.signIn;
const ES = messagesFor("es").appExtras.signIn;

describe("split sign-in form language changes", () => {
  let container: HTMLDivElement;
  let root: Root;

  const required = <Element extends HTMLElement>(selector: string): Element => {
    const element = container.querySelector<Element>(selector);

    if (!element) {
      throw new Error(`Missing sign-in element: ${selector}`);
    }

    return element;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("No network in this test"))
    );
    setLocale("en");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it.each(["sign-in", "sign-up"] as const)(
    "keeps %s credentials out of the URL before hydration",
    (mode) => {
      container.innerHTML = renderToStaticMarkup(
        <SignInForm initialMode={mode} />
      );

      const form = required<HTMLFormElement>("form");
      expect(form.method).toBe("post");
      expect(required<HTMLInputElement>('input[name="password"]').form).toBe(
        form
      );
      expect(
        required<HTMLButtonElement>('button[type="submit"]').hasAttribute(
          "formmethod"
        )
      ).toBeFalsy();
      expect(fetch).not.toHaveBeenCalled();
    }
  );

  it.each([
    {
      credit: "Claude Monet, Woman with a Parasol, 1875.",
      mode: "sign-in",
      source: "monet-woman-with-a-parasol.jpg",
    },
    {
      credit:
        "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte, 1884–\u206086.",
      mode: "sign-up",
      source: "seurat-sunday-on-la-grande-jatte.jpg",
    },
  ] as const)(
    "retains $mode inputs, focus, visibility and artwork when language changes",
    ({ credit, mode, source }) => {
      act(() => root.render(<SignInForm initialMode={mode} />));
      const email = required<HTMLInputElement>('input[name="email"]');
      const password = required<HTMLInputElement>('input[name="password"]');
      const image = required<HTMLImageElement>("figure img");
      const selected = required('[role="radio"][aria-checked="true"]');

      const name =
        container.querySelector<HTMLInputElement>('input[name="name"]');

      email.value = "test@example.com";
      password.value = "unchanged-password";

      if (name) {
        name.value = "Wait for an answer";
      }

      act(() =>
        required<HTMLButtonElement>('[aria-label="Show password"]').click()
      );
      password.focus();
      password.setSelectionRange(2, 6);

      expect({
        alt: image.alt,
        credit: required("figcaption").textContent,
        source: image.src.includes(source),
      }).toStrictEqual({
        alt: EN.paintingAlt[mode],
        credit,
        source: true,
      });

      act(() => setLocale("es"));

      expect({
        alt: image.alt,
        credit: required("figcaption").textContent,
        email: email.value,
        focused: document.activeElement === password,
        heading: required("h1").textContent,
        home: required('nav a[href="/"]').textContent,
        name: name?.value,
        password: password.value,
        sameImage: required("figure img") === image,
        samePassword: required('input[name="password"]') === password,
        sameSelection:
          required('[role="radio"][aria-checked="true"]') === selected,
        selection: [password.selectionStart, password.selectionEnd],
        visible: password.type,
      }).toStrictEqual({
        alt: ES.paintingAlt[mode],
        credit,
        email: "test@example.com",
        focused: true,
        heading: mode === "sign-in" ? ES.welcome : ES.createTitle,
        home: ES.backHome,
        name: mode === "sign-up" ? "Wait for an answer" : undefined,
        password: "unchanged-password",
        sameImage: true,
        samePassword: true,
        sameSelection: true,
        selection: [2, 6],
        visible: "text",
      });

      act(() => setLocale("en"));

      expect({
        alt: image.alt,
        focused: document.activeElement === password,
        heading: required("h1").textContent,
        selection: [password.selectionStart, password.selectionEnd],
      }).toStrictEqual({
        alt: EN.paintingAlt[mode],
        focused: true,
        heading: mode === "sign-in" ? EN.welcome : EN.createTitle,
        selection: [2, 6],
      });
      expect(fetch).not.toHaveBeenCalled();
    }
  );

  it("retranslates a retained validation failure without clearing the form or submitting credentials", () => {
    act(() => root.render(<SignInForm initialMode="sign-up" />));
    const password = required<HTMLInputElement>('input[name="password"]');
    password.value = "short";
    password.focus();

    act(() => {
      required("form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    });
    const alert = required('[role="alert"]');
    expect(alert.textContent).toBe(EN.passwordMinimum(10));

    act(() => setLocale("es"));
    expect({
      describedBy: required("form").getAttribute("aria-describedby"),
      error: alert.textContent,
      focused: document.activeElement === password,
      password: password.value,
      sameAlert: required('[role="alert"]') === alert,
    }).toStrictEqual({
      describedBy: alert.id,
      error: ES.passwordMinimum(10),
      focused: true,
      password: "short",
      sameAlert: true,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
