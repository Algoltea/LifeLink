import { helpStyleOf, languageName } from "@lifelink/contracts/help-style";
import type {
  ExplanationDetail,
  SupportLanguage,
} from "@lifelink/contracts/help-style";
import { interfaceLocaleOf, intlLocaleOf } from "@lifelink/contracts/locale";
import { briefingSchema } from "@lifelink/contracts/model-output";
import type { Briefing } from "@lifelink/contracts/model-output";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import {
  openRouterConfigured,
  structuredCompletion,
} from "./integrations/openrouter";
import { requireOwner } from "./lib/session";
import {
  DAY,
  dateKeyOf,
  formatDay,
  formatTime,
  startOfLocalDay,
} from "./lib/time";

/** Ask for today's briefing; generated once per day and cached. */
export const ensureToday = mutation({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const dateKey = dateKeyOf(Date.now(), owner.timeZone);

    const existing = await ctx.db
      .query("briefings")
      .withIndex("by_owner_date", (index) =>
        index.eq("ownerId", owner._id).eq("dateKey", dateKey)
      )
      .first();

    if (existing === null) {
      await ctx.scheduler.runAfter(0, internal.briefings.generate, {
        dateKey,
        ownerId: owner._id,
      });
    }
  },
});

/** Facts only: the model rephrases these and may not add anything. */
export const facts = internalQuery({
  args: { ownerId: v.id("profiles") },
  handler: async (ctx, args): Promise<Facts | null> => {
    const owner = await ctx.db.get(args.ownerId);

    if (owner === null) {
      return null;
    }

    const now = Date.now();
    const todayStart = startOfLocalDay(now, owner.timeZone);

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_owner_start", (index) =>
        index
          .eq("ownerId", owner._id)
          .gte("startsAt", now)
          .lte("startsAt", todayStart + 8 * DAY)
      )
      .collect();

    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_owner_time", (index) =>
        index
          .eq("ownerId", owner._id)
          .gte("remindAt", now)
          .lte("remindAt", todayStart + DAY)
      )
      .collect();

    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_profile", (index) => index.eq("profileId", owner._id))
      .unique();

    const waiting = await ctx.db
      .query("tasks")
      .withIndex("by_owner_status", (index) =>
        index.eq("ownerId", owner._id).eq("status", "awaiting_approval")
      )
      .collect();

    const style = helpStyleOf(preferences);
    const intl = intlLocaleOf(interfaceLocaleOf(style.language));

    return {
      appointments: appointments.map((appointment) => ({
        day: formatDay(appointment.startsAt, owner.timeZone, intl),
        ride: appointment.rideStatus,
        time: formatTime(appointment.startsAt, owner.timeZone, intl),
        title: appointment.title,
      })),
      demoMode: owner.demoMode,
      detail: style.detail,
      language: style.language,
      name: owner.preferredName,
      reminders: reminders
        .filter((reminder) => reminder.dismissedAt === null)
        .map((reminder) => ({
          time: formatTime(reminder.remindAt, owner.timeZone, intl),
          title: reminder.title,
        })),
      today: formatDay(now, owner.timeZone, intl),
      waitingCount: waiting.length,
    };
  },
});

interface Facts {
  appointments: { day: string; ride: string; time: string; title: string }[];
  demoMode: boolean;
  detail: ExplanationDetail;
  language: SupportLanguage;
  name: string;
  reminders: { time: string; title: string }[];
  today: string;
  waitingCount: number;
}

/** Short help keeps the briefing to the few things that matter most today. */
const maxLines = (detail: ExplanationDetail): number =>
  detail === "short" ? 3 : 5;

const rulesBriefing = (input: Facts): Briefing => {
  const [next] = input.appointments;

  if (input.language === "es") {
    const lines: string[] = [];

    if (next?.ride === "none") {
      lines.push("Aún no tienes transporte para esa cita.");
    }

    if (next?.ride === "confirmed") {
      lines.push("Tu transporte está confirmado.");
    }

    for (const reminder of input.reminders.slice(0, 2)) {
      lines.push(`Recordatorio a las ${reminder.time}: ${reminder.title}.`);
    }

    if (input.waitingCount > 0) {
      lines.push(
        `${input.waitingCount} ${input.waitingCount === 1 ? "cosa espera" : "cosas esperan"} tu aprobación.`
      );
    }

    return {
      greetingFact:
        next === undefined
          ? "No hay nada programado para los próximos días."
          : `${next.title} es el ${next.day} a las ${next.time}.`,
      lines: lines.slice(0, maxLines(input.detail)),
    };
  }

  const greetingFact =
    next === undefined
      ? "Nothing is booked for the next few days."
      : `${next.title} is on ${next.day} at ${next.time}.`;

  const lines: string[] = [];

  if (next !== undefined && next.ride === "none") {
    lines.push("You don't have a ride arranged for it yet.");
  }

  if (next !== undefined && next.ride === "confirmed") {
    lines.push("Your ride is confirmed.");
  }

  for (const reminder of input.reminders.slice(0, 2)) {
    lines.push(`Reminder at ${reminder.time}: ${reminder.title}.`);
  }

  if (input.waitingCount > 0) {
    lines.push(
      `${input.waitingCount} ${input.waitingCount === 1 ? "thing is" : "things are"} waiting for your approval.`
    );
  }

  return { greetingFact, lines: lines.slice(0, maxLines(input.detail)) };
};

export const generate = internalAction({
  args: { dateKey: v.string(), ownerId: v.id("profiles") },
  handler: async (ctx, args): Promise<void> => {
    const input = await ctx.runQuery(internal.briefings.facts, {
      ownerId: args.ownerId,
    });

    if (input === null) {
      return;
    }

    let briefing = rulesBriefing(input);
    let source: "model" | "rules" = "rules";

    if (openRouterConfigured()) {
      const result = await structuredCompletion({
        messages: [
          {
            content: [
              `Write ${input.name}'s short morning briefing for ${input.today}. Return only JSON.`,
              "Use only the facts given. Do not add or guess anything. Short, warm, plain sentences. No emoji.",
              `Write your own words in ${languageName(input.language)}. Keep names and quoted text unchanged.`,
              input.detail === "short"
                ? "Keep it brief: at most three lines after the greeting fact."
                : "You may use up to five lines after the greeting fact.",
            ].join("\n"),
            role: "system",
          },
          { content: JSON.stringify(input), role: "user" },
        ],
        schema: briefingSchema,
        schemaName: "briefing",
        tier: "fast",
      });

      if (result.ok) {
        briefing = result.value;
        source = "model";
      }
    }

    await ctx.runMutation(internal.briefings.save, {
      dateKey: args.dateKey,
      greetingFact: briefing.greetingFact,
      lines: briefing.lines.slice(0, maxLines(input.detail)),
      mode: input.demoMode ? "simulated" : "live",
      ownerId: args.ownerId,
      source,
    });
  },
});

export const save = internalMutation({
  args: {
    dateKey: v.string(),
    greetingFact: v.string(),
    lines: v.array(v.string()),
    mode: v.union(v.literal("live"), v.literal("simulated")),
    ownerId: v.id("profiles"),
    source: v.union(v.literal("model"), v.literal("rules")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("briefings", { ...args, generatedAt: Date.now() });
  },
});
