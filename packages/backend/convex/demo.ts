/**
 * Demo mode: sample data and practice replies for demonstrations and testing.
 * Everything here is labelled simulated (or sample) and never reaches a real
 * provider. Demo mode is only ever turned on by an explicit choice.
 */
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { recordIncoming } from "./lib/incoming";
import { channelFor, firstName } from "./lib/journey";
import {
  DAY,
  HOUR,
  MINUTE,
  formatDay,
  formatTime,
  startOfLocalDay,
} from "./lib/time";

const TUESDAY = 2;
const MIN_DAYS_AHEAD = 3;

/** The next Tuesday at least three days out, 10:30 in the person's time zone. */
const nextTuesdayAt1030 = (now: number, timeZone: string): number => {
  const todayStart = startOfLocalDay(now, timeZone);
  const weekday = new Date(todayStart + 12 * HOUR).getUTCDay();
  let daysAhead = (TUESDAY - weekday + 7) % 7;

  if (daysAhead < MIN_DAYS_AHEAD) {
    daysAhead += 7;
  }

  return (
    startOfLocalDay(todayStart + daysAhead * DAY + 12 * HOUR, timeZone) +
    10 * HOUR +
    30 * MINUTE
  );
};

export const seed = internalMutation({
  args: { ownerId: v.id("profiles") },
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.ownerId);

    if (owner === null) {
      return;
    }

    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .filter((row) => row.eq(row.field("sample"), true))
      .first();

    if (existing !== null) {
      return;
    }

    const now = Date.now();

    const sample = (
      name: string,
      relationship: string,
      hue: number,
      channels: {
        address: string;
        channel: "discord" | "email" | "imessage" | "in_app";
        preferred: boolean;
      }[]
    ) => ({
      channels,
      createdAt: now,
      hue,
      linkedProfileId: null,
      name,
      ownerId: owner._id,
      relationship,
      sample: true,
      trusted: true,
    });

    await ctx.db.insert(
      "contacts",
      sample("Sam Rivera", "Son", 205, [
        { address: "+15555550142", channel: "imessage", preferred: true },
      ])
    );
    await ctx.db.insert(
      "contacts",
      sample("Linda Rivera", "Daughter", 330, [
        {
          address: "linda.rivera@example.com",
          channel: "email",
          preferred: true,
        },
      ])
    );
    await ctx.db.insert(
      "contacts",
      sample("Marcus Rivera", "Grandson", 95, [
        { address: "100000000000000001", channel: "discord", preferred: true },
      ])
    );

    const startsAt = nextTuesdayAt1030(now, owner.timeZone);
    const day = formatDay(startsAt, owner.timeZone);
    const time = formatTime(startsAt, owner.timeZone);

    const emailId = await ctx.db.insert("emails", {
      actionNeeded: null,
      bodyText: [
        `Dear ${owner.displayName},`,
        `This confirms your appointment with Dr. Anita Patel on ${day} at ${time}.`,
        "Location: Riverside Family Medicine, 2100 River Road, Suite 4.",
        "Please arrive 10 minutes early and bring your insurance card and a list of your medicines.",
        "To reschedule, call the front desk at (555) 010-0188.",
      ].join("\n\n"),
      connectionId: null,
      fromAddress: "appointments@riversidefm.example",
      fromName: "Riverside Family Medicine",
      mode: "simulated",
      ownerId: owner._id,
      provider: "gmail",
      providerMessageId: "sample-appointment",
      providerThreadId: null,
      receivedAt: now - 2 * HOUR,
      selectedForReview: false,
      subject: `Appointment confirmation: ${day} at ${time}`,
      summary: null,
      suspicious: null,
    });

    await ctx.db.insert("emails", {
      actionNeeded: null,
      bodyText: [
        "URGENT: Your Medicare benefits have been SUSPENDED due to unusual activity.",
        "To avoid losing coverage, verify your Medicare number and bank details within 24 hours.",
        "Call 1-888-555-0199 now or click here: http://medicare-verify.example/restore",
      ].join("\n\n"),
      connectionId: null,
      fromAddress: "benefits-alert@medicare-verify.example",
      fromName: "Medicare Benefits Team",
      mode: "simulated",
      ownerId: owner._id,
      provider: "gmail",
      providerMessageId: "sample-suspicious",
      providerThreadId: null,
      receivedAt: now - 5 * HOUR,
      selectedForReview: false,
      subject: "Action required: benefits suspended",
      summary: null,
      suspicious: null,
    });

    await ctx.db.insert("appointments", {
      createdAt: now,
      endsAt: startsAt + 45 * MINUTE,
      location: "Riverside Family Medicine",
      mode: "simulated",
      notes: "Bring your insurance card and a list of your medicines.",
      ownerId: owner._id,
      providerName: "Dr. Anita Patel",
      ridePickupAt: null,
      rideStatus: "none",
      rideWithContactId: null,
      sourceEmailId: emailId,
      startsAt,
      title: "Dr. Patel",
    });

    const listId = await ctx.db.insert("groceryLists", {
      budgetCents: 6000,
      items: [
        {
          checked: false,
          estimatedCents: 449,
          id: crypto.randomUUID(),
          name: "Whole milk",
          quantity: 1,
          unit: "gallon",
        },
        {
          checked: false,
          estimatedCents: 399,
          id: crypto.randomUUID(),
          name: "Whole wheat bread",
          quantity: 1,
          unit: "loaf",
        },
        {
          checked: false,
          estimatedCents: 329,
          id: crypto.randomUUID(),
          name: "Bananas",
          quantity: 6,
          unit: null,
        },
        {
          checked: false,
          estimatedCents: 599,
          id: crypto.randomUUID(),
          name: "Low-sodium chicken soup",
          quantity: 3,
          unit: "can",
        },
        {
          checked: false,
          estimatedCents: 549,
          id: crypto.randomUUID(),
          name: "Greek yogurt",
          quantity: 4,
          unit: "cup",
        },
      ],
      lastHandoff: null,
      name: "Weekly groceries",
      ownerId: owner._id,
      preferences: ["Low sodium", "Store brand is fine"],
      updatedAt: now,
    });

    await ctx.db.insert("spendingLimits", {
      category: "groceries",
      monthlyCents: 40_000,
      ownerId: owner._id,
      perOrderCents: 8000,
      updatedAt: now,
    });

    // Today's briefing may have been written before the sample data existed; let it be rewritten.
    const staleBriefings = await ctx.db
      .query("briefings")
      .withIndex("by_owner_date", (index) => index.eq("ownerId", owner._id))
      .collect();

    await Promise.all(
      staleBriefings.map(async (briefing) => await ctx.db.delete(briefing._id))
    );

    return listId;
  },
});

