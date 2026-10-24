/**
 * LifeLink Discord bridge. Discord delivers direct messages only over its
 * Gateway (a long-lived WebSocket), which Convex functions can't hold, so this
 * small process holds it and forwards each message to the backend.
 *
 * `bun run dev` starts it with everything else. Without the three settings
 * below it says so and exits, so a fresh checkout still starts cleanly.
 */
import { forwardMessage } from "./forward";
import type { BridgeConfig, BridgeMessage } from "./forward";
import { connectGateway } from "./gateway";

const setting = (name: string): string | null => {
  const value = process.env[name]?.trim();

  return value || null;
};

const log = (line: string): void => {
  process.stdout.write(`[discord-bridge] ${line}\n`);
};

const token = setting("DISCORD_BOT_TOKEN");
const secret = setting("BRIDGE_SHARED_SECRET");
const convexSiteUrl = setting("CONVEX_SITE_URL");

if (token === null || secret === null || convexSiteUrl === null) {
  log(
    "Not configured, so not started. Discord replies are optional; run `bun run dev:setup` to add them."
  );
  process.exit(0);
}

const config: BridgeConfig = { convexSiteUrl, secret };

const deliver = async (message: BridgeMessage): Promise<void> => {
  try {
    const result = await forwardMessage(config, message);

    if (result.kind === "dropped") {
      log(
        `A direct message could not be delivered to LifeLink: ${result.reason}.`
      );
    }
  } catch {
    log("A direct message could not be delivered to LifeLink.");
  }
};

const gateway = connectGateway(token, {
  onDirectMessage: (message) => {
    void deliver(message);
  },
  onFatal: (reason) => {
    log(reason);
    process.exit(1);
  },
  onLog: log,
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    gateway.stop();
    process.exit(0);
  });
}
