/**
 * Read-only validation calls and one-time provisioning for each provider.
 * Every check is harmless: it reads the key's own metadata or a public list
 * and spends nothing. Provisioning (Composio auth configs and webhook, Photon
 * webhook destination) is idempotent: existing resources are reused.
 */
import { isRecord, parseJson, stringAt } from "./files";
import type { JsonValue } from "./files";

type CheckStatus = "ok" | "rejected" | "unreachable" | "warning";

interface CheckResult {
  detail: string;
  status: CheckStatus;
}

interface HttpAnswer {
  body: JsonValue | undefined;
  ok: boolean;
  status: number;
}

interface HttpRequest {
  body?: string;
  headers: Record<string, string>;
  method?: "GET" | "PATCH" | "POST";
  url: string;
}

const TIMEOUT_MS = 15_000;

const call = async (request: HttpRequest): Promise<HttpAnswer | null> => {
  try {
    const response = await fetch(request.url, {
      body: request.body,
      headers:
        request.body === undefined
          ? request.headers
          : { "Content-Type": "application/json", ...request.headers },
      method: request.method ?? "GET",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const text = await response.text();

    return { body: parseJson(text), ok: response.ok, status: response.status };
  } catch {
    return null;
  }
};

const judge = (
  answer: HttpAnswer | null,
  success: string,
  service: string
): CheckResult => {
  if (answer === null) {
    return {
      detail: `couldn't reach ${service}; the value was kept but not verified`,
      status: "unreachable",
    };
  }

  if (answer?.ok === true) {
    return { detail: success, status: "ok" };
  }

  if (answer.status === 401 || answer.status === 403) {
    return {
      detail: `${service} rejected the key (HTTP ${answer.status})`,
      status: "rejected",
    };
  }

  return {
    detail: `${service} answered HTTP ${answer.status}`,
    status: "warning",
  };
};

const isLocalUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0"
    );
  } catch {
    return true;
  }
};

// ── OpenRouter ─────────────────────────────────────────────────────────────

const checkOpenRouter = async (
  key: string,
  models: readonly string[]
): Promise<CheckResult> => {
  const keyCheck = judge(
    await call({
      headers: { Authorization: `Bearer ${key}` },
      url: "https://openrouter.ai/api/v1/key",
    }),
    "key accepted",
    "OpenRouter"
  );

  if (keyCheck.status !== "ok") {
    return keyCheck;
  }

  const missing: string[] = [];

  await Promise.all(
    models.map(async (model) => {
      const answer = await call({
        headers: { Authorization: `Bearer ${key}` },
        url: `https://openrouter.ai/api/v1/models/${model}/endpoints`,
      });

      if (answer !== null && answer.status === 404) {
        missing.push(model);
      }
    })
  );

  return missing.length === 0
    ? {
        detail: `key accepted; models ${models.join(", ")} found`,
        status: "ok",
      }
    : {
        detail: `key accepted, but OpenRouter doesn't list ${missing.join(", ")}`,
        status: "warning",
      };
};

// ── Gemini Live ────────────────────────────────────────────────────────────

