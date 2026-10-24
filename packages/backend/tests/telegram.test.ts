import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../convex/_generated/api";
import { sendTelegramMessage } from "../convex/integrations/telegram";
import { newBackend, ownerWithContact } from "./harness";

const TOKEN = "123456:test-token-never-shown";
const SECRET = "webhook-secret-for-tests";
const CHAT_ID = 555_000_111;

type Backend = ReturnType<typeof newBackend>;

let nextUpdate = 1;

const update = (text: string, chatId = CHAT_ID) => {
  nextUpdate += 1;

  return {
    message: {
      chat: { id: chatId, type: "private" },
      date: 1_700_000_000,
      from: { first_name: "Sam", id: chatId, username: "sam_a" },
      message_id: nextUpdate,
      text,
    },
    update_id: nextUpdate,
  };
};

const post = async (
  backend: Backend,
  body: ReturnType<typeof update>,
  secret: string | null = SECRET
): Promise<Response> =>
  await backend.fetch("/webhooks/telegram", {
    body: JSON.stringify(body),
    headers:
      secret === null
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            "X-Telegram-Bot-Api-Secret-Token": secret,
          },
    method: "POST",
  });

const startCode = async (
  backend: Backend,
  owner: Awaited<ReturnType<typeof ownerWithContact>>["owner"],
  contactId: Awaited<ReturnType<typeof ownerWithContact>>["contactId"]
): Promise<string> => {
  await owner.mutation(api.telegram.createLink, { contactId });

  const status = await owner.query(api.telegram.status, { contactId });
  const url = status.pending?.url ?? "";

  expect(url).toMatch(/^https:\/\/t\.me\/LifeLinkTestBot\?start=[\w-]{24}$/u);

  return url.split("start=")[1] ?? "";
};

const telegramChannels = async (backend: Backend) =>
  await backend.run(async (ctx) => {
    const contacts = await ctx.db.query("contacts").collect();

    return contacts.flatMap((contact) =>
      contact.channels.filter((channel) => channel.channel === "telegram")
    );
  });

// The first HTTP call loads every Convex module, which is slow under a full parallel run.
describe("Telegram linking and replies", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", TOKEN);
    vi.stubEnv("TELEGRAM_BOT_USERNAME", "LifeLinkTestBot");
    vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", SECRET);
    // Confirmation notices are scheduled; never let a test reach Telegram.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => await Promise.resolve(Response.json({ ok: true })))
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("refuses updates without the exact webhook secret", async () => {
    const backend = newBackend();

    await expect(post(backend, update("hi"), null)).resolves.toHaveProperty(
      "status",
      401
    );
    await expect(
      post(backend, update("hi"), "wrong-secret")
    ).resolves.toHaveProperty("status", 401);
    await expect(post(backend, update("hi"))).resolves.toHaveProperty(
      "status",
      200
    );
  });

  it("links the chat that opens the one-time link, once", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);
    const code = await startCode(backend, owner, contactId);

    await post(backend, update(`/start ${code}`));

    await expect(telegramChannels(backend)).resolves.toStrictEqual([
      { address: String(CHAT_ID), channel: "telegram", preferred: false },
    ]);

    const status = await owner.query(api.telegram.status, { contactId });

    expect(status.linked?.username).toBe("sam_a");
    expect(status.pending).toBeNull();

    // A forwarded link is useless after first use: another chat can't take over.
    await post(backend, update(`/start ${code}`, 999_999));

    await expect(telegramChannels(backend)).resolves.toStrictEqual([
      { address: String(CHAT_ID), channel: "telegram", preferred: false },
    ]);
  });

  it("never saves a Telegram chat that was typed in instead of linked", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    await expect(
      owner.mutation(api.contacts.update, {
        channels: [
          { address: "+15555550142", channel: "imessage", preferred: true },
          { address: "424242", channel: "telegram", preferred: false },
        ],
        contactId,
        name: "Sam Alvarez",
        relationship: "Son",
        trusted: true,
      })
    ).rejects.toThrow(/can only be added by linking/u);
  });

  it("records replies from a linked chat and ignores unknown chats", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);
    const code = await startCode(backend, owner, contactId);

    await post(backend, update(`/start ${code}`));
    await post(backend, update("See you at noon."));
    await post(backend, update("Who is this?", 777_777));

    const incoming = await backend.run(
      async (ctx) =>
        await ctx.db
          .query("messages")
          .filter((query) => query.eq(query.field("direction"), "incoming"))
          .collect()
    );

    expect(
      incoming.map((message) => [message.channel, message.body])
    ).toStrictEqual([["telegram", "See you at noon."]]);
  });

  it("forgets the chat when unlinked", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);
    const code = await startCode(backend, owner, contactId);

    await post(backend, update(`/start ${code}`));
    await owner.mutation(api.telegram.unlink, { contactId });

    await expect(telegramChannels(backend)).resolves.toStrictEqual([]);
  });
});

const stubFetch = (respond: () => Promise<Response>) =>
  vi.stubGlobal("fetch", vi.fn(respond));

describe("Telegram send outcomes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reports a delivered message by its id", async () => {
    stubFetch(
      async () =>
        await Promise.resolve(
          Response.json({ ok: true, result: { message_id: 42 } })
        )
    );

    await expect(
      sendTelegramMessage(TOKEN, "1", "Hello", [])
    ).resolves.toStrictEqual({ id: "42", kind: "ok" });
  });

  it("treats a refusal as not sent, without echoing the token", async () => {
    stubFetch(
      async () =>
        await Promise.resolve(
          Response.json(
            {
              description: "Forbidden: bot was blocked by the user",
              error_code: 403,
              ok: false,
            },
            { status: 403 }
          )
        )
    );

    const result = await sendTelegramMessage(TOKEN, "1", "Hello", []);

    expect(result.kind).toBe("rejected");
    expect(JSON.stringify(result)).not.toContain(TOKEN);
  });

  it("treats a dropped connection as uncertain, without echoing the token", async () => {
    stubFetch(async () => await Promise.reject(new TypeError("network down")));

    const result = await sendTelegramMessage(TOKEN, "1", "Hello", []);

    expect(result.kind).toBe("uncertain");
    expect(JSON.stringify(result)).not.toContain(TOKEN);
  });
});
