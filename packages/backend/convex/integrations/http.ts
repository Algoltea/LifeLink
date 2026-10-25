/**
 * Fetch with a timeout, classifying failures by whether the request could
 * have taken effect:
 * - "rejected": the provider answered 4xx, so nothing happened (safe to retry after fixing).
 * - "uncertain": a timeout, network error, or 5xx after the request was sent;
 *   the provider may have acted, so the outcome must be reconciled first.
 */
import type { z } from "zod";

/** JSON request bodies: typed all the way down, so no broad `object` crosses an adapter. */
type JsonValue = boolean | null | number | string | JsonValue[] | JsonObject;

interface JsonObject {
  [key: string]: JsonValue;
}

type HttpOutcome =
  | { body: string; headers: Headers; kind: "ok"; status: number }
  | { body: string; kind: "rejected"; status: number }
  | { kind: "uncertain"; reason: string };

interface HttpRequest {
  body?: BodyInit;
  headers?: Record<string, string>;
  method: "DELETE" | "GET" | "PATCH" | "POST";
  /** "error" refuses redirects, for fetches whose destination was checked first. */
  redirect?: RequestRedirect;
  timeoutMs?: number;
  url: string;
}

const DEFAULT_TIMEOUT_MS = 20_000;

const request = async (input: HttpRequest): Promise<HttpOutcome> => {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    input.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(input.url, {
      body: input.body,
      headers: input.headers,
      method: input.method,
      redirect: input.redirect,
      signal: controller.signal,
    });

    const body = await response.text();

    if (response.ok) {
      return {
        body,
        headers: response.headers,
        kind: "ok",
        status: response.status,
      };
    }

    if (
      response.status >= 400 &&
      response.status < 500 &&
      response.status !== 408
    ) {
      return { body, kind: "rejected", status: response.status };
    }

    return {
      kind: "uncertain",
      reason: `The service answered ${response.status}.`,
    };
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "AbortError"
        ? "The service took too long to answer."
        : "The connection dropped.";

    return { kind: "uncertain", reason };
  } finally {
    clearTimeout(timer);
  }
};

/** Decode a JSON body at the I/O boundary with a schema; null when malformed or mismatched. */
const decodeJson = <Output>(
  schema: z.ZodType<Output>,
  body: string
): Output | null => {
  try {
    const parsed = schema.safeParse(JSON.parse(body));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/** A short, log-safe description of a provider's error body (no secrets, capped length). */
const describeRejection = (status: number, body: string): string => {
  const trimmed = body.replaceAll(/\s+/gu, " ").slice(0, 240);

  return `The service refused the request (${status})${trimmed ? `: ${trimmed}` : "."}`;
};

export { decodeJson, describeRejection, request };

export type { HttpOutcome, HttpRequest, JsonObject, JsonValue };
