import { ConvexError } from "convex/values";
import { z } from "zod";

const convexErrorData = z.object({
  code: z.string().optional(),
  message: z.string(),
});

/** A plain-language message for any error, preferring the server's own wording. */
const messageOf = (
  error: Error | null | undefined,
  fallback = "Something went wrong. Please try again."
): string => {
  if (error instanceof ConvexError) {
    const parsed = convexErrorData.safeParse(error.data);

    return parsed.success ? parsed.data.message : fallback;
  }

  if (
    error instanceof Error &&
    error.message &&
    !error.message.includes("[CONVEX")
  ) {
    return error.message;
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
  cause instanceof Error ? cause : new Error(cause ?? "Something went wrong.");

export { asError, codeOf, messageOf };
