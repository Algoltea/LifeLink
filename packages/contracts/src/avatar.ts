/**
 * Contact pictures. The browser shrinks each picture to a small square and
 * redraws it so camera metadata never leaves the device; the server then caps
 * the upload size and re-encodes it again, so a modified client can't skip it.
 */

/** Edge length of the stored square, in pixels: sharp at 2x for the largest avatar. */
const AVATAR_SIZE = 256;

/** Browser encoders tried in order; the first one the browser really supports wins. */
const avatarEncodings = [
  { quality: 0.6, type: "image/avif" },
  { quality: 0.8, type: "image/webp" },
  { quality: 0.82, type: "image/jpeg" },
] as const;

/** A 256px picture is a few tens of kilobytes; anything larger skipped compression. */
const MAX_AVATAR_BYTES = 150_000;

export { AVATAR_SIZE, MAX_AVATAR_BYTES, avatarEncodings };
