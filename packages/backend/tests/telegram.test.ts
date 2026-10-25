import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../convex/_generated/api";
import { sendTelegramMessage } from "../convex/integrations/telegram";
import { newBackend, ownerWithContact } from "./harness";

const TOKEN = "123456:test-token-never-shown";
const SECRET = "webhook-secret-for-tests";
const CHAT_ID = 555_000_111;

type Backend = ReturnType<typeof newBackend>;

/** The `from` of a Telegram message, as the webhook reads it. */
interface TelegramSender {
  first_name: string;
  id: number;
  language_code?: string;
  username?: string;
}

let nextUpdate = 1;

const update = (
  text: string,
  chatId = CHAT_ID,
  username: string | null = "sam_a"
) => {
  nextUpdate += 1;

  const from: TelegramSender = {
    first_name: "Sam",
    id: chatId,
  };

  if (username !== null) {
    from.username = username;
  }

  return {
    message: {
      chat: { id: chatId, type: "private" },
      date: 1_700_000_000,
      from,
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
    vi.useRealTimers();
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

  it.each(["es-MX", "fr"])(
    "uses Telegram's %s language before linking",
    async (language) => {
      vi.useFakeTimers();
      const backend = newBackend();
      const message = update("/start", 999_999, null);

      message.message.from.language_code = language;
      await post(backend, message);
      await backend.finishAllScheduledFunctions(vi.runAllTimers);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(
            language === "es-MX" ? "¡Hola Sam!" : "Hi Sam!"
          ),
        })
      );
    }
  );

  it("uses contact language for connected notices and owner language for photo placeholders", async () => {
    vi.useFakeTimers();
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    await backend.run(
      async (ctx) => await ctx.db.patch(contactId, { language: "es" })
    );
    const code = await startCode(backend, owner, contactId);
    await post(backend, update(`/start ${code}`));
    await backend.finishAllScheduledFunctions(vi.runAllTimers);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining(
          "Su conexión está lista. Los mensajes de Ruth"
        ),
      })
    );
    await post(backend, update("/start"));
    await post(backend, update(`/start ${"x".repeat(24)}`));
    await backend.finishAllScheduledFunctions(vi.runAllTimers);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining("Su conexión ya está lista"),
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining("Este enlace venció"),
      })
    );

    const photo = update("");
    await backend.fetch("/webhooks/telegram", {
      body: JSON.stringify({
        ...photo,
        message: {
          ...photo.message,
          photo: [{ file_id: "test-photo", height: 20, width: 20 }],
        },
      }),
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": SECRET,
      },
      method: "POST",
    });

    const messages = await backend.run(
      async (ctx) => await ctx.db.query("messages").collect()
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]?.body).toBe("(Sent a photo. Open Telegram to see it.)");
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
    ).rejects.toThrow(/can only be added by its username or a link/u);
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

const contactDetails = {
  name: "Sam Alvarez",
  relationship: "Son",
  trusted: true,
};

const contactChannels = async (backend: Backend) =>
  await backend.run(async (ctx) => {
    const [contact] = await ctx.db.query("contacts").collect();

    return contact?.channels ?? [];
  });

describe("Telegram by username", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", TOKEN);
    vi.stubEnv("TELEGRAM_BOT_USERNAME", "LifeLinkTestBot");
    vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", SECRET);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => await Promise.resolve(Response.json({ ok: true })))
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("adds a contact by username and links them when they tap Start", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    await owner.mutation(api.contacts.update, {
      ...contactDetails,
      channels: [
        { address: "+15555550142", channel: "imessage", preferred: false },
      ],
      contactId,
      telegram: { preferred: true, username: "@Sam_A" },
    });

    // Nothing to send to until Telegram proves who that username is.
    await expect(contactChannels(backend)).resolves.toStrictEqual([
      { address: "+15555550142", channel: "imessage", preferred: false },
    ]);
    await expect(
      owner.query(api.telegram.status, { contactId })
    ).resolves.toMatchObject({ expectedUsername: "sam_a", linked: null });

    await post(backend, update("/start"));

    // Telegram was chosen as preferred, so it takes over once linked.
    await expect(contactChannels(backend)).resolves.toStrictEqual([
      { address: "+15555550142", channel: "imessage", preferred: false },
      { address: String(CHAT_ID), channel: "telegram", preferred: true },
    ]);
  });

  it("creates a new contact who only uses Telegram", async () => {
    const backend = newBackend();
    const { owner } = await ownerWithContact(backend, false);

    const contactId = await owner.mutation(api.contacts.create, {
      ...contactDetails,
      channels: [],
      name: "Nora Alvarez",
      telegram: { preferred: true, username: "nora_alv" },
    });

    await post(backend, update("hello", 444_000_222, "Nora_Alv"));

    const contact = await backend.run(
      async (ctx) => await ctx.db.get(contactId)
    );

    expect(contact?.channels).toStrictEqual([
      { address: "444000222", channel: "telegram", preferred: true },
    ]);
  });

  it("drops the linked chat when the username changes", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);
    const choice = { preferred: false, username: "sam_a" };

    await owner.mutation(api.contacts.update, {
      ...contactDetails,
      channels: [
        { address: "+15555550142", channel: "imessage", preferred: true },
      ],
      contactId,
      telegram: choice,
    });
    await post(backend, update("/start"));
    await owner.mutation(api.contacts.update, {
      ...contactDetails,
      channels: [
        { address: "+15555550142", channel: "imessage", preferred: true },
      ],
      contactId,
      telegram: { ...choice, username: "someone_else" },
    });

    await expect(contactChannels(backend)).resolves.toStrictEqual([
      { address: "+15555550142", channel: "imessage", preferred: true },
    ]);
  });

  it("links nobody when a stranger taps Start", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    await owner.mutation(api.contacts.update, {
      ...contactDetails,
      channels: [
        { address: "+15555550142", channel: "imessage", preferred: true },
      ],
      contactId,
      telegram: { preferred: false, username: "sam_a" },
    });
    await post(backend, update("/start", 999_999, "not_sam"));
    await post(backend, update("/start", 999_998, null));

    await expect(telegramChannels(backend)).resolves.toStrictEqual([]);
  });

  it("refuses a username Telegram would not allow", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, false);

    await expect(
      owner.mutation(api.contacts.update, {
        ...contactDetails,
        channels: [],
        contactId,
        telegram: { preferred: false, username: "@ab" },
      })
    ).rejects.toThrow(/5 to 32 letters/u);
  });
});

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