/** A practice reply from the contact, a few seconds after a simulated send. */
export const simulateReply = internalMutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args): Promise<Id<"messages"> | null> => {
    const task = await ctx.db.get(args.taskId);
    const owner = task === null ? null : await ctx.db.get(task.ownerId);

    if (
      task === null ||
      owner === null ||
      task.contactId === null ||
      task.mode !== "simulated" ||
      task.status !== "waiting_for_reply"
    ) {
      return null;
    }

    const contact = await ctx.db.get(task.contactId);

    const appointment =
      task.appointmentId === null ? null : await ctx.db.get(task.appointmentId);

    if (contact === null) {
      return null;
    }

    const pickup =
      appointment === null
        ? "a little early"
        : `at ${formatTime(appointment.startsAt - 45 * MINUTE, owner.timeZone)}`;

    const day =
      appointment === null
        ? ""
        : ` on ${formatDay(appointment.startsAt, owner.timeZone).split(",")[0] ?? ""}`;

    return await recordIncoming(ctx, {
      body: `Of course, ${owner.preferredName}! I'll pick you up ${pickup}${day}. ${firstName(contact.name)}`,
      channel: channelFor(contact)?.channel ?? "in_app",
      contactId: contact._id,
      mode: "simulated",
      ownerId: owner._id,
      photoIds: [],
      providerMessageId: `simulated-reply:${task._id}`,
    });
  },
});
