/** Small Web Crypto helpers shared by webhook and bridge verification. */

const base64Of = (bytes: ArrayBuffer): string => {
  let binary = "";

  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCodePoint(byte);
  }

  return btoa(binary);
};

/** Compare two strings in time that depends only on their length. */
const constantTimeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference += Number(left.codePointAt(index) !== right.codePointAt(index));
  }

  return difference === 0;
};

const hmacSha256Base64 = async (
  keyBytes: Uint8Array<ArrayBuffer>,
  message: string
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return base64Of(signature);
};

export { base64Of, constantTimeEqual, hmacSha256Base64 };
