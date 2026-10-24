import { describe, expect, it } from "vitest";

import { groceryUnitMatches, groceryUnits } from "./groceries";

const matching = (query: string) =>
  groceryUnits
    .filter((choice) => groceryUnitMatches(choice, query))
    .map((choice) => choice.value);

describe("grocery unit search", () => {
  it("shows every unit for an empty query", () => {
    expect(matching("  ")).toHaveLength(groceryUnits.length);
  });

  it("matches labels, stored values, and aliases without case", () => {
    expect(matching("TBSP")).toStrictEqual(["tbsp"]);
    expect(matching("tablespoon")).toStrictEqual(["tbsp"]);
    expect(matching("litre")).toStrictEqual(["mL", "L"]);
    expect(matching("butter")).toStrictEqual(["stick"]);
  });

  it("returns nothing for an unknown unit", () => {
    expect(matching("furlong")).toStrictEqual([]);
  });

  it("keeps stored unit values unique", () => {
    const values = groceryUnits.map((choice) => choice.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
