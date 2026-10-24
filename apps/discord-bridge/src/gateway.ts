/**
 * A minimal Discord Gateway v10 client: identify, heartbeat, resume, and
 * reconnect. It asks only for the DIRECT_MESSAGES intent; Discord delivers the
 * content of messages sent directly to a bot without the privileged
 * MESSAGE_CONTENT intent.
 */
import { z } from "zod";

import type { BridgeMessage } from "./forward";

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
// 1 << 12, written out: the DIRECT_MESSAGES Gateway intent bit.

const DIRECT_MESSAGES_INTENT = 4096;

const OP = {
  dispatch: 0,
  heartbeat: 1,
  heartbeatAck: 11,
  hello: 10,
  identify: 2,
  invalidSession: 9,
  reconnect: 7,
  resume: 6,
} as const;

// Close codes after which reconnecting cannot succeed without a config change.
const FATAL_CLOSE_CODES = new Map<number, string>([
  [
    4004,
    "Discord rejected the bot token. Run `bun run dev:setup` to enter it again.",
  ],
  [4010, "Discord rejected the shard settings."],
  [4011, "This bot needs sharding, which the bridge does not support."],
  [4012, "Discord rejected the Gateway version."],
  [4013, "Discord rejected the requested intents."],
  [4014, "The bot is not allowed the Direct Messages intent."],
]);

const payloadSchema = z.object({
  d: z.unknown(),
  op: z.number(),
  s: z.number().nullable().optional(),
  t: z.string().nullable().optional(),
});

const helloSchema = z.object({ heartbeat_interval: z.number() });

const readySchema = z.object({
  resume_gateway_url: z.string(),
  session_id: z.string(),
  user: z.object({ id: z.string(), username: z.string() }),
});

const messageSchema = z.object({
  attachments: z.array(z.object({ id: z.string() })).default([]),
  author: z.object({ bot: z.boolean().optional(), id: z.string() }),
  channel_id: z.string(),
  content: z.string(),
  guild_id: z.string().optional(),
  id: z.string(),
  timestamp: z.string(),
});

interface GatewayEvents {
  onDirectMessage: (message: BridgeMessage) => void;
  onFatal: (reason: string) => void;
  onLog: (line: string) => void;
}

interface Session {
  id: string;
  resumeUrl: string;
}

/** Turns a Gateway MESSAGE_CREATE into a bridge message, or null when it isn't a person's direct message. */
const directMessageOf = (
  data: z.infer<typeof messageSchema>,
  botUserId: string | null
): BridgeMessage | null => {
  const fromPerson = data.author.bot !== true && data.author.id !== botUserId;

  if (data.guild_id !== undefined || !fromPerson) {
    return null;
  }

  return {
    attachmentCount: data.attachments.length,
    authorId: data.author.id,
    channelId: data.channel_id,
    content: data.content,
    messageId: data.id,
    sentAt: data.timestamp,
  };
};

interface GatewayHandle {
  stop: () => void;
}

interface IdentifyData {
  intents: number;
  properties: { browser: string; device: string; os: string };
  token: string;
}

interface ResumeData {
  seq: number | null;
  session_id: string;
  token: string;
}

type OutgoingData = IdentifyData | ResumeData | number | null;

type GatewayPayload = z.infer<typeof payloadSchema>;

