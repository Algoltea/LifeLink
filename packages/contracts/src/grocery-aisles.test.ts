import { describe, expect, it } from "vitest";

import {
  aislesFromSort,
  arrangeByAisle,
  groupByAisle,
  guessAisle,
  moveItem,
} from "./grocery-aisles";

const item = (id: string, aisle?: string, checked = false) => ({
  aisle,
  checked,
  id,
});

const ids = (items: { id: string }[] | null) =>
  items?.map((entry) => entry.id) ?? null;

describe("guessing a store section", () => {
  it("matches plurals and ignores case", () => {
    expect(guessAisle("Bananas")).toBe("produce");
    expect(guessAisle("blueberries")).toBe("produce");
    expect(guessAisle("Tomatoes")).toBe("produce");
    expect(guessAisle("chocolate chip cookies")).toBe("snacks");
    expect(guessAisle("EGGS")).toBe("dairy");
  });

  it("prefers longer phrases", () => {
    expect(guessAisle("Peanut butter")).toBe("pantry");
    expect(guessAisle("Butter")).toBe("dairy");
    expect(guessAisle("Black pepper")).toBe("pantry");
  });

  it("otherwise prefers the last word", () => {
    expect(guessAisle("chicken noodle soup")).toBe("pantry");
    expect(guessAisle("Chocolate milk")).toBe("dairy");
    expect(guessAisle("Vanilla ice cream")).toBe("frozen");
  });

  it("treats anything frozen as frozen", () => {
    expect(guessAisle("Frozen peas")).toBe("frozen");
  });

  it("does not match parts of words", () => {
    expect(guessAisle("Brown rice")).toBe("pantry");
    expect(guessAisle("Lightbulbs")).toBe("other");
  });
});

describe("using the assistant's answer", () => {
  it("falls back to the guess for skipped or misnumbered items", () => {
    const names = ["Milk", "Tortillas", "Dog food"];

    expect(
      aislesFromSort(names, {
        items: [
          { aisle: "pantry", number: 2 },
          { aisle: "produce", number: 9 },
        ],
      })
    ).toStrictEqual(["dairy", "pantry", "pets"]);
    expect(aislesFromSort(names, null)).toStrictEqual([
      "dairy",
      "bakery",
      "pets",
    ]);
  });
});

describe("arranging by section", () => {
  it("follows the walk and keeps the person's order within a section", () => {
    const arranged = arrangeByAisle([
      item("ice-cream", "frozen"),
      item("new"),
      item("apples", "produce"),
      item("milk", "dairy"),
      item("pears", "produce"),
    ]);

    expect(ids(arranged)).toStrictEqual([
      "apples",
      "pears",
      "milk",
      "ice-cream",
      "new",
    ]);
  });

  it("groups consecutive items in the same section", () => {
    const groups = groupByAisle([
      item("apples", "produce"),
      item("pears", "produce"),
      item("milk", "dairy"),
      item("new"),
    ]);

    expect(
      groups.map((group) => [group.aisle, ids(group.items)])
    ).toStrictEqual([
      ["produce", ["apples", "pears"]],
      ["dairy", ["milk"]],
      [undefined, ["new"]],
    ]);
  });
});

describe("moving an item", () => {
  it("swaps with the next item still to get, skipping ticked ones", () => {
    const items = [item("a"), item("b", undefined, true), item("c")];

    expect(ids(moveItem(items, "c", "up"))).toStrictEqual(["c", "b", "a"]);
    expect(ids(moveItem(items, "a", "down"))).toStrictEqual(["c", "b", "a"]);
  });

  it("does nothing at either end, for ticked items, or unknown ids", () => {
    const items = [item("a"), item("b"), item("c", undefined, true)];

    expect(moveItem(items, "a", "up")).toBeNull();
    expect(moveItem(items, "b", "down")).toBeNull();
    expect(moveItem(items, "c", "up")).toBeNull();
    expect(moveItem(items, "missing", "up")).toBeNull();
  });

  it("joins the neighbouring section at a section's edge", () => {
    const items = [
      item("apples", "produce"),
      item("milk", "dairy"),
      item("new"),
    ];

    expect(moveItem(items, "milk", "up")).toStrictEqual([
      item("apples", "produce"),
      item("milk", "produce"),
      item("new"),
    ]);
    expect(moveItem(items, "new", "up")).toStrictEqual([
      item("apples", "produce"),
      item("milk", "dairy"),
      item("new", "dairy"),
    ]);
  });
});
