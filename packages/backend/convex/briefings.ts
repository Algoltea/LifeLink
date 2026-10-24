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

    const waiting = await ctx.db
      .query("tasks")
      .withIndex("by_owner_status", (index) =>
        index.eq("ownerId", owner._id).eq("status", "awaiting_approval")
      )
      .collect();

    return {
      appointments: appointments.map((appointment) => ({
        day: formatDay(appointment.startsAt, owner.timeZone),
        ride: appointment.rideStatus,
        time: formatTime(appointment.startsAt, owner.timeZone),
        title: appointment.title,
      })),
      demoMode: owner.demoMode,
      name: owner.preferredName,
      reminders: reminders
        .filter((reminder) => reminder.dismissedAt === null)
        .map((reminder) => ({
          time: formatTime(reminder.remindAt, owner.timeZone),
          title: reminder.title,
        })),
      today: formatDay(now, owner.timeZone),
      waitingCount: waiting.length,
    };
  },
});

interface Facts {
  appointments: { day: string; ride: string; time: string; title: string }[];
  demoMode: boolean;
  name: string;
  reminders: { time: string; title: string }[];
  today: string;
  waitingCount: number;
}

const rulesBriefing = (input: Facts): Briefing => {
  const [next] = input.appointments;

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

  return { greetingFact, lines };
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
      lines: briefing.lines.slice(0, 5),
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