const connectGateway = (
  token: string,
  events: GatewayEvents
): GatewayHandle => {
  let socket: WebSocket | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let sequence: number | null = null;
  let session: Session | null = null;
  let botUserId: string | null = null;
  let acknowledged = true;
  let stopped = false;
  let backoffMs = 1000;

  const send = (op: number, data: OutgoingData): void => {
    socket?.send(JSON.stringify({ d: data, op }));
  };

  const clearHeartbeat = (): void => {
    if (heartbeat !== null) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
  };

  const startHeartbeat = (intervalMs: number): void => {
    clearHeartbeat();
    acknowledged = true;

    // The first beat is jittered, as Discord asks, so many clients don't beat in step.
    setTimeout(
      () => send(OP.heartbeat, sequence),
      Math.floor(intervalMs * Math.random())
    );

    heartbeat = setInterval(() => {
      if (!acknowledged) {
        // A missed acknowledgement means a zombie connection: drop it and resume.
        socket?.close(4000, "Heartbeat not acknowledged");

        return;
      }

      acknowledged = false;
      send(OP.heartbeat, sequence);
    }, intervalMs);
  };

  const identify = (): void => {
    send(OP.identify, {
      intents: DIRECT_MESSAGES_INTENT,
      properties: {
        browser: "lifelink-bridge",
        device: "lifelink-bridge",
        os: process.platform,
      },
      token,
    });
  };

  const dispatch = (payload: GatewayPayload): void => {
    const { d: data, t: type } = payload;

    if (type === "READY") {
      const ready = readySchema.safeParse(data);

      if (ready.success) {
        session = {
          id: ready.data.session_id,
          resumeUrl: ready.data.resume_gateway_url,
        };
        botUserId = ready.data.user.id;
        backoffMs = 1000;
        events.onLog(
          `Connected to Discord as ${ready.data.user.username}. Waiting for direct messages.`
        );
      }

      return;
    }

    if (type === "RESUMED") {
      backoffMs = 1000;
      events.onLog("Resumed the Discord connection.");

      return;
    }

    if (type === "MESSAGE_CREATE") {
      const parsed = messageSchema.safeParse(data);

      const message = parsed.success
        ? directMessageOf(parsed.data, botUserId)
        : null;

      if (message !== null) {
        events.onDirectMessage(message);
      }
    }
  };

  const connect = (): void => {
    const url =
      session === null
        ? GATEWAY_URL
        : `${session.resumeUrl}/?v=10&encoding=json`;

    const current = new WebSocket(url);

    socket = current;

    current.addEventListener("message", (event) => {
      const parsed = payloadSchema.safeParse(JSON.parse(String(event.data)));

      if (!parsed.success) {
        return;
      }

      const payload = parsed.data;

      if (payload.s !== null && payload.s !== undefined) {
        sequence = payload.s;
      }

      switch (payload.op) {
        case OP.hello: {
          const hello = helloSchema.safeParse(payload.d);

          if (hello.success) {
            startHeartbeat(hello.data.heartbeat_interval);
          }

          if (session === null) {
            identify();
          } else {
            send(OP.resume, { seq: sequence, session_id: session.id, token });
          }

          break;
        }

        case OP.heartbeatAck: {
          acknowledged = true;
          break;
        }

        case OP.heartbeat: {
          send(OP.heartbeat, sequence);
          break;
        }

        case OP.reconnect: {
          current.close(4000, "Reconnect requested");
          break;
        }

        case OP.invalidSession: {
          // `d` says whether the session can be resumed; if not, start fresh.
          if (payload.d !== true) {
            session = null;
            sequence = null;
          }

          current.close(4000, "Invalid session");
          break;
        }

        case OP.dispatch: {
          dispatch(payload);
          break;
        }

        default: {
          break;
        }
      }
    });

    current.addEventListener("close", (event) => {
      clearHeartbeat();

      if (stopped) {
        return;
      }

      const fatal = FATAL_CLOSE_CODES.get(event.code);

      if (fatal !== undefined) {
        events.onFatal(fatal);

        return;
      }

      events.onLog(
        `Discord connection closed (${event.code}). Reconnecting in ${Math.round(backoffMs / 1000)}s.`
      );
      setTimeout(connect, backoffMs);
      backoffMs = Math.min(backoffMs * 2, 60_000);
    });
  };

  connect();

  return {
    stop: () => {
      stopped = true;
      clearHeartbeat();
      socket?.close(1000, "Stopping");
    },
  };
};

export { connectGateway, directMessageOf };
