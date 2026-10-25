/**
 * Demo mode: sample data and practice replies for demonstrations and testing.
 * Everything here is labelled simulated (or sample) and never reaches a real
 * provider. Demo mode is only ever turned on by an explicit choice.
 */
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { recordIncoming } from "./lib/incoming";
import { channelFor, firstName } from "./lib/journey";
import { addFullerDay } from "./lib/sampleday";
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

/** A long practice list, for trying the grocery screens with a big shop. */
const LONG_LIST_NAME = "Monthly stock-up (practice)";

/** Name, quantity, unit, and estimate in cents. */
const LONG_LIST_ITEMS: [string, number, string | null, number][] = [
  ["Bananas", 6, null, 329],
  ["Gala apples", 3, "lb", 447],
  ["Navel oranges", 4, null, 396],
  ["Strawberries", 1, "container", 399],
  ["Blueberries", 1, "pint", 449],
  ["Red grapes", 2, "lb", 398],
  ["Lemons", 3, null, 207],
  ["Avocados", 2, null, 298],
  ["Baby spinach", 1, "bag", 349],
  ["Romaine lettuce", 1, "head", 229],
  ["Carrots", 2, "lb", 198],
  ["Celery", 1, "bunch", 199],
  ["Broccoli crowns", 1, "lb", 249],
  ["Yellow onions", 3, "lb", 349],
  ["Garlic", 1, "head", 79],
  ["Russet potatoes", 5, "lb", 499],
  ["Sweet potatoes", 2, "lb", 298],
  ["Cherry tomatoes", 1, "container", 349],
  ["Cucumbers", 2, null, 198],
  ["Green beans", 1, "lb", 299],
  ["Mushrooms", 1, "container", 279],
  ["Red bell peppers", 2, null, 358],
  ["Zucchini", 2, null, 238],
  ["Fresh parsley", 1, "bunch", 129],
  ["Whole milk", 1, "gallon", 449],
  ["Large eggs", 1, "dozen", 399],
  ["Greek yogurt", 4, "cup", 549],
  ["Cheddar cheese", 8, "oz", 399],
  ["Butter", 4, "stick", 529],
  ["Cottage cheese", 1, "tub", 379],
  ["Sour cream", 1, "tub", 229],
  ["Shredded mozzarella", 8, "oz", 349],
  ["Half and half", 1, "pint", 249],
  ["Orange juice", 1, "carton", 429],
  ["Chicken breasts", 2, "lb", 798],
  ["Ground turkey", 1, "lb", 599],
  ["Salmon fillets", 1, "lb", 1199],
  ["Pork chops", 2, "lb", 798],
  ["Sliced turkey", 8, "oz", 549],
  ["Bacon", 1, "pack", 649],
  ["Canned tuna", 4, "can", 476],
  ["Whole wheat bread", 1, "loaf", 399],
  ["English muffins", 1, "pack", 349],
  ["Bagels", 1, "bag", 399],
  ["Dinner rolls", 1, "bag", 329],
  ["Rolled oats", 1, "container", 449],
  ["Bran flakes cereal", 1, "box", 429],
  ["Brown rice", 2, "lb", 329],
  ["Spaghetti", 1, "box", 179],
  ["Marinara sauce", 1, "jar", 349],
  ["Low-sodium chicken soup", 3, "can", 599],
  ["Low-sodium chicken broth", 2, "carton", 498],
  ["Black beans", 2, "can", 238],
  ["Diced tomatoes", 2, "can", 258],
  ["Peanut butter", 1, "jar", 399],
  ["Strawberry jam", 1, "jar", 349],
  ["Honey", 1, "bottle", 599],
  ["Olive oil", 1, "bottle", 899],
  ["All-purpose flour", 5, "lb", 399],
  ["Sugar", 4, "lb", 379],
  ["Coffee", 1, "bag", 899],
  ["Black tea", 1, "box", 399],
  ["Saltine crackers", 1, "box", 349],
  ["Raisins", 1, "box", 299],
  ["Unsalted almonds", 1, "bag", 699],
  ["Applesauce cups", 1, "pack", 349],
  ["Frozen peas", 1, "bag", 199],
  ["Frozen mixed vegetables", 2, "bag", 398],
  ["Frozen blueberries", 1, "bag", 449],
  ["Vanilla ice cream", 1, "carton", 549],
  ["Frozen fish sticks", 1, "box", 599],
  ["Paper towels", 1, "pack", 999],
  ["Toilet paper", 1, "pack", 1299],
  ["Dish soap", 1, "bottle", 349],
  ["Laundry detergent", 1, "bottle", 1199],
  ["Trash bags", 1, "box", 899],
  ["Aluminum foil", 1, "roll", 549],
  ["Hand soap", 1, "bottle", 299],
  ["Toothpaste", 1, "tube", 399],
  ["Tissues", 2, "box", 398],
  ["Vitamin D", 1, "bottle", 899],
];

/**
 * Added on its own so accounts that already have sample data also get it the
 * next time practice mode is turned on.
 */
const addLongList = async (ctx: MutationCtx, ownerId: Id<"profiles">) => {
  const existing = await ctx.db
    .query("groceryLists")
    .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
    .filter((row) => row.eq(row.field("name"), LONG_LIST_NAME))
    .first();

  if (existing !== null) {
    return;
  }

  await ctx.db.insert("groceryLists", {
    budgetCents: 40_000,
    items: LONG_LIST_ITEMS.map(([name, quantity, unit, estimatedCents]) => ({
      checked: false,
      estimatedCents,
      id: crypto.randomUUID(),
      name,
      quantity,
      unit,
    })),
    lastHandoff: null,
    name: LONG_LIST_NAME,
    ownerId,
    preferences: ["Store brand is fine", "Low sodium where possible"],
    updatedAt: Date.now(),
  });
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
      await addLongList(ctx, owner._id);
      await addFullerDay(ctx, owner);

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
      }[],
      trusted = true
    ) => ({
      channels,
      createdAt: now,
      hue,
      linkedProfileId: null,
      name,
      ownerId: owner._id,
      relationship,
      sample: true,
      trusted,
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
    // A saved contact outside the trusted circle, so practice shows the difference.
    await ctx.db.insert(
      "contacts",
      sample(
        "Dana Whitfield",
        "Neighbor",
        40,
        [
          {
            address: "dana.whitfield@example.com",
            channel: "email",
            preferred: true,
          },
        ],
        false
      )
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

    await addLongList(ctx, owner._id);
    await addFullerDay(ctx, owner);

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
