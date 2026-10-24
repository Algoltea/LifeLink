const DOLLARS = /^\$?\s*(?<whole>\d{1,6})(?:\.(?<fraction>\d{1,2}))?$/u;

/** "$4.50", "4.5" or "4" become cents; anything else, including an empty box, is null. */
const centsFromDollars = (value: string): number | null => {
  const match = DOLLARS.exec(value.trim());

  if (match?.groups === undefined) {
    return null;
  }

  const whole = Number(match.groups.whole);
  const fraction = Number((match.groups.fraction ?? "0").padEnd(2, "0"));

  return whole * 100 + fraction;
};

/** Cents back to a plain number for an input box, such as 450 to "4.50". */
const dollarsFromCents = (cents: number | null): string =>
  cents === null ? "" : (cents / 100).toFixed(2);

export { centsFromDollars, dollarsFromCents };