const checkGemini = async (key: string, model: string): Promise<CheckResult> =>
  judge(
    await call({
      headers: { "x-goog-api-key": key },
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`,
    }),
    `key accepted; ${model} found`,
    "Google AI Studio"
  );

// ── Composio ───────────────────────────────────────────────────────────────

const COMPOSIO = "https://backend.composio.dev/api/v3.1";

/** Toolkits whose OAuth apps Composio manages, so no developer credentials are needed. */
const MANAGED_TOOLKITS = [
  { label: "Gmail", slug: "gmail" },
  { label: "Outlook", slug: "outlook" },
  { label: "Google Calendar", slug: "googlecalendar" },
  { label: "Google Drive", slug: "googledrive" },
  { label: "Facebook", slug: "facebook" },
  { label: "Instagram", slug: "instagram" },
] as const;

const checkComposio = async (key: string): Promise<CheckResult> =>
  judge(
    await call({
      headers: { "x-api-key": key },
      url: `${COMPOSIO}/auth_configs?limit=1`,
    }),
    "key accepted",
    "Composio"
  );

const firstItemId = (body: JsonValue | undefined): string | null => {
  const items = isRecord(body) ? body.items : undefined;
  const first = Array.isArray(items) ? items[0] : undefined;

  return stringAt(first, "id");
};

interface AuthConfigResult {
  configs: Record<string, string>;
  problems: string[];
}

/** Reuses an existing auth config per toolkit, or creates a Composio-managed one. */
const ensureAuthConfigs = async (
  key: string,
  existing: Record<string, string>
): Promise<AuthConfigResult> => {
  const configs = { ...existing };
  const problems: string[] = [];

  await Promise.all(
    MANAGED_TOOLKITS.flatMap((toolkit) =>
      configs[toolkit.slug] === undefined ? [toolkit] : []
    ).map(async (toolkit) => {
      const listed = await call({
        headers: { "x-api-key": key },
        url: `${COMPOSIO}/auth_configs?toolkit_slug=${toolkit.slug}&limit=20`,
      });

      const reuse = listed?.ok === true ? firstItemId(listed.body) : null;

      if (reuse !== null) {
        configs[toolkit.slug] = reuse;

        return;
      }

      const created = await call({
        body: JSON.stringify({
          auth_config: {
            name: `LifeLink ${toolkit.label}`,
            type: "use_composio_managed_auth",
          },
          toolkit: { slug: toolkit.slug },
        }),
        headers: { "x-api-key": key },
        method: "POST",
        url: `${COMPOSIO}/auth_configs`,
      });

      const id =
        created?.ok === true
          ? (stringAt(created.body, "auth_config", "id") ??
            stringAt(created.body, "id"))
          : null;

      if (id === null) {
        problems.push(
          `${toolkit.label}: Composio did not create an auth config${created === null ? " (no answer)" : ` (HTTP ${created.status})`}`
        );
      } else {
        configs[toolkit.slug] = id;
      }
    })
  );

  return { configs, problems };
};

const WEBHOOK_EVENTS = [
  "composio.trigger.message",
  "composio.connected_account.expired",
];

interface WebhookResult {
  detail: string;
  secret: string | null;
  status: CheckStatus;
}

/**
 * One webhook URL per Composio project. If one exists it is pointed at this
 * deployment. The signing secret is rotated only when setup doesn't already
 * hold it, because rotating breaks any other listener using the old one.
 */
const ensureComposioWebhook = async (
  key: string,
  siteUrl: string,
  haveSecret: boolean
): Promise<WebhookResult> => {
  const webhookUrl = `${siteUrl}/webhooks/composio`;
  const headers = { "x-api-key": key };

  const created = await call({
    body: JSON.stringify({
      enabled_events: WEBHOOK_EVENTS,
      version: "V3",
      webhook_url: webhookUrl,
    }),
    headers,
    method: "POST",
    url: `${COMPOSIO}/webhook_subscriptions`,
  });

  if (created?.ok === true) {
    return {
      detail: `webhook registered at ${webhookUrl}`,
      secret: stringAt(created.body, "secret"),
      status: "ok",
    };
  }

  if (created === null || created.status !== 409) {
    return {
      detail: `couldn't register the webhook${created === null ? "" : ` (HTTP ${created.status})`}`,
      secret: null,
      status: "warning",
    };
  }

  const listed = await call({
    headers,
    url: `${COMPOSIO}/webhook_subscriptions`,
  });

  const id = listed?.ok === true ? firstItemId(listed.body) : null;

  if (id === null) {
    return {
      detail:
        "a webhook already exists but couldn't be read; check the Composio dashboard",
      secret: null,
      status: "warning",
    };
  }

  await call({
    body: JSON.stringify({
      enabled_events: WEBHOOK_EVENTS,
      webhook_url: webhookUrl,
    }),
    headers,
    method: "PATCH",
    url: `${COMPOSIO}/webhook_subscriptions/${id}`,
  });

  if (haveSecret) {
    return {
      detail: `webhook points at ${webhookUrl}`,
      secret: null,
      status: "ok",
    };
  }

  const rotated = await call({
    headers,
    method: "POST",
    url: `${COMPOSIO}/webhook_subscriptions/${id}/rotate_secret`,
  });

  return rotated?.ok === true
    ? {
        detail: `webhook points at ${webhookUrl}; new signing secret stored`,
        secret: stringAt(rotated.body, "secret"),
        status: "ok",
      }
    : {
        detail:
          "webhook updated, but its signing secret couldn't be read; copy it from the Composio dashboard",
        secret: null,
        status: "warning",
      };
};

// ── Photon ─────────────────────────────────────────────────────────────────

const PHOTON = "https://spectrum.photon.codes";

const photonAuthorization = (
  projectSecret: string,
  projectId: string
): string =>
  `Basic ${Buffer.from(`${projectId}:${projectSecret}`, "utf-8").toString("base64")}`;

