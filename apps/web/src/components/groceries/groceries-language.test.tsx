// @vitest-environment happy-dom

import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { groceryAisles } from "@lifelink/contracts/grocery-aisles";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";
import { money } from "@/lib/format";

import { GroceryItems } from "./item-list";
import {
  aisleHeading,
  listAsText,
  openSections,
  quantityWords,
} from "./list-text";
import type { GroceryItem } from "./list-text";

const beans: GroceryItem = {
  aisle: "pantry",
  checked: false,
  estimatedCents: 123_456,
  id: "beans",
  name: "Wait for an answer",
  quantity: 2,
  unit: "can",
};

const list: Doc<"groceryLists"> = {
  _creationTime: 0,
  // SAFETY: These synthetic branded IDs never reach a server in these tests.
  _id: "grocery-test" as Id<"groceryLists">,
  budgetCents: null,
  items: [
    beans,
    { ...beans, aisle: "dairy", id: "milk", name: "Milk", unit: "bottle" },
    {
      ...beans,
      aisle: undefined,
      id: "new-item",
      name: "New item",
      quantity: null,
      unit: null,
    },
    { ...beans, checked: true, id: "in-cart", name: "Already in cart" },
  ],
  lastHandoff: null,
  name: "My authored list",
  // SAFETY: A synthetic owner ID satisfies the document shape without database access.
  ownerId: "owner-test" as Id<"profiles">,
  preferences: ["Wait for an answer", "Keep the original brand"],
  updatedAt: 0,
};

describe("grocery text language", () => {
  it("uses the explicit locale for units and leaves unknown units unchanged", () => {
    expect(quantityWords(beans, "en")).toBe("2 can");
    expect(quantityWords(beans, "es")).toBe("2 lata(s)");
    expect(quantityWords({ ...beans, unit: "My own unit" }, "es")).toBe(
      "2 My own unit"
    );
    expect(quantityWords({ ...beans, unit: null }, "es")).toBe("× 2");
    expect(quantityWords({ ...beans, quantity: null }, "es")).toBe("");
  });

  it("localizes section headings and notes without changing authored text or copying checked items", () => {
    const original = structuredClone(list);

    expect(listAsText(list, "en")).toBe(
      "My authored list\nPantry:\n- Wait for an answer (2 can)\n\nDairy and eggs:\n- Milk (2 bottle)\n\nNot sorted yet:\n- New item\n\nNotes: Wait for an answer; Keep the original brand"
    );
    expect(listAsText(list, "es")).toBe(
      "My authored list\nDespensa:\n- Wait for an answer (2 lata(s))\n\nLácteos y huevos:\n- Milk (2 botella(s))\n\nSin ordenar todavía:\n- New item\n\nNotas: Wait for an answer; Keep the original brand"
    );
    expect(
      openSections(list, messagesFor("es").groceries).map((section) =>
        section.items.map((item) => item.id)
      )
    ).toStrictEqual([["beans"], ["milk"], ["new-item"]]);
    expect(list).toStrictEqual(original);
  });

  it("covers all shared aisles and preserves the ungrouped order of unsorted lists", () => {
    for (const aisle of groceryAisles) {
      expect(aisleHeading(aisle.value, messagesFor("en").groceries)).toBe(
        aisle.label
      );
      expect(
        aisleHeading(aisle.value, messagesFor("es").groceries)
      ).toBeTruthy();
    }

    const unsorted = {
      ...list,
      items: list.items.map((item) => ({ ...item, aisle: undefined })),
    };

    expect(openSections(unsorted, messagesFor("es").groceries)).toStrictEqual([
      { heading: null, items: unsorted.items.slice(0, 3) },
    ]);
  });
});

