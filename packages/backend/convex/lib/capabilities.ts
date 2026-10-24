import type { ActionDetails } from "@lifelink/contracts/actions";
import { findDeveloperIntegration } from "@lifelink/contracts/integrations";
import type { DeveloperIntegrationId } from "@lifelink/contracts/integrations";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { readEnv } from "./env";
import { readyImessageRoute } from "./imessage";
import { grantAllows } from "./permissions";

type ReaderCtx = MutationCtx | QueryCtx;

type Mode = "live" | "simulated";

const INSTACART_RETIRED_REASON =
  "Instacart shopping is no longer supported in LifeLink. You can still save, copy, or print your grocery lists.";

/** True when an available integration has every required variable set (defaults count). */
const developerConfigured = (id: DeveloperIntegrationId): boolean => {
  if (id === "instacart") {
    return false;
  }

  const integration = findDeveloperIntegration(id);

  if (integration === undefined) {
    return false;
  }

  return integration.envVars.every(
    (envVar) =>
      !envVar.required ||
      envVar.defaultValue !== undefined ||
      readEnv(envVar.name) !== null
  );
};

const activeConnection = async (
  ctx: ReaderCtx,
  ownerId: Id<"profiles">,
  connectionId: string
): Promise<Doc<"connections"> | null> => {
  const id = ctx.db.normalizeId("connections", connectionId);

  if (id === null) {
    return null;
  }

  const connection = await ctx.db.get(id);

  if (
    connection === null ||
    connection.ownerId !== ownerId ||
    connection.status !== "active"
  ) {
    return null;
  }

  return connection;
};

/** The person's connected mailbox used to send email messages (Gmail first). */
const activeMailbox = async (
  ctx: ReaderCtx,
  ownerId: Id<"profiles">
): Promise<Doc<"connections"> | null> => {
  if (!developerConfigured("composio")) {
    return null;
  }

  const connections = await ctx.db
    .query("connections")
    .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
    .collect();

  const active = connections.filter(
    (connection) =>
      connection.status === "active" &&
      (connection.provider === "gmail" || connection.provider === "outlook")
  );

  return (
    active.find((connection) => connection.provider === "gmail") ??
    active[0] ??
    null
  );
};

const contactProblems = async (
  ctx: ReaderCtx,
  owner: Doc<"profiles">,
  details: Extract<ActionDetails, { kind: "send_message" }>,
  mode: Mode
): Promise<string[]> => {
  const contactId = ctx.db.normalizeId("contacts", details.contactId);
  const contact = contactId === null ? null : await ctx.db.get(contactId);

  if (contact === null || contact.ownerId !== owner._id) {
    return ["The person you are writing to is no longer in your contacts."];
  }

  const channelMatches = contact.channels.some(
    (channel) =>
      channel.channel === details.channel &&
      channel.address.trim().toLowerCase() ===
        details.address.trim().toLowerCase()
  );

  if (details.channel !== "in_app" && !channelMatches) {
    return [
      `${contact.name}'s ${details.channel} address has changed. Please review the message again.`,
    ];
  }

  if (details.channel === "in_app" && contact.linkedProfileId === null) {
    return [
      `${contact.name} has not joined LifeLink yet, so an in-app message cannot reach them.`,
    ];
  }

  if (mode === "simulated" || details.channel === "in_app") {
    return [];
  }

  if (details.channel === "imessage" && !developerConfigured("photon")) {
    return [
      "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.",
    ];
  }

  if (details.channel === "discord" && !developerConfigured("discord")) {
    return ["Discord is not set up for this app yet."];
  }

  if (
    details.channel === "imessage" &&
    (await readyImessageRoute(
      ctx,
      owner._id,
      details.contactId,
      details.address
    )) === null
  ) {
    return [
      `Set up iMessage for ${contact.name} in Trusted circle, then ask them to text their assigned number first.`,
    ];
  }

  if (details.channel === "email") {
    const mailbox = await activeMailbox(ctx, owner._id);

    return mailbox === null
      ? ["Connect Gmail or Outlook on the Connections screen to send email."]
      : [];
  }

  return [];
};

/**
 * Everything that must still be true at the moment of approval and again at
 * the moment of execution. Returns plain-language problems; empty means OK.
 */
const executionProblems = async (
  ctx: ReaderCtx,
  owner: Doc<"profiles">,
  details: ActionDetails,
  mode: Mode
): Promise<string[]> => {
  // Old proposals, offline approvals, and queued work all pass through here.
  if (details.kind === "grocery_handoff") {
    return [INSTACART_RETIRED_REASON];
  }

  if (mode === "live" && owner.demoMode) {
    return [
      "Practice mode is on. Turn it off and review this again to do it for real.",
    ];
  }

  if (mode === "simulated" && !owner.demoMode) {
    return [
      "This was prepared in practice mode. Please prepare it again now that practice mode is off.",
    ];
  }

  switch (details.kind) {
    case "send_message": {
      return await contactProblems(ctx, owner, details, mode);
    }

    case "email_draft":
    case "calendar_event": {
      if (mode === "simulated") {
        return [];
      }

      if (!developerConfigured("composio")) {
        return [
          "Email and calendar connections are not set up for this app yet.",
        ];
      }

      const connection = await activeConnection(
        ctx,
        owner._id,
        details.connectionId
      );

      return connection === null
        ? [
            "That account is no longer connected. Reconnect it on the Connections screen.",
          ]
        : [];
    }

    case "family_update": {
      const now = Date.now();

      const grants = await Promise.all(
        details.granteeIds.map(async (granteeId) => {
          const id = ctx.db.normalizeId("sharingGrants", granteeId);

          return id === null ? null : await ctx.db.get(id);
        })
      );

      const allAllowed = grants.every(
        (grant) =>
          grant !== null &&
          grant.ownerId === owner._id &&
          grantAllows(grant, details.scope, now)
      );

      return allAllowed
        ? []
        : [
            "Sharing changed for someone on this update. Please review who will see it.",
          ];
    }

    case "confirm_arrangement":
    case "create_reminder": {
      return [];
    }

    default: {
      return details satisfies never;
    }
  }
};

export {
  activeConnection,
  activeMailbox,
  developerConfigured,
  executionProblems,
  INSTACART_RETIRED_REASON,
};

export type { Mode };
