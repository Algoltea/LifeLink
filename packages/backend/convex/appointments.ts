import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { audit } from "./lib/audit";
import { createTask } from "./lib/journey";
import { createAction } from "./lib/lifecycle";
import { requireOwned, requireOwner } from "./lib/session";
import { DAY, MINUTE } from "./lib/time";

export const upcoming = query({
  args: { days: v.number() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const now = Date.now();

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_owner_start", (index) =>
        index
          .eq("ownerId", owner._id)
          .gte("startsAt", now - 2 * 60 * MINUTE)
          .lte("startsAt", now + Math.min(60, args.days) * DAY)
      )
      .collect();

    return await Promise.all(
      appointments.map(async (appointment) => {
        const driver =
          appointment.rideWithContactId === null
            ? null
            : await ctx.db.get(appointment.rideWithContactId);

        return { ...appointment, driverName: driver?.name ?? null };
      })
    );
  },
});

export const create = mutation({
  args: {
    location: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
    startsAt: v.number(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const title = args.title.trim();

    if (title.length === 0) {
      throw new ConvexError({
        code: "invalid",
        message: "What is the appointment for?",
      });
    }

    if (args.startsAt < Date.now()) {
      throw new ConvexError({
        code: "invalid",
        message: "Please choose a time that has not passed yet.",
      });
    }

    const id = await ctx.db.insert("appointments", {
      createdAt: Date.now(),
      endsAt: args.startsAt + 60 * MINUTE,
      location: args.location?.trim() || null,
      mode: owner.demoMode ? "simulated" : "live",
      notes: args.notes?.trim() || null,
      ownerId: owner._id,
      providerName: null,
      ridePickupAt: null,
      rideStatus: "none",
      rideWithContactId: null,
      sourceEmailId: null,
      startsAt: args.startsAt,
      title,
    });

    await audit(ctx, {
      actor: "person",
      detail: `Added ${title}.`,
      event: "appointment.created",
      ownerId: owner._id,
    });

    return id;
  },
});

export const remove = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const appointment = requireOwned(
      await ctx.db.get(args.appointmentId),
      owner,
      "appointment"
    );

    await ctx.db.delete(appointment._id);
  },
});

/** Propose adding the appointment to a connected calendar. Reviewed and approved like anything else. */
export const proposeCalendarEvent = mutation({
  args: {
    appointmentId: v.id("appointments"),
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);

    const appointment = requireOwned(
      await ctx.db.get(args.appointmentId),
      owner,
      "appointment"
    );

    const connection = requireOwned(
      await ctx.db.get(args.connectionId),
      owner,
      "connection"
    );

    if (
      connection.provider !== "google_calendar" &&
      connection.provider !== "outlook"
    ) {
      throw new ConvexError({
        code: "invalid",
        message: "Choose a calendar connection.",
      });
    }

    const mode = owner.demoMode ? "simulated" : "live";

    const { stepIds, taskId } = await createTask(ctx, {
      appointmentId: appointment._id,
      contactId: null,
      kind: "calendar_event",
      mode,
      origin: "text",
      ownerId: owner._id,
      request: "Add to calendar",
      steps: [{ kind: "calendar_event", label: "Add to your calendar" }],
      title: `Add ${appointment.title} to your calendar`,
    });

    await createAction(ctx, {
      ambiguities: [],
      details: {
        connectionId: connection._id,
        endsAt: appointment.endsAt ?? appointment.startsAt + 60 * MINUTE,
        kind: "calendar_event",
        location: appointment.location,
        provider:
          connection.provider === "outlook" ? "outlook" : "google_calendar",
        startsAt: appointment.startsAt,
        title: appointment.title,
      },
      mode,
      ownerId: owner._id,
      proposedBy: "person",
      rationale: null,
      stepId: stepIds[0] ?? null,
      taskId,
    });

    return taskId;
  },
});
