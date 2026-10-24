import { query } from "./_generated/server";
import { requireOwner } from "./lib/session";
import { DAY, dateKeyOf, startOfLocalDay } from "./lib/time";

const WAITING_STATUSES = new Set([
  "needs_clarification",
  "awaiting_approval",
  "needs_attention",
]);

/** Everything the Today screen shows, scoped to the signed-in owner. */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const now = Date.now();
    const todayStart = startOfLocalDay(now, owner.timeZone);
    const weekEnd = todayStart + 8 * DAY;

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_owner_start", (index) =>
        index
          .eq("ownerId", owner._id)
          .gte("startsAt", todayStart)
          .lte("startsAt", weekEnd)
      )
      .collect();

    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_owner_time", (index) =>
        index
          .eq("ownerId", owner._id)
          .gte("remindAt", todayStart - DAY)
          .lte("remindAt", weekEnd)
      )
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_owner_updated", (index) => index.eq("ownerId", owner._id))
      .order("desc")
      .take(40);

    const latestMessages = await ctx.db
      .query("messages")
      .withIndex("by_owner_created", (index) =>
        index.eq("ownerId", owner._id).gte("createdAt", now - 2 * DAY)
      )
      .order("desc")
      .take(60);

    const recentMessages = latestMessages
      .filter(
        (message) =>
          message.direction === "incoming" && message.createdAt > now - 2 * DAY
      )
      .slice(0, 5);

    const senders = await Promise.all(
      recentMessages.map(async (message) => await ctx.db.get(message.contactId))
    );

    const briefing = await ctx.db
      .query("briefings")
      .withIndex("by_owner_date", (index) =>
        index
          .eq("ownerId", owner._id)
          .eq("dateKey", dateKeyOf(now, owner.timeZone))
      )
      .order("desc")
      .first();

    // First-run steps: each is done once the owner has used that part of LifeLink.
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .take(20);

    const firstContact = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
      .first();

    const drivers = await Promise.all(
      appointments.map(async (appointment) =>
        appointment.rideWithContactId === null
          ? null
          : await ctx.db.get(appointment.rideWithContactId)
      )
    );

    return {
      appointments: appointments
        .map((appointment, index) => ({
          ...appointment,
          driverName: drivers[index]?.name ?? null,
        }))
        .toSorted((left, right) => left.startsAt - right.startsAt),
      briefing,
      demoMode: owner.demoMode,
      dueReminders: reminders.filter(
        (reminder) => reminder.firedAt !== null && reminder.dismissedAt === null
      ),
      gettingStarted: {
        asked: tasks.length > 0,
        connected: connections.some(
          (connection) => connection.status === "active"
        ),
        trusted: firstContact !== null,
      },
      messages: recentMessages.map((message, index) => ({
        body: message.body,
        channel: message.channel,
        contactHue: senders[index]?.hue ?? 0,
        contactId: message.contactId,
        contactName: senders[index]?.name ?? "Someone",
        createdAt: message.createdAt,
        id: message._id,
        mode: message.mode,
      })),
      preferredName: owner.preferredName,
      progressing: tasks.filter(
        (task) =>
          task.status === "in_progress" || task.status === "waiting_for_reply"
      ),
      timeZone: owner.timeZone,
      upcomingReminders: reminders
        .filter(
          (reminder) =>
            reminder.firedAt === null &&
            reminder.dismissedAt === null &&
            reminder.remindAt >= now
        )
        .toSorted((left, right) => left.remindAt - right.remindAt),
      waitingOnYou: tasks.filter((task) => WAITING_STATUSES.has(task.status)),
    };
  },
});
