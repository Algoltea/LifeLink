/**
 * Canonical fingerprints for proposed actions.
 *
 * An approval records the fingerprint of the consequential details it covered.
 * Execution recomputes the fingerprint from the stored version and refuses to
 * run when the two differ, so any change to a recipient, wording, time, amount,
 * or item list invalidates the earlier approval.
 */

type CanonicalValue =
  | boolean
  | null
  | number
  | string
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue | undefined };

const canonicalize = (value: CanonicalValue | undefined): string => {
  if (value === undefined || value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }

  if (value === true || value === false) {
    return value ? "true" : "false";
  }

  if (Number(value) === value || Number.isNaN(value)) {
    return Number.isFinite(value) ? JSON.stringify(value) : "null";
  }

  if (String(value) === value) {
    return JSON.stringify(value);
  }

  const entries = Object.entries(value)
    .toSorted(([left], [right]) => left.localeCompare(right))
    .flatMap(([key, item]) =>
      item === undefined ? [] : [`${JSON.stringify(key)}:${canonicalize(item)}`]
    );

  return `{${entries.join(",")}}`;
};

const toHex = (buffer: ArrayBuffer): string =>
  [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const fingerprint = async (value: CanonicalValue): Promise<string> => {
  const bytes = new TextEncoder().encode(canonicalize(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return toHex(digest);
};

export { canonicalize, fingerprint };

export type { CanonicalValue };