describe("grocery item language changes", () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: ConvexReactClient;

  const required = <Element extends HTMLElement>(selector: string): Element => {
    const element = container.querySelector<Element>(selector);

    if (element === null) {
      throw new Error(`Missing test element: ${selector}`);
    }

    return element;
  };

  const render = async (target = list) => {
    await act(() => {
      root.render(
        <ConvexProvider client={client}>
          <GroceryItems list={target} />
        </ConvexProvider>
      );
    });
  };

  const search = async (query: string) => {
    const input = required<HTMLInputElement>('input[type="search"]');

    await act(() => {
      // Use the native setter so React sees the same input event as a user edit.
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set?.call(input, query);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    return input;
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    client = new ConvexReactClient("http://127.0.0.1:3210");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(() => root.unmount());
    await client.close();
    container.remove();
    setLocale("en");
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("updates headings, units, money and controls in place while retaining row focus", async () => {
    await render();
    const checkbox = required<HTMLElement>('[role="checkbox"]');

    const move = required<HTMLButtonElement>(
      '[data-item="beans"][data-move="down"]'
    );

    checkbox.focus();

    await act(() => setLocale("es"));

    expect({
      focused: document.activeElement === checkbox,
      heading: required("h3").textContent,
      mounted: required('[role="checkbox"]') === checkbox,
      move: move.getAttribute("aria-label"),
      placeholder: required<HTMLInputElement>('input[type="search"]')
        .placeholder,
    }).toStrictEqual({
      focused: true,
      heading: "Despensa",
      mounted: true,
      move: "Mover Wait for an answer hacia abajo, a Lácteos y huevos",
      placeholder: "Busque un artículo, como leche",
    });
    expect({
      authored: container.textContent.includes("Wait for an answer"),
      money: container.textContent.includes(
        `unos ${money(beans.estimatedCents ?? 0, "es")}`
      ),
      sort: container.textContent.includes(
        "Ordenar los artículos nuevos por pasillo"
      ),
      units: container.textContent.includes("2 lata(s)"),
    }).toStrictEqual({ authored: true, money: true, sort: true, units: true });

    await act(() => setLocale("en"));

    expect({
      focused: document.activeElement === checkbox,
      heading: required("h3").textContent,
      mounted: required('[role="checkbox"]') === checkbox,
    }).toStrictEqual({ focused: true, heading: "Pantry", mounted: true });
    expect(container.textContent).toContain("2 can");
  });

  it("keeps search text and focus while translating search results and empty states", async () => {
    await render();
    const input = await search("  MILK  ");
    input.focus();
    expect({
      matches: container.querySelectorAll('[role="checkbox"]').length,
      moves: container.querySelector("[data-move]"),
    }).toStrictEqual({ matches: 1, moves: null });

    await act(() => setLocale("es"));

    expect({
      authored: container.textContent.includes("Milk"),
      focused: document.activeElement === input,
      mounted: required('input[type="search"]') === input,
      results: required('[aria-live="polite"]').textContent,
      value: input.value,
    }).toStrictEqual({
      authored: true,
      focused: true,
      mounted: true,
      results: "1 de 4 artículos coinciden",
      value: "  MILK  ",
    });

    await search("My exact words");
    expect(container.textContent).toContain(
      "Ningún artículo de esta lista coincide con «My exact words»."
    );
    expect(container.textContent).toContain("Borrar búsqueda");

    await act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
      );
    });
    expect({
      matches: container.querySelectorAll('[role="checkbox"]').length,
      value: input.value,
    }).toStrictEqual({ matches: 4, value: "" });
  });

  it("retranslates move announcements and retains the original mutation arguments", async () => {
    // Keep the real hooks and provider; replace only the network boundary.
    const mutation = vi.spyOn(client, "mutation").mockResolvedValue(null);
    await render();

    await act(() => {
      required<HTMLButtonElement>(
        '[data-item="beans"][data-move="down"]'
      ).click();
    });
    expect(required('[aria-live="polite"]').textContent).toBe(
      "Moved Wait for an answer down, into Dairy and eggs."
    );

    await act(() => setLocale("es"));

    expect(required('[aria-live="polite"]').textContent).toBe(
      "Se movió Wait for an answer hacia abajo, a Lácteos y huevos."
    );
    expect(mutation).toHaveBeenCalledOnce();
    expect(mutation.mock.calls[0]?.[1]).toStrictEqual({
      direction: "down",
      itemId: "beans",
      listId: list._id,
    });
  });
});
