import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import {
  groupByAisle,
  isGroceryAisle,
} from "@lifelink/contracts/grocery-aisles";
import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { messagesFor } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";

type GroceryItem = Doc<"groceryLists">["items"][number];

/** Long enough to notice a stray tap and reach Undo without hurrying. */
const UNDO_WINDOW_MS = 10_000;

const quantityWords = (item: GroceryItem, locale: InterfaceLocale): string => {
  if (item.quantity === null) {
    return "";
  }

  const unit =
    item.unit === null
      ? null
      : (messagesFor(locale).groceries.units[item.unit]?.short ?? item.unit);

  return unit ? `${item.quantity} ${unit}` : `× ${item.quantity}`;
};

/** Ticked items sink to the bottom; stored order is kept, so unticking puts them back. */
const shoppingOrder = (items: GroceryItem[]): GroceryItem[] => [
  ...items.filter((item) => !item.checked),
  ...items.filter((item) => item.checked),
];

const isSorted = (items: GroceryItem[]): boolean =>
  items.some((item) => item.aisle !== undefined);

const aisleHeading = (
  aisle: string | undefined,
  messages: Messages["groceries"]
): string =>
  isGroceryAisle(aisle) ? messages.aisles[aisle] : messages.notSorted;

/** Items still to get, under store section headings once the list is sorted. */
const openSections = (
  list: Doc<"groceryLists">,
  messages: Messages["groceries"]
): { heading: string | null; items: GroceryItem[] }[] => {
  const open = list.items.filter((item) => !item.checked);

  if (!isSorted(open)) {
    return [{ heading: null, items: open }];
  }

  return groupByAisle(open).map((group) => ({
    heading: aisleHeading(group.aisle, messages),
    items: group.items,
  }));
};

const textLine = (item: GroceryItem, locale: InterfaceLocale): string =>
  `- ${item.name}${item.quantity === null ? "" : ` (${quantityWords(item, locale).replace("× ", "")})`}`;

/** The list as plain lines, for copying into a text or an email. */
const listAsText = (
  list: Doc<"groceryLists">,
  locale: InterfaceLocale
): string => {
  const messages = messagesFor(locale).groceries;

  const body = openSections(list, messages)
    .map((section) =>
      [
        ...(section.heading === null ? [] : [`${section.heading}:`]),
        ...section.items.map((item) => textLine(item, locale)),
      ].join("\n")
    )
    .join("\n\n");

  const notes =
    list.preferences.length > 0
      ? `\n\n${messages.notes(list.preferences.join("; "))}`
      : "";

  return `${list.name}\n${body}${notes}`;
};

/** Case-insensitive match on the item name, for finding something on a long list. */
const itemMatches = (item: GroceryItem, query: string): boolean =>
  item.name.toLowerCase().includes(query.trim().toLowerCase());

export type { GroceryItem };

export {
  UNDO_WINDOW_MS,
  aisleHeading,
  isSorted,
  itemMatches,
  listAsText,
  openSections,
  quantityWords,
  shoppingOrder,
};
