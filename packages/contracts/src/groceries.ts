/** Shared choices and validation for grocery quantities. */
// `aliases` only help people find a unit by typing; `value` is what gets stored.
const groceryUnits = [
  {
    aliases: ["item", "piece", "single"],
    fractional: false,
    label: "Each",
    value: "",
  },
  { aliases: [], fractional: false, label: "Bags", value: "bag" },
  {
    aliases: ["candy", "granola"],
    fractional: false,
    label: "Bars",
    value: "bar",
  },
  { aliases: [], fractional: false, label: "Bottles", value: "bottle" },
  { aliases: [], fractional: false, label: "Boxes", value: "box" },
  { aliases: [], fractional: false, label: "Bunches", value: "bunch" },
  { aliases: ["tin"], fractional: false, label: "Cans", value: "can" },
  { aliases: [], fractional: false, label: "Cartons", value: "carton" },
  { aliases: ["crate"], fractional: false, label: "Cases", value: "case" },
  { aliases: ["garlic"], fractional: false, label: "Cloves", value: "clove" },
  {
    aliases: ["tupperware"],
    fractional: false,
    label: "Containers",
    value: "container",
  },
  { aliases: ["corn"], fractional: false, label: "Ears", value: "ear" },
  {
    aliases: ["lettuce", "cabbage"],
    fractional: false,
    label: "Heads",
    value: "head",
  },
  { aliases: [], fractional: false, label: "Jars", value: "jar" },
  { aliases: ["bread"], fractional: false, label: "Loaves", value: "loaf" },
  {
    aliases: ["package", "pkg"],
    fractional: false,
    label: "Packs",
    value: "pack",
  },
  {
    aliases: ["sachet", "envelope"],
    fractional: false,
    label: "Packets",
    value: "packet",
  },
  { aliases: ["pc"], fractional: false, label: "Pieces", value: "piece" },
  { aliases: [], fractional: false, label: "Pouches", value: "pouch" },
  {
    aliases: ["paper towel", "toilet paper"],
    fractional: false,
    label: "Rolls",
    value: "roll",
  },
  { aliases: [], fractional: false, label: "Slices", value: "slice" },
  { aliases: ["butter"], fractional: false, label: "Sticks", value: "stick" },
  { aliases: [], fractional: false, label: "Tubes", value: "tube" },
  { aliases: [], fractional: false, label: "Tubs", value: "tub" },
  { aliases: ["eggs"], fractional: true, label: "Dozen", value: "dozen" },
  {
    aliases: ["pound", "lbs", "weight"],
    fractional: true,
    label: "Pounds (lb)",
    value: "lb",
  },
  {
    aliases: ["ounce", "weight"],
    fractional: true,
    label: "Ounces (oz)",
    value: "oz",
  },
  {
    aliases: ["gram", "weight"],
    fractional: true,
    label: "Grams (g)",
    value: "g",
  },
  {
    aliases: ["kilo", "kilogram", "weight"],
    fractional: true,
    label: "Kilograms (kg)",
    value: "kg",
  },
  {
    aliases: ["teaspoon", "spoon"],
    fractional: true,
    label: "Teaspoons (tsp)",
    value: "tsp",
  },
  {
    aliases: ["tablespoon", "spoon"],
    fractional: true,
    label: "Tablespoons (tbsp)",
    value: "tbsp",
  },
  {
    aliases: ["fluid ounce", "floz", "volume"],
    fractional: true,
    label: "Fluid ounces (fl oz)",
    value: "fl oz",
  },
  { aliases: ["volume"], fractional: true, label: "Cups", value: "cup" },
  {
    aliases: ["pt", "volume"],
    fractional: true,
    label: "Pints",
    value: "pint",
  },
  {
    aliases: ["qt", "volume"],
    fractional: true,
    label: "Quarts",
    value: "quart",
  },
  {
    aliases: ["gal", "milk", "volume"],
    fractional: true,
    label: "Gallons",
    value: "gallon",
  },
  {
    aliases: ["ml", "millilitre", "volume"],
    fractional: true,
    label: "Milliliters (mL)",
    value: "mL",
  },
  {
    aliases: ["liter", "litre", "volume"],
    fractional: true,
    label: "Liters (L)",
    value: "L",
  },
] as const;

type GroceryUnitChoice = (typeof groceryUnits)[number];

/** Case-insensitive match on a unit's label, stored value, or aliases. */
const groceryUnitMatches = (choice: GroceryUnitChoice, query: string) => {
  const needle = query.trim().toLowerCase();

  if (needle.length === 0) {
    return true;
  }

  return [choice.label, choice.value, ...choice.aliases].some((term) =>
    term.toLowerCase().includes(needle)
  );
};

const groceryUnit = (unit: string | null) =>
  groceryUnits.find((choice) => choice.value === (unit ?? ""));

const groceryQuantityError = (
  quantity: number | null,
  unit: string | null
): string | null => {
  if (quantity === null || !Number.isFinite(quantity) || quantity <= 0) {
    return "Enter a quantity greater than 0.";
  }

  if (
    groceryUnit(unit)?.fractional === false &&
    !Number.isSafeInteger(quantity)
  ) {
    return "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.";
  }

  return null;
};

const groceryEstimateError = (cents: number | null): string | null =>
  cents !== null && (!Number.isSafeInteger(cents) || cents < 0)
    ? "Enter a nonnegative amount in whole cents, or leave the estimate blank."
    : null;

export type { GroceryUnitChoice };

export {
  groceryEstimateError,
  groceryQuantityError,
  groceryUnit,
  groceryUnitMatches,
  groceryUnits,
};
