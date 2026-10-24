/**
 * The permission-scoped family view. Every section is checked against the
 * viewer's live grant on each read, so revoking a scope removes access at once.
 * Scam alerts reveal only that a check happened and its verdict, never the
 * message itself.
 */
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { grantAllows, grantIsLive } from "./lib/permissions";
import { requireProfile } from "./lib/session";
import { DAY } from "./lib/time";

type Scope = Doc<"sharingGrants">["scopes"][number];

interface Section {
  allows: (scope: Scope) => boolean;
  ctx: QueryCtx;
  now: number;
  ownerId: Id<"profiles">;
}

const appointmentsSection = async (section: Section) => {
  const rows = await section.ctx.db
    .query("appointments")
    .withIndex("by_owner_start", (index) =>
      index
        .eq("ownerId", section.ownerId)
        .gte("startsAt", section.now - DAY)
        .lte("startsAt", section.now + 30 * DAY)
    )
    .collect();

  const showRides = section.allows("rides.view");

  return rows.map((appointment) => ({
    id: appointment._id,
    location: appointment.location,
    mode: appointment.mode,
    rideStatus: showRides ? appointment.rideStatus : null,
    startsAt: appointment.startsAt,
    title: appointment.title,
  }));
};

const remindersSection = async (section: Section) => {
  const rows = await section.ctx.db
    .query("reminders")
    .withIndex("by_owner_time", (index) =>
      index.eq("ownerId", section.ownerId).gte("remindAt", section.now - DAY)
    )
    .take(20);

  return rows.flatMap((reminder) =>
    reminder.shareWithCircle && reminder.dismissedAt === null
      ? [
          {
            id: reminder._id,
            mode: reminder.mode,
            remindAt: reminder.remindAt,
            title: reminder.title,
          },
        ]
      : []
  );
};

const updatesSection = async (
  section: Section,
  liveGrantIds: Set<Id<"sharingGrants">>
) => {
  const rows = await section.ctx.db
    .query("familyUpdates")
    .withIndex("by_owner_created", (index) =>
      index.eq("ownerId", section.ownerId)
    )
    .order("desc")
    .take(20);

  return rows.flatMap((update) => {
    const visible =
      section.allows(update.scope) &&
      update.granteeIds.some((granteeId) => liveGrantIds.has(granteeId));

    return visible
      ? [
          {
            createdAt: update.createdAt,
            id: update._id,
            mode: update.mode,
            text: update.text,
          },
        ]
      : [];
  });
};

const scamAlertsSection = async (section: Section) => {
  const rows = await section.ctx.db
    .query("scamReviews")
    .withIndex("by_owner_created", (index) =>
      index.eq("ownerId", section.ownerId)
    )
    .order("desc")
    .take(10);

  return rows.flatMap((review) => {
    const flagged =
      review.status === "done" &&
      (review.verdict === "likely_scam" || review.verdict === "suspicious");

    return flagged
      ? [
          {
            createdAt: review.createdAt,
            id: review._id,
            kind: review.inputKind,
            mode: review.mode,
            verdict: review.verdict,
          },
        ]
      : [];
  });
};

const groceriesSection = async (section: Section) => {
  const rows = await section.ctx.db
    .query("groceryLists")
    .withIndex("by_owner", (index) => index.eq("ownerId", section.ownerId))
    .collect();

  // The circle sees current lists only; finished trips stay with the person.
  return rows.flatMap((list) =>
    list.archivedAt === undefined
      ? [
          {
            budgetCents: list.budgetCents,
            id: list._id,
            items: list.items.flatMap((item) =>
              item.checked ? [] : [item.name]
            ),
            name: list.name,
          },
        ]
      : []
  );
};

const photosSection = async (section: Section) => {
  const rows = await section.ctx.db
    .query("photos")
    .withIndex("by_owner", (index) => index.eq("ownerId", section.ownerId))
    .order("desc")
    .take(24);

  return rows.flatMap((photo) =>
    photo.sharedWithCircle
      ? [{ caption: photo.caption, createdAt: photo.createdAt, id: photo._id }]
      : []
  );
};

export const overview = query({
  args: { ownerId: v.id("profiles") },
  handler: async (ctx, args) => {
    const viewer = await requireProfile(ctx);
    const owner = await ctx.db.get(args.ownerId);

    if (owner === null || owner._id === viewer._id) {
      return null;
    }

    const now = Date.now();

    const viewerGrants = await ctx.db
      .query("sharingGrants")
      .withIndex("by_grantee", (index) =>
        index.eq("granteeProfileId", viewer._id)
      )
      .collect();

    const grants = viewerGrants.filter((grant) => grant.ownerId === owner._id);
    const liveGrants = grants.filter((grant) => grantIsLive(grant, now));

    if (liveGrants.length === 0) {
      return null;
    }

    const liveGrantIds = new Set(liveGrants.map((grant) => grant._id));
    const scopes = [...new Set(liveGrants.flatMap((grant) => grant.scopes))];

    const section: Section = {
      allows: (scope) => grants.some((grant) => grantAllows(grant, scope, now)),
      ctx,
      now,
      ownerId: owner._id,
    };

    return {
      appointments: section.allows("appointments.view")
        ? await appointmentsSection(section)
        : null,
      demoMode: owner.demoMode,
      groceries: section.allows("groceries.view")
        ? await groceriesSection(section)
        : null,
      ownerName: owner.preferredName,
      photos: section.allows("photos.view")
        ? await photosSection(section)
        : null,
      reminders: section.allows("reminders.view")
        ? await remindersSection(section)
        : null,
      scamAlerts: section.allows("scam_alerts.view")
        ? await scamAlertsSection(section)
        : null,
      scopes,
      timeZone: owner.timeZone,
      updates: await updatesSection(section, liveGrantIds),
    };
  },
});
