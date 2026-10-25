import { ConvexError } from "convex/values";
import { z } from "zod";

import { currentMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

const convexErrorData = z.object({
  code: z.string().optional(),
  message: z.string(),
});

/** A plain-language message for any error, preferring the server's own wording. */
const messageOf = (
  error: Error | null | undefined,
  fallback = currentMessages().common.genericError
): string => {
  if (error instanceof ConvexError) {
    const parsed = convexErrorData.safeParse(error.data);

    return parsed.success
      ? translateServerMessage(parsed.data.message)
      : fallback;
  }

  if (
    error instanceof Error &&
    error.message &&
    !error.message.includes("[CONVEX")
  ) {
    return translateServerMessage(error.message);
  }

  return fallback;
};

const codeOf = (error: Error | null | undefined): string | null => {
  if (error instanceof ConvexError) {
    const parsed = convexErrorData.safeParse(error.data);

    return parsed.success ? (parsed.data.code ?? null) : null;
  }

  return null;
};

/** Normalise whatever a promise rejected with into an Error. */
const asError = (cause: Error | string | null | undefined): Error =>
  cause instanceof Error
    ? cause
    : new Error(cause ?? currentMessages().common.genericErrorShort);

export { asError, codeOf, messageOf };
