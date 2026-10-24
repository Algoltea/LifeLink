/**
 * "Help me understand this" for a received message or an email. The result is
 * private guidance for the owner: no family query reads this table, nothing
 * here sends or shares anything, and a suggested reply only fills the
 * person's own message box, where the usual review and approval apply.
 *
 * A cloud reading needs the person's explicit permission each time, never
 * runs on Practice data, and is checked word for word against the message.
 */
import {
  checkExplanation,
  localExplanation,
} from "@lifelink/contracts/explanation";
import type { CheckedExplanation } from "@lifelink/contracts/explanation";
import {
  draftRequest,
  guidanceRequest,
} from "@lifelink/contracts/explanation-prompts";
import {
  helpStyleKey,
  helpStyleOf,
  isSupportLanguage,
} from "@lifelink/contracts/help-style";
import type { HelpStyle } from "@lifelink/contracts/help-style";
import {
  explanationGuidanceSchema,
  suggestedRepliesSchema,
} from "@lifelink/contracts/model-output";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { decodeJson } from "./integrations/http";
import {
  openRouterConfigured,
  structuredCompletion,
} from "./integrations/openrouter";
import { signOff } from "./lib/journey";
import { requireOwned, requireOwner } from "./lib/session";
import { isoWithOffset } from "./lib/time";
import { reserveCloudUse } from "./lib/usage";

const MAX_SOURCE = 8000;

type Explanation = Doc<"messageExplanations">;

interface Source {
  emailId: Id<"emails"> | null;
  messageId: Id<"messages"> | null;
  mode: Explanation["mode"];
  senderName: string;
  text: string;
}

const sourceArgs = {
  emailId: v.optional(v.id("emails")),
  messageId: v.optional(v.id("messages")),
};

/** The owner's own received message or email, as text. */
const loadSource = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">,
  args: { emailId?: Id<"emails">; messageId?: Id<"messages"> }
): Promise<Source> => {
  const chooseOne = new ConvexError({
    code: "invalid",
    message: "Choose one message or email to explain.",
  });

  if (args.messageId !== undefined && args.emailId !== undefined) {
    throw chooseOne;
  }

  if (args.messageId !== undefined) {
    const message = requireOwned(
      await ctx.db.get(args.messageId),
      owner,
      "message"
    );

    if (message.direction !== "incoming") {
      throw new ConvexError({
        code: "invalid",
        message: "Only messages you received can be explained.",
      });
    }

    const contact = await ctx.db.get(message.contactId);

    return {
      emailId: null,
      messageId: message._id,
      mode: message.mode,
      senderName: contact?.name ?? "this person",
      text: message.body.slice(0, MAX_SOURCE),
    };
  }

  if (args.emailId === undefined) {
    throw chooseOne;
  }

  const email = requireOwned(await ctx.db.get(args.emailId), owner, "email");

  return {
    emailId: email._id,
    messageId: null,
    mode: email.mode,
    senderName: email.fromName ?? email.fromAddress,
    text: `Subject: ${email.subject}\n\n${email.bodyText}`.slice(0, MAX_SOURCE),
  };
};

const latestFor = async (
  ctx: QueryCtx,
  ownerId: Id<"profiles">,
  source: { emailId: Id<"emails"> | null; messageId: Id<"messages"> | null }
): Promise<Explanation | null> =>
  source.messageId === null
    ? await ctx.db
        .query("messageExplanations")
        .withIndex("by_owner_and_email", (index) =>
          index.eq("ownerId", ownerId).eq("emailId", source.emailId)
        )
        .order("desc")
        .first()
    : await ctx.db
        .query("messageExplanations")
        .withIndex("by_owner_and_message", (index) =>
          index.eq("ownerId", ownerId).eq("messageId", source.messageId)
        )
        .order("desc")
        .first();

const contentOf = (explanation: CheckedExplanation) => ({
  dates: explanation.dates,
  droppedCount: explanation.droppedCount,
  interpretations: explanation.interpretations,
  missingDetails: explanation.missingDetails,
  plainSummary: explanation.plainSummary,
  requests: explanation.requests,
  statedFacts: explanation.statedFacts,
  suggestedReplies: explanation.suggestedReplies,
});

const helpStyleFor = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">
): Promise<HelpStyle> =>
  helpStyleOf(
    await ctx.db
      .query("preferences")
      .withIndex("by_profile", (index) => index.eq("profileId", owner._id))
      .unique()
  );

/** The help style saved with an explanation, so a scheduled run uses what the person had when they asked. */
const savedStyle = (explanation: Explanation): HelpStyle => {
  const saved = explanation.helpStyle;

  if (saved === undefined) {
    return helpStyleOf(null);
  }

  return {
    detail: saved.detail,
    language: isSupportLanguage(saved.language) ? saved.language : "en",
    notes: saved.notes,
    stepByStep: saved.stepByStep,
  };
};

const localFor = (
  owner: Doc<"profiles">,
  source: Pick<Source, "senderName" | "text">
) =>
  contentOf(
    localExplanation(source.text, {
      senderName: source.senderName,
      signOff: signOff(owner),
    })
  );

