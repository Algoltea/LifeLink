"use node";

/**
 * Server-side normalisation for contact pictures. The browser already shrinks
 * and strips each picture, but a modified client could skip that, so the
 * server re-encodes every upload itself. Only the output is ever stored.
 * Import from Node actions only: sharp is a native module.
 */
import { AVATAR_SIZE } from "@lifelink/contracts/avatar";
import sharp from "sharp";

/** Formats a browser can produce; sharp reports AVIF as HEIF. */
const ACCEPTED_FORMATS: ReadonlySet<string> = new Set([
  "heif",
  "jpeg",
  "png",
  "webp",
]);

/** A small file can still decode to an enormous canvas; refuse before decoding it. */
const MAX_INPUT_PIXELS = 4096 * 4096;

const WEBP_QUALITY = 80;

const AVATAR_CONTENT_TYPE = "image/webp";

/**
 * Re-encode any accepted picture as a 256px square WebP. Sharp drops EXIF,
 * XMP, IPTC, and ICC data unless asked to keep it, so nothing about the
 * camera, place, or time survives. Returns null for anything that isn't a
 * single still image in an accepted format.
 */
const normalizeAvatar = async (
  bytes: ArrayBuffer
): Promise<Uint8Array<ArrayBuffer> | null> => {
  try {
    const image = sharp(bytes, {
      animated: false,
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    });

    const { format } = await image.metadata();

    if (!ACCEPTED_FORMATS.has(format)) {
      return null;
    }

    const output = await image
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    return new Uint8Array(output);
  } catch {
    return null;
  }
};

export { AVATAR_CONTENT_TYPE, normalizeAvatar };
