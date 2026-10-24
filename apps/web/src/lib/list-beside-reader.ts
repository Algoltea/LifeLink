/**
 * Email and Documents keep their list beside the reader on wide screens and
 * swap the list for the reader on narrow ones. Once an item opens, its row is
 * still drawn only in the first case, so focus can stay on it.
 */
const isRowStillShown = (row: Element | null | undefined): boolean =>
  (row?.getClientRects().length ?? 0) > 0;

export { isRowStillShown };
