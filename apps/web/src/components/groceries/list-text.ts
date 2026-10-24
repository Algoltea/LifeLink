import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { aisleLabel, groupByAisle } from "@lifelink/contracts/grocery-aisles";

type GroceryItem = Doc<"groceryLists">["items"][number];

/** Long enough to notice a stray tap and reach Undo without hurrying. */
const UNDO_WINDOW_MS = 10_000;

const quantityWords = (item: GroceryItem): string => {
  if (item.quantity === null) {
    return "";
  }

  return item.unit ? `${item.quantity} ${item.unit}` : `× ${item.quantity}`;
};

/** Ticked items sink to the bottom; stored order is kept, so unticking puts them back. */
const shoppingOrder = (items: GroceryItem[]): GroceryItem[] => [
  ...items.filter((item) => !item.checked),
  ...items.filter((item) => item.checked),
];

const isSorted = (items: GroceryItem[]): boolean =>
  items.some((item) => item.aisle !== undefined);

/** Items still to get, under store section headings once the list is sorted. */
const openSections = (
  list: Doc<"groceryLists">
): { heading: string | null; items: GroceryItem[] }[] => {
  const open = list.items.filter((item) => !item.checked);

  if (!isSorted(open)) {
    return [{ heading: null, items: open }];
  }

  return groupByAisle(open).map((group) => ({
    heading: aisleLabel(group.aisle),
    items: group.items,
  }));
};

const textLine = (item: GroceryItem): string =>
  `- ${item.name}${item.quantity === null ? "" : ` (${quantityWords(item).replace("× ", "")})`}`;

/** The list as plain lines, for copying into a text or an email. */
const listAsText = (list: Doc<"groceryLists">): string => {
  const body = openSections(list)
    .map((section) =>
      [
        ...(section.heading === null ? [] : [`${section.heading}:`]),
        ...section.items.map(textLine),
      ].join("\n")
    )
    .join("\n\n");

  const notes =
    list.preferences.length > 0
      ? `\n\nNotes: ${list.preferences.join("; ")}`
      : "";

  return `${list.name}\n${body}${notes}`;
};

/** Case-insensitive match on the item name, for finding something on a long list. */
const itemMatches = (item: GroceryItem, query: string): boolean =>
  item.name.toLowerCase().includes(query.trim().toLowerCase());

export type { GroceryItem };

export {
  UNDO_WINDOW_MS,
  isSorted,
  itemMatches,
  listAsText,
  openSections,
  quantityWords,
  shoppingOrder,
};
