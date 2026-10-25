import { afterEach, describe, expect, it, vi } from "vitest";

import {
  findSentMessage,
  sendDirectMessage,
} from "../convex/integrations/discord";

const idempotencyKey = "test-action:v1";
const expectedNonce = "a488761cbff1b2cd9b8d1eb2";

const startedAt = Date.parse("2026-10-25T08:00:00Z");

const message = (id: string, content: string, offsetMs: number) => ({
  author: { bot: true, id: "test-bot" },
  content,
  id,
  nonce: expectedNonce,
  timestamp: new Date(startedAt + offsetMs).toISOString(),
});

const fullPage = (prefix: string) =>
  Array.from({ length: 50 }, (_, index) => ({
    ...message(`${prefix}-${index}`, "Another message", 100_000 - index),
    nonce: `${prefix}-${index}`,
  }));

describe("Discord uncertain-send reconciliation", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the same action nonce placed on outgoing sends", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: "sent" }));

    vi.stubGlobal("fetch", fetchMock);
    await sendDirectMessage(
      "test-token",
      "test-channel",
      "Hello",
      idempotencyKey,
      []
    );
    const body = fetchMock.mock.calls[0]?.[1]?.body;

    if (!(body instanceof FormData)) {
      throw new Error("Expected a Discord multipart message request.");
    }

    expect(JSON.parse(String(body.get("payload_json")))).toMatchObject({
      enforce_nonce: true,
      nonce: expectedNonce,
    });
  });

  it("keeps conflicting content with the right nonce unknown", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json([message("conflicting", "Other text", 1000)])
        )
    );
    await expect(
      findSentMessage(
        "test-token",
        "test-channel",
        "Hello",
        startedAt,
        idempotencyKey
      )
    ).resolves.toStrictEqual({ found: null });
  });

  it("does not credit a later identical message with a different action nonce", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json([
          {
            ...message("other-action", "Hello", 1000),
            nonce: "another-action-nonce",
          },
        ])
      )
    );
    await expect(
      findSentMessage(
        "test-token",
        "test-channel",
        "Hello",
        startedAt,
        idempotencyKey
      )
    ).resolves.toStrictEqual({ found: false });
  });

  it.each([undefined, null])(
    "keeps an identical message without nonce %s unknown",
    async (nonce) => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(
            Response.json([
              { ...message("unidentified", "Hello", 1000), nonce },
            ])
          )
      );
      await expect(
        findSentMessage(
          "test-token",
          "test-channel",
          "Hello",
          startedAt,
          idempotencyKey
        )
      ).resolves.toStrictEqual({ found: null });
    }
  );

  it("does not count an identical message from before this attempt", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json([message("previous-send", "Hello", -30_000)])
        )
    );

    await expect(
      findSentMessage(
        "test-token",
        "test-channel",
        "Hello",
        startedAt,
        idempotencyKey
      )
    ).resolves.toStrictEqual({ found: false });
  });

  it("finds the send beyond the newest fifty messages", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(fullPage("recent")))
      .mockResolvedValueOnce(
        Response.json([message("actual-send", "Hello", 0)])
      );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      findSentMessage(
        "test-token",
        "test-channel",
        "Hello",
        startedAt,
        idempotencyKey
      )
    ).resolves.toStrictEqual({ found: true, id: "actual-send" });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://discord.com/api/v10/channels/test-channel/messages?limit=50&before=recent-49",
      expect.anything()
    );
  });

  it("keeps the outcome unknown when an older page cannot be read", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json(fullPage("recent")))
        .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
    );

    await expect(
      findSentMessage(
        "test-token",
        "test-channel",
        "Hello",
        startedAt,
        idempotencyKey
      )
    ).resolves.toStrictEqual({ found: null });
  });

  it("bounds pagination and keeps an uncovered attempt unknown", async () => {
    const fetchMock = vi.fn<typeof fetch>();

    for (const prefix of ["first", "second", "third", "fourth", "fifth"]) {
      fetchMock.mockResolvedValueOnce(Response.json(fullPage(prefix)));
    }

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      findSentMessage(
        "test-token",
        "test-channel",
        "Hello",
        startedAt,
        idempotencyKey
      )
    ).resolves.toStrictEqual({ found: null });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("does not infer absence from an unreadable timestamp", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json([
            { ...message("invalid", "Hello", 0), timestamp: "invalid" },
          ])
        )
    );

    await expect(
      findSentMessage(
        "test-token",
        "test-channel",
        "Hello",
        startedAt,
        idempotencyKey
      )
    ).resolves.toStrictEqual({ found: null });
  });
});