const checkPhoton = async (
  projectSecret: string,
  projectId: string
): Promise<CheckResult> => {
  const answer = await call({
    headers: { Authorization: photonAuthorization(projectSecret, projectId) },
    url: `${PHOTON}/projects/${encodeURIComponent(projectId)}/webhooks/`,
  });

  const result = judge(
    answer,
    "Spectrum Stable project credentials accepted",
    "Spectrum Stable"
  );

  if (result.status !== "ok") {
    return result;
  }

  return answer !== null &&
    isRecord(answer.body) &&
    answer.body.succeed === true &&
    Array.isArray(answer.body.data)
    ? result
    : {
        detail:
          "Spectrum's response was not a valid Stable webhook list; credentials remain unverified",
        status: "warning",
      };
};

/** Creates the webhook destination; Photon shows its signing secret only in this answer. */
const createPhotonWebhook = async (
  projectSecret: string,
  projectId: string,
  siteUrl: string
): Promise<WebhookResult> => {
  const created = await call({
    body: JSON.stringify({
      eventTypes: ["message.received"],
      schemaVersion: "normalized-events.v1",
      webhookUrl: `${siteUrl}/webhooks/photon`,
    }),
    headers: { Authorization: photonAuthorization(projectSecret, projectId) },
    method: "POST",
    url: `${PHOTON}/projects/${encodeURIComponent(projectId)}/webhooks/`,
  });

  const secret =
    created?.ok === true &&
    isRecord(created.body) &&
    created.body.succeed === true
      ? stringAt(created.body, "data", "signingSecret")
      : null;

  return secret === null
    ? {
        detail:
          created?.status === 409
            ? "This webhook URL already exists. Keep its original Spectrum signingSecret; LifeLink has not replaced or deleted the registration."
            : `couldn't create the webhook destination${created === null ? "" : ` (HTTP ${created.status})`}`,
        secret: null,
        status: "warning",
      }
    : {
        detail: `webhook destination created for ${siteUrl}/webhooks/photon`,
        secret,
        status: "ok",
      };
};

// ── Discord ────────────────────────────────────────────────────────────────

const checkDiscord = async (
  token: string,
  applicationId: string
): Promise<CheckResult> => {
  const answer = await call({
    headers: { Authorization: `Bot ${token}` },
    url: "https://discord.com/api/v10/users/@me",
  });

  const result = judge(answer, "bot token accepted", "Discord");

  if (result.status !== "ok" || answer === null) {
    return result;
  }

  const username = stringAt(answer.body, "username") ?? "the bot";
  const botId = stringAt(answer.body, "id");

  const mismatch =
    botId !== null && botId !== applicationId
      ? " (its user id differs from the application id; check both came from the same app)"
      : "";

  return {
    detail: `signed in as ${username}${mismatch}`,
    status: mismatch === "" ? "ok" : "warning",
  };
};

const discordInstallUrl = (applicationId: string): string =>
  `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(applicationId)}&scope=bot&permissions=0`;

// ── Telegram ───────────────────────────────────────────────────────────────

// The token is part of every Bot API URL, so URLs here are never printed.
const telegramMethod = (token: string, method: string): string =>
  `https://api.telegram.org/bot${token}/${method}`;

/** Reads the bot's own profile and returns its username; sends nothing. */
const checkTelegram = async (
  token: string
): Promise<CheckResult & { username: string | null }> => {
  const answer = await call({
    headers: {},
    url: telegramMethod(token, "getMe"),
  });

  // Telegram answers 401 or 404 for a wrong token.
  const result =
    answer?.status === 404
      ? {
          detail: "Telegram rejected the token (HTTP 404)",
          status: "rejected" as const,
        }
      : judge(answer, "bot token accepted", "Telegram");

  if (result.status !== "ok" || answer === null) {
    return { ...result, username: null };
  }

  const username = stringAt(answer.body, "result", "username");

  return {
    detail:
      username === null ? "bot token accepted" : `signed in as @${username}`,
    status: "ok",
    username,
  };
};

/** Points the bot at Convex. Idempotent: Telegram replaces any earlier webhook. */
const setTelegramWebhook = async (
  token: string,
  siteUrl: string,
  secret: string
): Promise<CheckResult> => {
  const answer = await call({
    body: JSON.stringify({
      allowed_updates: ["message"],
      secret_token: secret,
      url: `${siteUrl}/webhooks/telegram`,
    }),
    headers: {},
    method: "POST",
    url: telegramMethod(token, "setWebhook"),
  });

  return judge(
    answer,
    `webhook set to ${siteUrl}/webhooks/telegram`,
    "Telegram"
  );
};

export {
  checkComposio,
  checkDiscord,
  checkGemini,
  checkOpenRouter,
  checkPhoton,
  checkTelegram,
  createPhotonWebhook,
  discordInstallUrl,
  ensureAuthConfigs,
  ensureComposioWebhook,
  isLocalUrl,
  setTelegramWebhook,
};

export type { CheckResult, CheckStatus };
