import { register } from "@convex-dev/better-auth/test";
import type betterAuthTest from "@convex-dev/better-auth/test";
import { convexTest } from "convex-test";
import type { DataModelFromSchemaDefinition } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { createAuth } from "./auth";
import { create, existing, provision } from "./demoAccounts";
import { bindTelegramChat } from "./lib/telegram";
import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./actions.ts": () => import("./actions"),
  "./connections.ts": () => import("./connections"),
  "./contacts.ts": () => import("./contacts"),
  "./demo.ts": () => import("./demo"),
  "./demoAccounts.ts": () => import("./demoAccounts"),
  "./drive.ts": () => import("./drive"),
  "./execution.ts": () => import("./execution"),
  "./messages.ts": () => import("./messages"),
  "./profiles.ts": () => import("./profiles"),
  "./tasks.ts": () => import("./tasks"),
  "./telegram.ts": () => import("./telegram"),
  "./webhooks.ts": () => import("./webhooks"),
};

const EMAIL = "presentation@example.com";
const PASSWORD = "Test-only presentation password 123!";
const NOW = Date.parse("2026-10-25T12:00:00Z");
const fetchMock = vi.fn<typeof fetch>();

const newBackend = () => {
  const backend = convexTest(schema, modules);
  register(backend);

  return backend;
};

type Backend = ReturnType<typeof newBackend>;

type AuthAccount = DataModelFromSchemaDefinition<
  typeof betterAuthTest.schema
>["account"]["document"];

const onboarding = {
  city: null,
  displayName: "Existing Person",
  postalCode: null,
  preferredName: "Existing",
  role: "owner" as const,
  signOffName: null,
  startInDemoMode: false,
  timeZone: "America/New_York",
};

const createOrdinaryAccount = async (
  backend: Backend,
  email: string,
  role: "family" | "owner" | null
) => {
  const user = await backend.run(async (ctx) => {
    const auth = await createAuth(ctx).$context;
    const password = await auth.password.hash(PASSWORD);

    const created = await auth.internalAdapter.createUser({
      email,
      emailVerified: false,
      name: "Existing Person",
    });

    await auth.internalAdapter.linkAccount({
      accountId: created.id,
      password,
      providerId: "credential",
      userId: created.id,
    });

    return created;
  });

  const person = backend.withIdentity({ subject: user.id });

  const profileId =
    role === null
      ? null
      : await person.mutation(api.profiles.completeOnboarding, {
          ...onboarding,
          role,
        });

  return { person, profileId, user };
};

/** Compare persisted rows, including credentials, to catch silent repair or resets. */
const snapshot = async (backend: Backend) => {
  const application = await backend.run(async (ctx) => ({
    appointments: await ctx.db.query("appointments").take(100),
    auditLog: await ctx.db.query("auditLog").take(100),
    connections: await ctx.db.query("connections").take(100),
    contacts: await ctx.db.query("contacts").take(100),
    emails: await ctx.db.query("emails").take(100),
    groceryLists: await ctx.db.query("groceryLists").take(100),
    messages: await ctx.db.query("messages").take(100),
    preferences: await ctx.db.query("preferences").take(100),
    profiles: await ctx.db.query("profiles").take(100),
    reminders: await ctx.db.query("reminders").take(100),
    spendingLimits: await ctx.db.query("spendingLimits").take(100),
    telegramLinks: await ctx.db.query("telegramLinks").take(100),
  }));

  const [users, accounts, sessions] = await Promise.all([
    backend.query(components.betterAuth.adapter.findMany, {
      model: "user",
      paginationOpts: { cursor: null, numItems: 100 },
    }),
    backend.query(components.betterAuth.adapter.findMany, {
      model: "account",
      paginationOpts: { cursor: null, numItems: 100 },
    }),
    backend.query(components.betterAuth.adapter.findMany, {
      model: "session",
      paginationOpts: { cursor: null, numItems: 100 },
    }),
  ]);

  return {
    accounts: accounts.page,
    application,
    sessions: sessions.page,
    users: users.page,
  };
};

