/**
 * Turns a grocery list copied from a note, text, or email into items.
 * Understands bullets, numbering, checkboxes, section headings, and
 * quantities written before ("2 lb chicken") or after ("eggs x12", "milk (1 gallon)").
 */
import { groceryQuantityError, groceryUnits } from "./groceries";

interface PastedGroceryItem {
  name: string;
  quantity: number;
  /** A stored unit value from `groceryUnits`; null means "each". */
  unit: string | null;
}

/** Spellings people type that aren't a unit's label or stored value. */
const extraUnitWords = {
  bags: "bag",
  ct: "",
  ea: "",
  each: "",
  "fl. oz": "fl oz",
  "fl.oz": "fl oz",
  floz: "fl oz",
  "fluid ounce": "fl oz",
  "fluid ounces": "fl oz",
  gal: "gallon",
  gallons: "gallon",
  gram: "g",
  grams: "g",
  kgs: "kg",
  kilo: "kg",
  kilogram: "kg",
  kilograms: "kg",
  kilos: "kg",
  lbs: "lb",
  liter: "L",
  liters: "L",
  litre: "L",
  litres: "L",
  loaves: "loaf",
  milliliter: "mL",
  milliliters: "mL",
  millilitre: "mL",
  millilitres: "mL",
  ounce: "oz",
  ounces: "oz",
  package: "pack",
  packages: "pack",
  pc: "piece",
  pcs: "piece",
  pints: "pint",
  pkg: "pack",
  pkgs: "pack",
  pound: "lb",
  pounds: "lb",
  pt: "pint",
  qt: "quart",
  quarts: "quart",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tin: "can",
  tins: "can",
} satisfies Record<string, string>;

const singular = (word: string): string => {
  if (/(?:ch|sh|x|s)es$/u.test(word)) {
    return word.slice(0, -2);
  }

  return word.endsWith("s") ? word.slice(0, -1) : word;
};

/** Every spelling, lowercased, mapped to the unit value that gets stored. */
const unitWords = new Map<string, string>(Object.entries(extraUnitWords));

for (const choice of groceryUnits) {
  if (choice.value === "") {
    continue;
  }

  const label = choice.label.toLowerCase().replace(/\s*\(.*\)$/u, "");

  const abbreviation = /\((?<short>.+)\)/u
    .exec(choice.label)
    ?.groups?.short?.toLowerCase();

  for (const word of [
    choice.value.toLowerCase(),
    label,
    singular(label),
    abbreviation,
  ]) {
    if (word !== undefined && !unitWords.has(word)) {
      unitWords.set(word, choice.value);
    }
  }
}

/** Longest first, so "fl oz" wins over "oz". */
const unitPattern = [...unitWords.keys()]
  .toSorted((a, b) => b.length - a.length)
  .map((word) => word.replaceAll(".", String.raw`\.`))
  .join("|");

const NUMBER = String.raw`\d+(?:[.,]\d+)?|\d+\/\d+|[½¼¾⅓⅔]`;

// "- ", "* ", "• ", "1. ", "2) ", "[ ] ", "[x] ", "☐ " in any combination.
const LIST_MARKER =
  /^(?:\s*(?:[-*•·◦▪‣–—+>]|\d+[.)](?=\s)|\[[ xX✓✔]?\]|[☐☑☒✓✔□■])\s*)+/u;

const LEADING = new RegExp(
  String.raw`^(${NUMBER})\s*(?:x|×)?\s*(?:(${unitPattern})\.?(?![a-z]))?\s*(?:of\s+)?(.+)$`,
  "iu"
);

const TRAILING_PARENS = new RegExp(
  String.raw`^(.+?)\s*\(\s*(?:x|×)?\s*(${NUMBER})\s*(${unitPattern})?\.?\s*\)$`,
  "iu"
);

const TRAILING_TIMES = new RegExp(
  // The "x" needs a space before it so "Kleenex 2" stays one name.
  String.raw`^(.+?)(?:\s*[-–:,]?\s+[x×]|\s*×)\s*(${NUMBER})$`,
  "iu"
);

const TRAILING_AMOUNT = new RegExp(
  String.raw`^(.+?)\s*[-–:,]\s*(${NUMBER})\s*(${unitPattern})?\.?$`,
  "iu"
);

const vulgarFractions = new Map<string, number>([
  ["¼", 0.25],
  ["½", 0.5],
  ["¾", 0.75],
  ["⅓", 1 / 3],
  ["⅔", 2 / 3],
]);

const toNumber = (text: string): number => {
  const fraction = vulgarFractions.get(text);

  if (fraction !== undefined) {
    return fraction;
  }

  const [top, bottom] = text.split("/");

  if (bottom !== undefined) {
    return Number(top) / Number(bottom);
  }

  return Number(text.replace(",", "."));
};

const toUnit = (word: string | undefined): string | null => {
  if (word === undefined) {
    return null;
  }

  return unitWords.get(word.toLowerCase()) || null;
};

const tidyName = (name: string): string =>
  name
    .replaceAll(/\s+/gu, " ")
    .replaceAll(/^[\s,;:–-]+|[\s,;:–-]+$/gu, "")
    .trim();

/** One cleaned-up line; falls back to the whole line as a name when the amount doesn't fit. */
const parseLine = (line: string): PastedGroceryItem | null => {
  const text = tidyName(line.replace(LIST_MARKER, ""));

  if (text.length === 0) {
    return null;
  }

  const plain: PastedGroceryItem = { name: text, quantity: 1, unit: null };

  const match =
    TRAILING_PARENS.exec(text) ??
    TRAILING_TIMES.exec(text) ??
    TRAILING_AMOUNT.exec(text);

  const leading = match ? null : LEADING.exec(text);

  const [name, amount, unitWord] = match
    ? [match[1], match[2], match[3]]
    : [leading?.[3], leading?.[1], leading?.[2]];

  if (name === undefined || amount === undefined) {
    return plain;
  }

  const item: PastedGroceryItem = {
    name: tidyName(name),
    quantity: toNumber(amount),
    unit: toUnit(unitWord),
  };

  const fits =
    item.name.length > 0 &&
    groceryQuantityError(item.quantity, item.unit) === null;

  return fits ? item : plain;
};

/** "Produce:" or "## Dairy" are section headings, not things to buy. */
const isHeading = (line: string): boolean =>
  /^\s*#+\s/u.test(line) || /:\s*$/u.test(line);

/**
 * Splits pasted text into items. A single line is split on commas and
 * semicolons ("milk, eggs, bread"); otherwise each line is one item.
 */
const parseGroceryList = (text: string): PastedGroceryItem[] => {
  const lines = text
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0 && !isHeading(line));

  const pieces =
    lines.length === 1 ? (lines[0] ?? "").split(/[,;](?!\d)/u) : lines;

  return pieces.flatMap((piece) => {
    const item = parseLine(piece);

    return item === null ? [] : [item];
  });
};

export type { PastedGroceryItem };

export { parseGroceryList };
