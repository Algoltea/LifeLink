import { describe, expect, it } from "vitest";

import { signBody, signedRequest } from "./forward";
import { directMessageOf } from "./gateway";

const webCryptoSignature = async (
  secret: string,
  message: string
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return Buffer.from(signature).toString("base64");
};

const sample = {
  attachments: [],
  author: { id: "200" },
  channel_id: "300",
  content: "On my way!",
  id: "400",
  timestamp: "2026-10-23T12:00:00.000Z",
};

describe("bridge signing", () => {
  it("matches the backend's Web Crypto HMAC over timestamp, dot, body", async () => {
    expect(signBody("secret", "1761220800", '{"a":1}')).toBe(
      await webCryptoSignature("secret", '1761220800.{"a":1}')
    );
  });

  it("signs the exact body it sends, with a seconds timestamp", async () => {
    const request = signedRequest(
      { convexSiteUrl: "https://example.convex.site", secret: "secret" },
      {
        attachmentCount: 0,
        authorId: "1",
        channelId: "2",
        content: "hi",
        messageId: "3",
        sentAt: "now",
      },
      1_761_220_800_123
    );

    const body = await request.text();

    expect(request.url).toBe("https://example.convex.site/bridge/discord");
    expect(request.headers.get("x-bridge-timestamp")).toBe("1761220800");
    expect(request.headers.get("x-bridge-signature")).toBe(
      signBody("secret", "1761220800", body)
    );
  });
});

describe("direct message filter", () => {
  it("forwards a person's direct message", () => {
    expect(directMessageOf(sample, "100")).toStrictEqual({
      attachmentCount: 0,
      authorId: "200",
      channelId: "300",
      content: "On my way!",
      messageId: "400",
      sentAt: "2026-10-23T12:00:00.000Z",
    });
  });

  it("ignores server messages, bots, and the bot's own messages", () => {
    expect(directMessageOf({ ...sample, guild_id: "9" }, "100")).toBeNull();
    expect(
      directMessageOf({ ...sample, author: { bot: true, id: "200" } }, "100")
    ).toBeNull();
    expect(
      directMessageOf({ ...sample, author: { id: "100" } }, "100")
    ).toBeNull();
  });
});