/** Explain a received message or email. Returns the explanation to watch. */
export const request = mutation({
  args: { ...sourceArgs, allowCloudAnalysis: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<Id<"messageExplanations">> => {
    const owner = await requireOwner(ctx);
    const source = await loadSource(ctx, owner, args);
    const wantsCloud = args.allowCloudAnalysis === true;
    const latest = await latestFor(ctx, owner._id, source);
    const helpStyle = await helpStyleFor(ctx, owner);
    const styleKey = helpStyleKey(helpStyle);

    // Message text never changes, so an earlier reading still applies unless the
    // person now asks for more, or a cloud reading was written for other preferences.
    const stillFits =
      latest !== null &&
      latest.status !== "failed" &&
      (latest.method === "local"
        ? !wantsCloud
        : latest.helpStyleKey === undefined ||
          latest.helpStyleKey === styleKey);

    if (latest !== null && stillFits) {
      return latest._id;
    }

    const practice = owner.demoMode || source.mode === "simulated";
    let localReason: Explanation["localReason"] = null;

    if (!wantsCloud) {
      localReason = "chosen";
    } else if (practice) {
      localReason = "practice";
    } else if (!openRouterConfigured()) {
      localReason = "unavailable";
    } else if (!(await reserveCloudUse(ctx, owner._id, "explanation"))) {
      localReason = "limit";
    }

    const local = localFor(owner, source);
    const useCloud = localReason === null;

    const explanationId = await ctx.db.insert("messageExplanations", {
      ...local,
      cloudRequested: wantsCloud && !practice,
      createdAt: Date.now(),
      emailId: source.emailId,
      helpStyle,
      helpStyleKey: styleKey,
      localReason,
      messageId: source.messageId,
      method: useCloud ? "cloud" : "local",
      mode: practice ? "simulated" : "live",
      model: useCloud ? "" : "local",
      ownerId: owner._id,
      senderName: source.senderName,
      sourceText: source.text,
      status: useCloud ? "explaining" : "done",
    });

    if (useCloud) {
      await ctx.scheduler.runAfter(0, internal.explanations.run, {
        explanationId,
      });
    }

    return explanationId;
  },
});

/** The latest explanation of one message or email, for its owner only. */
export const forSource = query({
  args: sourceArgs,
  handler: async (ctx, args): Promise<Explanation | null> => {
    const owner = await requireOwner(ctx);
    const source = await loadSource(ctx, owner, args);

    return await latestFor(ctx, owner._id, source);
  },
});

/**
 * The two model requests for one explanation. Guidance for the owner may use
 * their help style, including private notes; reply drafts are built from the
 * message alone and never see the notes, the language choice, or the guidance.
 */
export const runInput = internalQuery({
  args: { explanationId: v.id("messageExplanations") },
  handler: async (ctx, args) => {
    const explanation = await ctx.db.get(args.explanationId);

    const owner =
      explanation === null ? null : await ctx.db.get(explanation.ownerId);

    if (explanation === null || owner === null) {
      return null;
    }

    return {
      drafts: draftRequest({
        name: owner.preferredName,
        senderName: explanation.senderName,
        signOff: signOff(owner),
        sourceText: explanation.sourceText,
      }),
      guidance: guidanceRequest({
        helpStyle: savedStyle(explanation),
        name: owner.preferredName,
        now: isoWithOffset(Date.now(), owner.timeZone),
        senderName: explanation.senderName,
        sourceText: explanation.sourceText,
        timeZone: owner.timeZone,
      }),
      status: explanation.status,
    };
  },
});

export const run = internalAction({
  args: { explanationId: v.id("messageExplanations") },
  handler: async (ctx, args): Promise<void> => {
    const input = await ctx.runQuery(internal.explanations.runInput, args);

    if (input === null || input.status !== "explaining") {
      return;
    }

    // Separate calls, so private notes in the guidance request can never shape a reply.
    const [guidance, drafts] = await Promise.all([
      structuredCompletion({
        messages: input.guidance,
        schema: explanationGuidanceSchema,
        schemaName: "message_guidance",
        tier: "fast",
      }),
      structuredCompletion({
        messages: input.drafts,
        schema: suggestedRepliesSchema,
        schemaName: "reply_suggestions",
        tier: "fast",
      }),
    ]);

    await ctx.runMutation(internal.explanations.finish, {
      draftsJson: drafts.ok ? JSON.stringify(drafts.value) : null,
      explanationId: args.explanationId,
      guidanceJson: guidance.ok ? JSON.stringify(guidance.value) : null,
      model: guidance.ok ? guidance.model : null,
    });
  },
});

const finishLocally = async (
  ctx: MutationCtx,
  explanation: Explanation
): Promise<void> => {
  await ctx.db.patch(explanation._id, {
    localReason: "failed",
    method: "local",
    model: "local",
    status: "done",
  });
};

/**
 * Hold the model to the message it read. Without guidance, keep the local
 * reading and say so; without drafts, keep the local suggestions.
 */
export const finish = internalMutation({
  args: {
    draftsJson: v.union(v.string(), v.null()),
    explanationId: v.id("messageExplanations"),
    guidanceJson: v.union(v.string(), v.null()),
    model: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const explanation = await ctx.db.get(args.explanationId);

    if (explanation === null || explanation.status !== "explaining") {
      return;
    }

    const guidance =
      args.guidanceJson === null
        ? null
        : decodeJson(explanationGuidanceSchema, args.guidanceJson);

    if (guidance === null || args.model === null) {
      await finishLocally(ctx, explanation);

      return;
    }

    const drafts =
      args.draftsJson === null
        ? null
        : decodeJson(suggestedRepliesSchema, args.draftsJson);

    const checked = checkExplanation(
      {
        ...guidance,
        suggestedReplies:
          drafts?.suggestedReplies ?? explanation.suggestedReplies,
      },
      explanation.sourceText
    );

    await ctx.db.patch(explanation._id, {
      ...contentOf(checked),
      model: args.model,
      status: "done",
    });
  },
});