const createPresentation = async (backend: Backend) => {
  const result = await backend.action(internal.demoAccounts.create, {
    email: EMAIL,
    password: PASSWORD,
  });

  const profile = await backend.run(
    async (ctx) => await ctx.db.get(result.profileId)
  );

  if (profile === null) {
    throw new Error("Provisioning returned a missing profile.");
  }

  return {
    owner: backend.withIdentity({ subject: profile.authUserId }),
    profile,
    result,
  };
};

const staleTelegramLink = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  contactId: Id<"contacts">,
  bound = false
) =>
  await backend.run(async (ctx) => {
    if (bound) {
      const contact = await ctx.db.get(contactId);

      if (contact === null) {
        throw new Error("Expected the stale link's contact.");
      }

      await ctx.db.patch(contactId, {
        channels: [
          ...contact.channels,
          { address: "555000111", channel: "telegram", preferred: false },
        ],
      });
    }

    return await ctx.db.insert("telegramLinks", {
      chatId: bound ? "555000111" : null,
      code: "stale-presentation-link",
      codeExpiresAt: NOW + 60_000,
      contactId,
      createdAt: NOW,
      expectedUsername: bound ? null : "sam_alvarez",
      firstName: bound ? "Sam" : null,
      linkedAt: bound ? NOW : null,
      ownerId,
      preferred: true,
      username: bound ? "sam_alvarez" : null,
    });
  });

const telegramUpdate = (text: string) => ({
  chatId: "555000111",
  chatType: "private",
  firstName: "Sam",
  fromBot: false,
  hasPhoto: false,
  languageCode: "en",
  messageId: "test-message-1",
  payload: "{}",
  text,
  updateId: "test-update-1",
  username: "sam_alvarez",
});

