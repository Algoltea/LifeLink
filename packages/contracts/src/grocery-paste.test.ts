import { describe, expect, it } from "vitest";

import { parseGroceryList } from "./grocery-paste";

describe("pasted grocery lists", () => {
  it("drops bullets, numbering, checkboxes, headings, and blank lines", () => {
    const pasted = [
      "Produce:",
      "- Bananas",
      "* Spinach",
      "• Garlic",
      "",
      "## Dairy",
      "1. Butter",
      "2) Yogurt",
      "- [ ] Cheese",
      "[x] Cream",
    ].join("\n");

    expect(parseGroceryList(pasted).map((item) => item.name)).toStrictEqual([
      "Bananas",
      "Spinach",
      "Garlic",
      "Butter",
      "Yogurt",
      "Cheese",
      "Cream",
    ]);
  });

  it("reads quantities and units written before the name", () => {
    expect(
      parseGroceryList(
        "2 lb chicken breast\n3 cans of black beans\n500g flour\n½ lb ham\n2x avocado"
      )
    ).toStrictEqual([
      { name: "chicken breast", quantity: 2, unit: "lb" },
      { name: "black beans", quantity: 3, unit: "can" },
      { name: "flour", quantity: 500, unit: "g" },
      { name: "ham", quantity: 0.5, unit: "lb" },
      { name: "avocado", quantity: 2, unit: null },
    ]);
  });

  it("reads quantities written after the name, including copied LifeLink lists", () => {
    expect(
      parseGroceryList(
        "- Milk (1 gallon)\nEggs x12\nApples - 6\nChicken: 2 lb\n- Rice (2 lb)"
      )
    ).toStrictEqual([
      { name: "Milk", quantity: 1, unit: "gallon" },
      { name: "Eggs", quantity: 12, unit: null },
      { name: "Apples", quantity: 6, unit: null },
      { name: "Chicken", quantity: 2, unit: "lb" },
      { name: "Rice", quantity: 2, unit: "lb" },
    ]);
  });

  it("splits a single line on commas and semicolons", () => {
    expect(
      parseGroceryList("milk, eggs; bread, 2 lb rice").map((item) => item.name)
    ).toStrictEqual(["milk", "eggs", "bread", "rice"]);
  });

  it("keeps the whole line as the name when an amount doesn't fit", () => {
    expect(parseGroceryList("1.5 apples\nKleenex 2\n2 bagels")).toStrictEqual([
      { name: "1.5 apples", quantity: 1, unit: null },
      { name: "Kleenex 2", quantity: 1, unit: null },
      { name: "bagels", quantity: 2, unit: null },
    ]);
  });

  it("returns nothing for empty text", () => {
    expect(parseGroceryList("  \n - \n")).toStrictEqual([]);
  });
});
