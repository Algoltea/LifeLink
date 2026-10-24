/**
 * Forwards one Discord direct message to the backend's /bridge/discord route.
 * The body is signed as HMAC-SHA256(secret, `${timestamp}.${body}`), base64,
 * which the backend checks along with a five-minute timestamp window. The
 * backend de-duplicates by Discord message id, so a retried forward is safe.
 */
import { createHmac } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";

interface BridgeMessage {
  attachmentCount: number;
  authorId: string;
  channelId: string;
  content: string;
  messageId: string;
  sentAt: string;
}

interface BridgeConfig {
  convexSiteUrl: string;
  secret: string;
}

const RETRY_DELAYS_MS = [1000, 4000, 15_000, 60_000] as const;

const signBody = (secret: string, timestamp: string, body: string): string =>
  createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("base64");

const signedRequest = (
  config: BridgeConfig,
  message: BridgeMessage,
  now = Date.now()
): Request => {
  const body = JSON.stringify(message);
  const timestamp = String(Math.floor(now / 1000));

  return new Request(new URL("/bridge/discord", config.convexSiteUrl), {
    body,
    headers: {
      "Content-Type": "application/json",
      "x-bridge-signature": signBody(config.secret, timestamp, body),
      "x-bridge-timestamp": timestamp,
    },
    method: "POST",
  });
};

type ForwardResult =
  | { kind: "delivered" }
  | { kind: "dropped"; reason: string };

/**
 * Network failures and 5xx answers are retried with backoff (each attempt is
 * re-signed so the timestamp stays fresh). A 4xx answer means the backend
 * refused the message, so retrying would not help.
 */
const forwardMessage = async (
  config: BridgeConfig,
  message: BridgeMessage,
  attempt = 0
): Promise<ForwardResult> => {
  let reason: string;

  try {
    const response = await fetch(signedRequest(config, message));

    if (response.ok) {
      return { kind: "delivered" };
    }

    reason = `backend answered ${response.status}`;

    if (response.status < 500) {
      return { kind: "dropped", reason };
    }
  } catch (error) {
    reason = error instanceof Error ? error.message : "network error";
  }

  const delay = RETRY_DELAYS_MS[attempt];

  if (delay === undefined) {
    return {
      kind: "dropped",
      reason: `${reason}; gave up after ${attempt + 1} attempts`,
    };
  }

  await sleep(delay);

  return await forwardMessage(config, message, attempt + 1);
};

export { forwardMessage, signBody, signedRequest };

export type { BridgeConfig, BridgeMessage, ForwardResult };
