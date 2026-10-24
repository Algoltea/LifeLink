import {
  AVATAR_SIZE,
  MAX_AVATAR_BYTES,
  avatarEncodings,
} from "@lifelink/contracts/avatar";

/** Bigger than any phone camera; past this, decoding alone could stall an older device. */
const MAX_SOURCE_BYTES = 40_000_000;

const HALF = 0.5;

const canvasOf = (size: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;

  return canvas;
};

const contextOf = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("This browser can’t prepare pictures.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  return context;
};

/** Decode with the camera's rotation applied; Safari's HEIC goes through an image element. */
const decode = async (file: Blob): Promise<ImageBitmap | HTMLImageElement> => {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.src = url;

    try {
      await image.decode();

      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

const dimensionsOf = (
  source: ImageBitmap | HTMLImageElement
): { height: number; width: number } =>
  source instanceof HTMLImageElement
    ? { height: source.naturalHeight, width: source.naturalWidth }
    : { height: source.height, width: source.width };

/**
 * Centre-crop to a square, then halve repeatedly before the last step: one big
 * jump shimmers and loses detail, small steps keep faces soft and clean.
 */
const squareOf = (
  source: ImageBitmap | HTMLImageElement
): HTMLCanvasElement => {
  const { height, width } = dimensionsOf(source);
  const side = Math.min(width, height);

  if (side === 0) {
    throw new Error("That picture appears to be empty.");
  }

  const target = Math.min(AVATAR_SIZE, side);
  let size = side;

  while (size * HALF >= target * 2) {
    size = Math.round(size * HALF);
  }

  let canvas = canvasOf(size);

  contextOf(canvas).drawImage(
    source,
    (width - side) / 2,
    (height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size
  );

  while (size > target) {
    size = Math.max(target, Math.round(size * HALF));

    const next = canvasOf(size);

    contextOf(next).drawImage(canvas, 0, 0, size, size);
    canvas = next;
  }

  return canvas;
};

const toBlob = async (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> =>
  // oxlint-disable-next-line promise/avoid-new -- canvas.toBlob only offers a callback.
  await new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

/** JPEG has no transparency; without a backdrop, clear pixels turn black. */
const flattened = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const flat = canvasOf(canvas.width);
  const context = contextOf(flat);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, flat.width, flat.height);
  context.drawImage(canvas, 0, 0);

  return flat;
};

/**
 * Turn any photo into a small square avatar, ready for upload: downscaled to
 * at most 256px, re-encoded as AVIF, WebP, or JPEG (whichever the browser can
 * write), and redrawn from pixels so no EXIF, GPS, or camera data survives.
 */
const prepareAvatar = async (file: File): Promise<Blob> => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a photo.");
  }

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("That photo is too large. Please choose a smaller one.");
  }

  let source: ImageBitmap | HTMLImageElement;

  try {
    source = await decode(file);
  } catch {
    throw new Error("That photo couldn’t be opened. Please try another.");
  }

  const square = squareOf(source);

  if (source instanceof ImageBitmap) {
    source.close();
  }

  for (const { quality, type } of avatarEncodings) {
    const canvas = type === "image/jpeg" ? flattened(square) : square;
    // oxlint-disable-next-line eslint/no-await-in-loop -- encoders are tried in order of preference; the first that works wins.
    const blob = await toBlob(canvas, type, quality);

    // Browsers quietly fall back to PNG for types they can't write.
    if (blob?.type === type && blob.size <= MAX_AVATAR_BYTES) {
      return blob;
    }
  }

  throw new Error("This browser couldn’t prepare that picture.");
};

export { prepareAvatar };