describe("operator presentation accounts", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(NOW);
    vi.stubEnv(
      "BETTER_AUTH_SECRET",
      "test-only-auth-secret-at-least-32-characters"
    );
    vi.stubEnv("CONVEX_SITE_URL", "https://test.convex.site");
    vi.stubEnv("SITE_URL", "http://localhost:3001");
    vi.stubEnv("DEMO_MODE_ALLOWED", "false");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockRejectedValue(new Error("Unexpected external request"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it.each(["false", "true"])(
    "commits a usable seeded account immediately with DEMO_MODE_ALLOWED=%s",
    async (allowed) => {
      vi.stubEnv("DEMO_MODE_ALLOWED", allowed);
      const backend = newBackend();
      const { owner, profile, result } = await createPresentation(backend);
      // No scheduler draining: samples must exist when provisioning returns.
      const state = await snapshot(backend);
      const me = await owner.query(api.profiles.me, {});

      expect(result).toStrictEqual({
        created: true,
        demoMode: true,
        displayName: "LifeLink Demo",
        email: EMAIL,
        passwordChanged: false,
        presentationDemo: true,
        profileId: profile._id,
        timeZone: "America/New_York",
      });
      expect(me).toMatchObject({
        needsOnboarding: false,
        preferences: { captions: true, profileId: profile._id, theme: "light" },
        profile: {
          demoMode: true,
          displayName: "LifeLink Demo",
          preferredName: "LifeLink Demo",
          presentationDemo: true,
          role: "owner",
        },
      });
      expect(state).toMatchObject({
        accounts: [
          {
            accountId: profile.authUserId,
            providerId: "credential",
            userId: profile.authUserId,
          },
        ],
        application: {
          appointments: expect.arrayContaining(
            ["Dr. Patel", "Plumber visit", "Dentist"].map((title) =>
              expect.objectContaining({ title })
            )
          ),
          connections: expect.arrayContaining(
            ["gmail", "outlook", "google_calendar", "google_drive"].map(
              (provider) => expect.objectContaining({ provider })
            )
          ),
          contacts: expect.arrayContaining(
            ["Sam Rivera", "Linda Rivera", "Rosa Martinez"].map((name) =>
              expect.objectContaining({ name })
            )
          ),
        },
        sessions: [],
        users: [
          {
            _id: profile.authUserId,
            email: EMAIL,
            emailVerified: false,
            name: "LifeLink Demo",
          },
        ],
      });
      expect({
        connectionsAreSimulated: state.application.connections.every(
          (row) =>
            row.ownerId === profile._id &&
            row.mode === "simulated" &&
            row.status === "active" &&
            row.externalAccountId === null &&
            row.pendingAttemptId === null
        ),
        contactsAreSample: state.application.contacts.every(
          (row) => row.ownerId === profile._id && row.sample
        ),
        groceriesAreSample: state.application.groceryLists.every(
          (row) =>
            row.ownerId === profile._id && row.sample && row.items.length > 0
        ),
        populatedEmail: state.application.emails.length > 1,
        populatedGroceries: state.application.groceryLists.length > 1,
        populatedMessages: state.application.messages.length > 1,
        rowsAreSimulated: [
          ...state.application.emails,
          ...state.application.messages,
          ...state.application.appointments,
        ].every(
          (row) => row.ownerId === profile._id && row.mode === "simulated"
        ),
      }).toStrictEqual({
        connectionsAreSimulated: true,
        contactsAreSample: true,
        groceriesAreSample: true,
        populatedEmail: true,
        populatedGroceries: true,
        populatedMessages: true,
        rowsAreSimulated: true,
      });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("normalizes email and honors explicit profile details", async () => {
    const backend = newBackend();

    const result = await backend.action(internal.demoAccounts.create, {
      displayName: "  Morgan Lee  ",
      email: "  PRESENTATION@EXAMPLE.COM  ",
      password: PASSWORD,
      timeZone: "Pacific/Honolulu",
    });

    const state = await snapshot(backend);
    expect(result).toMatchObject({
      displayName: "Morgan Lee",
      email: EMAIL,
      timeZone: "Pacific/Honolulu",
    });
    expect(state.application.profiles[0]).toMatchObject({
      displayName: "Morgan Lee",
      preferredName: "Morgan",
      timeZone: "Pacific/Honolulu",
    });
    expect(state.users[0]).toMatchObject({ email: EMAIL, name: "Morgan Lee" });
  });

  it("leaves ordinary users and their preferences and contacts unchanged", async () => {
    const backend = newBackend();

    const ordinary = await createOrdinaryAccount(
      backend,
      "ordinary@example.com",
      "owner"
    );

    await ordinary.person.mutation(api.profiles.updatePreferences, {
      speechVoice: "george",
      theme: "dark",
    });
    await ordinary.person.mutation(api.contacts.create, {
      channels: [
        { address: "friend@example.com", channel: "email", preferred: true },
      ],
      name: "Real Friend",
      relationship: "Friend",
      trusted: true,
    });
    const before = await ordinary.person.query(api.profiles.me, {});
    const contacts = await ordinary.person.query(api.contacts.list, {});
    const stateBefore = await snapshot(backend);

    await createPresentation(backend);

    await expect(
      ordinary.person.query(api.profiles.me, {})
    ).resolves.toStrictEqual(before);
    await expect(
      ordinary.person.query(api.contacts.list, {})
    ).resolves.toStrictEqual(contacts);

    const stateAfter = await snapshot(backend);

    const authAfter = stateAfter.accounts.filter(
      (account: AuthAccount) => account.userId === ordinary.user.id
    );

    expect(authAfter).toStrictEqual(stateBefore.accounts);
    expect(before?.profile?.presentationDemo).toBeUndefined();
    expect(before?.profile?.demoMode).toBeFalsy();
  });

  it.each([
    { label: "ordinary owner", role: "owner" as const },
    { label: "family member", role: "family" as const },
    { label: "auth-only user", role: null },
  ])(
    "rejects an email belonging to an $label without writing anything",
    async ({ role }) => {
      const backend = newBackend();
      await createOrdinaryAccount(backend, EMAIL, role);
      const before = await snapshot(backend);

      await expect(
        backend.action(internal.demoAccounts.create, {
          email: ` ${EMAIL.toUpperCase()} `,
          password: "A different test password 456!",
        })
      ).rejects.toMatchObject({ data: { code: "email_in_use" } });

      await expect(snapshot(backend)).resolves.toStrictEqual(before);
    }
  );

  it("does not treat ordinary Practice mode as presentation provenance", async () => {
    const backend = newBackend();
    const ordinary = await createOrdinaryAccount(backend, EMAIL, "owner");
    vi.stubEnv("DEMO_MODE_ALLOWED", "true");
    vi.useFakeTimers();
    await ordinary.person.mutation(api.profiles.setDemoMode, { enabled: true });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const before = await snapshot(backend);

    await expect(
      backend.action(internal.demoAccounts.create, {
        email: EMAIL,
        password: PASSWORD,
      })
    ).rejects.toMatchObject({ data: { code: "email_in_use" } });

    await expect(snapshot(backend)).resolves.toStrictEqual(before);
    // Ordinary Practice accounts retain their existing ability to return to live mode.
    await ordinary.person.mutation(api.profiles.setDemoMode, {
      enabled: false,
    });
    const me = await ordinary.person.query(api.profiles.me, {});
    expect(me?.profile).toMatchObject({
      demoMode: false,
      role: "owner",
    });
  });

  it("reuses the same credentials and preserves edited data on a same-password retry", async () => {
    const backend = newBackend();
    const { owner, profile } = await createPresentation(backend);
    await owner.mutation(api.profiles.updateProfile, {
      city: "Honolulu",
      displayName: "Elena Updated",
      postalCode: null,
      preferredName: "Elena",
      signOffName: null,
      timeZone: "Pacific/Honolulu",
    });
    await owner.mutation(api.profiles.updatePreferences, {
      speechVoice: "george",
      theme: "dark",
    });
    const before = await snapshot(backend);

    const retry = await backend.action(internal.demoAccounts.create, {
      displayName: "Do not overwrite",
      email: EMAIL.toUpperCase(),
      password: PASSWORD,
      timeZone: "UTC",
    });

    expect(retry).toMatchObject({
      created: false,
      displayName: "Elena Updated",
      passwordChanged: false,
      profileId: profile._id,
      timeZone: "Pacific/Honolulu",
    });
    await expect(snapshot(backend)).resolves.toStrictEqual(before);
  });

  it("rejects a wrong repeat password without resetting credentials or sample data", async () => {
    const backend = newBackend();
    await createPresentation(backend);
    const before = await snapshot(backend);

    await expect(
      backend.action(internal.demoAccounts.create, {
        email: EMAIL,
        password: "Wrong but sufficiently long password!",
      })
    ).rejects.toMatchObject({ data: { code: "invalid_password" } });
    await expect(snapshot(backend)).resolves.toStrictEqual(before);
    await expect(
      backend.action(internal.demoAccounts.create, {
        email: EMAIL,
        password: PASSWORD,
      })
    ).resolves.toMatchObject({ created: false, passwordChanged: false });
  });

  it("locks presentation accounts in simulated mode even when ordinary Practice is disabled", async () => {
    const backend = newBackend();
    const { owner } = await createPresentation(backend);
    const before = await snapshot(backend);

    await expect(
      owner.mutation(api.profiles.setDemoMode, { enabled: false })
    ).rejects.toMatchObject({
      data: { code: "presentation_demo_locked" },
    });
    await owner.mutation(api.profiles.setDemoMode, { enabled: true });

    await expect(snapshot(backend)).resolves.toStrictEqual(before);
  });

  it("keeps provisioning internal and rejects presentation flags during onboarding", async () => {
    const backend = newBackend();
    const person = backend.withIdentity({ subject: "public-signup" });
    const forgedOnboarding = { ...onboarding, presentationDemo: true };

    expect([
      create.isInternal,
      existing.isInternal,
      provision.isInternal,
    ]).toStrictEqual([true, true, true]);
    await expect(
      person.mutation(api.profiles.completeOnboarding, forgedOnboarding)
    ).rejects.toThrow("Unexpected field `presentationDemo`");
    const state = await snapshot(backend);
    expect(state.application.profiles).toHaveLength(0);
  });

  it("rejects presentation flags in public profile, preferences and mode updates", async () => {
    const backend = newBackend();
    const person = backend.withIdentity({ subject: "public-signup" });
    await person.mutation(api.profiles.completeOnboarding, onboarding);
    const before = await snapshot(backend);

    const forgedUpdate = {
      city: null,
      displayName: "Forged Presentation",
      postalCode: null,
      preferredName: "Forged",
      presentationDemo: true,
      signOffName: null,
      timeZone: "UTC",
    };

    const forgedPreferences = { presentationDemo: true, speechVoice: null };
    const forgedMode = { enabled: true, presentationDemo: true };

    await expect(
      person.mutation(api.profiles.updateProfile, forgedUpdate)
    ).rejects.toThrow("Unexpected field `presentationDemo`");
    await expect(
      person.mutation(api.profiles.updatePreferences, forgedPreferences)
    ).rejects.toThrow("Unexpected field `presentationDemo`");
    await expect(
      person.mutation(api.profiles.setDemoMode, forgedMode)
    ).rejects.toThrow("Unexpected field `presentationDemo`");
    await expect(snapshot(backend)).resolves.toStrictEqual(before);
  });

  it("refuses a real provider connection before making an external request", async () => {
    const backend = newBackend();
    const { owner } = await createPresentation(backend);
    vi.stubEnv("COMPOSIO_API_KEY", "test-only-provider-key");
    const before = await snapshot(backend);

    await expect(
      owner.action(api.connections.start, { provider: "gmail" })
    ).rejects.toMatchObject({
      data: { code: "practice_mode" },
    });

    await expect(snapshot(backend)).resolves.toStrictEqual(before);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("executes an approved message as simulated without contacting a provider", async () => {
    const backend = newBackend();
    const { owner } = await createPresentation(backend);
    const contacts = await owner.query(api.contacts.list, {});
    const linda = contacts.find((contact) => contact.name === "Linda Rivera");

    if (linda === undefined) {
      throw new Error("Expected the seeded email contact.");
    }

    vi.useFakeTimers();

    const taskId = await owner.mutation(api.messages.draft, {
      body: "See you on Sunday, Linda.",
      contactId: linda._id,
      photoIds: [],
    });

    const draft = await owner.query(api.tasks.detail, { taskId });
    const [action] = draft.actions;

    if (action?.current === null || action === undefined) {
      throw new Error("Expected a reviewable message action.");
    }

    expect([draft.task.mode, action.action.mode]).toStrictEqual([
      "simulated",
      "simulated",
    ]);

    await owner.mutation(api.actions.approve, {
      actionId: action.action._id,
      fingerprint: action.current.fingerprint,
      method: "tap",
      version: action.current.version,
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const completed = await owner.query(api.tasks.detail, { taskId });

    expect(completed.actions[0]).toMatchObject({
      action: { mode: "simulated", status: "succeeded" },
      attempts: [{ outcome: "succeeded", provider: "simulated" }],
      receipts: [
        {
          mode: "simulated",
          provider: "simulated",
          providerReference: expect.stringMatching(/^sim_/u),
        },
      ],
    });
    expect(completed.messages).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          body: "See you on Sunday, Linda.",
          direction: "outgoing",
          mode: "simulated",
          status: "sent",
        }),
      ])
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("omits Practice image alt wording only for presentation Drive previews", async () => {
    const backend = newBackend();
    const { owner } = await createPresentation(backend);

    const ordinary = await createOrdinaryAccount(
      backend,
      "practice@example.com",
      "owner"
    );

    vi.stubEnv("DEMO_MODE_ALLOWED", "true");
    vi.useFakeTimers();
    await ordinary.person.mutation(api.profiles.setDemoMode, { enabled: true });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    await ordinary.person.mutation(api.connections.connectPractice, {
      provider: "google_drive",
    });

    const request = { cursor: null, search: ".svg", sort: "recent" as const };
    const presentation = await owner.action(api.drive.files, request);
    const practice = await ordinary.person.action(api.drive.files, request);

    const labelledPictures = new Set([
      "Atorvastatin label.svg",
      "Insurance card (front).svg",
    ]);

    const presentationImages = presentation.files.flatMap((file) =>
      labelledPictures.has(file.name) && file.preview.type === "image"
        ? [file.preview]
        : []
    );

    const practiceImages = practice.files.flatMap((file) =>
      labelledPictures.has(file.name) && file.preview.type === "image"
        ? [file.preview]
        : []
    );

    expect(presentationImages).toHaveLength(2);
    expect(practiceImages).toHaveLength(2);
    expect({
      assetPaths: presentationImages.map((preview) => preview.src),
      practiceAltIsLabelled: practiceImages.every((preview) =>
        preview.alt.toLowerCase().includes("practice")
      ),
      presentationAltIsUnlabelled: presentationImages.every(
        (preview) => !preview.alt.toLowerCase().includes("practice")
      ),
    }).toStrictEqual({
      assetPaths: [
        "/presentation/prescription-label.svg",
        "/presentation/insurance-card.svg",
      ],
      practiceAltIsLabelled: true,
      presentationAltIsUnlabelled: true,
    });
    expect(practiceImages.map((preview) => preview.src)).toStrictEqual([
      "/practice/prescription-label.svg",
      "/practice/insurance-card.svg",
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects presentation Telegram link creation with a fully configured bot", async () => {
    const backend = newBackend();
    const { owner } = await createPresentation(backend);
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123456:test-only-bot-token");
    vi.stubEnv("TELEGRAM_BOT_USERNAME", "LifeLinkTestBot");
    vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", "test-only-webhook-secret");
    const [contact] = await owner.query(api.contacts.list, {});

    if (contact === undefined) {
      throw new Error("Expected a seeded contact.");
    }

    const before = await snapshot(backend);

    await expect(
      owner.mutation(api.telegram.createLink, { contactId: contact._id })
    ).rejects.toThrow(/presentation/iu);

    await expect(snapshot(backend)).resolves.toStrictEqual(before);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["create", "update"] as const)(
    "rejects presentation Telegram username linking through contacts.%s",
    async (operation) => {
      const backend = newBackend();
      const { owner } = await createPresentation(backend);
      const [contact] = await owner.query(api.contacts.list, {});

      if (contact === undefined) {
        throw new Error("Expected a seeded contact.");
      }

      const args = {
        channels: [
          {
            address: "friend@example.com",
            channel: "email" as const,
            preferred: true,
          },
        ],
        name: "Telegram Friend",
        relationship: "Friend",
        telegram: { preferred: true, username: "sam_alvarez" },
        trusted: true,
      };

      const before = await snapshot(backend);

      const attempt =
        operation === "create"
          ? owner.mutation(api.contacts.create, args)
          : owner.mutation(api.contacts.update, {
              ...args,
              contactId: contact._id,
            });

      await expect(attempt).rejects.toThrow(/presentation/iu);

      await expect(snapshot(backend)).resolves.toStrictEqual(before);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("does not bind a stale Telegram link belonging to a presentation account", async () => {
    const backend = newBackend();
    const { owner, profile } = await createPresentation(backend);
    const [contact] = await owner.query(api.contacts.list, {});

    if (contact === undefined) {
      throw new Error("Expected a seeded contact.");
    }

    const linkId = await backend.run(
      async (ctx) =>
        await ctx.db.insert("telegramLinks", {
          chatId: null,
          code: "stale-presentation-link",
          codeExpiresAt: NOW + 60_000,
          contactId: contact._id,
          createdAt: NOW,
          expectedUsername: "sam_alvarez",
          firstName: null,
          linkedAt: null,
          ownerId: profile._id,
          preferred: true,
          username: null,
        })
    );

    const before = await snapshot(backend);

    const bound = await backend.run(async (ctx) => {
      const link = await ctx.db.get(linkId);

      if (link === null) {
        throw new Error("Expected the stale Telegram link fixture.");
      }

      return await bindTelegramChat(ctx, link, {
        chatId: "555000111",
        firstName: "Sam",
        username: "sam_alvarez",
      });
    });

    expect(bound).toBeNull();
    await expect(snapshot(backend)).resolves.toStrictEqual(before);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["code", "username", "chat"] as const)(
    "ignores stale presentation Telegram %s updates without sending notices",
    async (kind) => {
      const backend = newBackend();
      const { owner, profile } = await createPresentation(backend);
      const [contact] = await owner.query(api.contacts.list, {});

      if (contact === undefined) {
        throw new Error("Expected a seeded contact.");
      }

      await staleTelegramLink(
        backend,
        profile._id,
        contact._id,
        kind === "chat"
      );
      vi.stubEnv("TELEGRAM_BOT_TOKEN", "123456:test-only-bot-token");
      vi.useFakeTimers();
      const before = await snapshot(backend);

      const textByKind = {
        chat: "A real incoming message",
        code: "/start stale-presentation-link",
        username: "/start",
      };

      const result = await backend.mutation(
        internal.webhooks.telegramUpdate,
        telegramUpdate(textByKind[kind])
      );

      await backend.finishAllScheduledFunctions(vi.runAllTimers);

      expect(result).toBe("ignored");
      await expect(snapshot(backend)).resolves.toStrictEqual(before);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it.each(["username", "chat"] as const)(
    "honors a normal account's valid Telegram code despite a stale presentation %s match",
    async (kind) => {
      const backend = newBackend();
      const { owner, profile } = await createPresentation(backend);

      const ordinary = await createOrdinaryAccount(
        backend,
        "normal-telegram@example.com",
        "owner"
      );

      const [contact] = await owner.query(api.contacts.list, {});

      if (contact === undefined) {
        throw new Error("Expected a seeded contact.");
      }

      const staleId = await staleTelegramLink(
        backend,
        profile._id,
        contact._id,
        kind === "chat"
      );

      const presentationBefore = await backend.run(async (ctx) => ({
        contact: await ctx.db.get(contact._id),
        link: await ctx.db.get(staleId),
      }));

      const normalContactId = await ordinary.person.mutation(
        api.contacts.create,
        {
          channels: [
            {
              address: "normal@example.com",
              channel: "email",
              preferred: true,
            },
          ],
          name: "Sam Normal",
          relationship: "Friend",
          trusted: true,
        }
      );

      vi.stubEnv("TELEGRAM_BOT_TOKEN", "123456:test-only-bot-token");
      vi.stubEnv("TELEGRAM_BOT_USERNAME", "LifeLinkTestBot");
      vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", "test-only-webhook-secret");
      await ordinary.person.mutation(api.telegram.createLink, {
        contactId: normalContactId,
      });

      const status = await ordinary.person.query(api.telegram.status, {
        contactId: normalContactId,
      });

      const code = status.pending?.url.split("start=")[1];

      if (code === undefined) {
        throw new Error(
          "Expected the ordinary account's one-time Telegram code."
        );
      }

      fetchMock.mockResolvedValue(Response.json({ ok: true }));
      vi.useFakeTimers();

      const result = await backend.mutation(
        internal.webhooks.telegramUpdate,
        telegramUpdate(`/start ${code}`)
      );

      await backend.finishAllScheduledFunctions(vi.runAllTimers);

      const normalContact = await backend.run(
        async (ctx) => await ctx.db.get(normalContactId)
      );

      const presentationAfter = await backend.run(async (ctx) => ({
        contact: await ctx.db.get(contact._id),
        link: await ctx.db.get(staleId),
      }));

      expect(result).toBe("processed");
      expect(normalContact?.channels).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: "555000111",
            channel: "telegram",
          }),
        ])
      );
      expect(presentationAfter).toStrictEqual(presentationBefore);
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        expect.any(String),
        expect.objectContaining({ body: expect.stringContaining("Existing") })
      );
    }
  );
});
