import { assistantPlanSchema } from "@lifelink/contracts/model-output";
import type { Proposal } from "@lifelink/contracts/model-output";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { rulesPlan, toProposal } from "../convex/assistant";
import { recordIncoming } from "../convex/lib/incoming";
import { newBackend, onlyAction, ownerWithContact, signUp } from "./harness";
import type { Backend } from "./harness";

const arrivalIso = "2026-11-03T10:30:00-05:00";
const pickupIso = "2026-11-03T10:00:00-05:00";

const request =
  "Ask Sam for a ride to the library, arriving November 3 at 10:30 AM";

const proposal: Proposal = {
  appointmentId: null,
  dateTimeAsSaid: "November 3 at 10:30 AM",
  dateTimeIso: arrivalIso,
  groceryItems: [],
  intent: "ride_request",
  messageDraft: null,
  recipients: [{ contactId: null, nameAsSaid: "Sam" }],
  reminderTitle: null,
  rideDestination: "the library",
};

const apply = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  fields: Partial<Proposal> = {},
  text = request
) =>
  await backend.mutation(internal.assistant.applyProposalForOwner, {
    channel: "text",
    model: "test",
    ownerId,
    proposalJson: JSON.stringify({ ...proposal, ...fields }),
    request: text,
  });

describe("destination rides with targeting safeguards", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("carries rideDestination through the shared plan and toProposal", () => {
    const plan = assistantPlanSchema.parse({
      ...proposal,
      clarificationQuestion: null,
      reply: "Ready",
    });

    expect(toProposal(plan)?.rideDestination).toBe("the library");
  });

  it("carries a local explicit destination/arrival without attaching the sole saved appointment", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    await owner.mutation(api.appointments.create, {
      location: null,
      notes: null,
      startsAt: Date.parse(arrivalIso),
      title: "Doctor",
    });

    const context = await backend.query(internal.assistant.planningContext, {
      ownerId,
    });

    if (!context) {
      throw new Error("Missing context");
    }

    const text = `Ask Sam for a ride to the library at ${arrivalIso}`;
    const planned = toProposal(rulesPlan(text, context));
    expect(planned).toMatchObject({
      appointmentId: null,
      dateTimeIso: arrivalIso,
      pickupTimeIso: null,
      rideDestination: "the library",
    });

    if (!planned) {
      throw new Error("Missing proposal");
    }

    const result = await apply(backend, ownerId, planned, text);

    if (!result.taskId) {
      throw new Error(result.message);
    }

    const { detail } = await onlyAction(owner, result.taskId);
    expect(detail.task).toMatchObject({
      appointmentId: null,
      destination: { place: "the library", startsAt: Date.parse(arrivalIso) },
    });
  });

  it.each([false, true])(
    "completes a place ride without creating a stored appointment; explicit pickup=%s",
    async (explicitPickup) => {
      const backend = newBackend();

      const { owner, ownerId, contactId } = await ownerWithContact(
        backend,
        false
      );

      await backend.run(
        async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
      );

      const fields: Partial<Proposal> = explicitPickup
        ? {
            pickupTimeAsSaid: "pickup November 3 at 10 AM",
            pickupTimeIso: pickupIso,
            recipients: [],
          }
        : {};

      const result = await apply(
        backend,
        ownerId,
        fields,
        `${request}; pickup November 3 at 10 AM`
      );

      if (result.taskId === null) {
        throw new Error(result.message);
      }

      const { taskId } = result;

      if (explicitPickup) {
        const ambiguous = await onlyAction(owner, taskId);
        await owner.mutation(api.actions.resolveAmbiguity, {
          actionId: ambiguous.view.action._id,
          field: "recipient",
          value: contactId,
        });
      }

      const initial = await onlyAction(owner, taskId);
      expect(initial.current.details).toMatchObject({
        body: expect.stringContaining(explicitPickup ? "10:00" : "10:30"),
      });
      await owner.mutation(api.actions.approve, {
        actionId: initial.view.action._id,
        fingerprint: initial.current.fingerprint,
        method: "tap",
        version: initial.current.version,
      });
      await vi.advanceTimersByTimeAsync(0);
      await backend.finishInProgressScheduledFunctions();

      const messageId = await backend.run(
        async (ctx) =>
          await recordIncoming(ctx, {
            body: "Yes, I'll pick you up at 10 AM.",
            channel: "imessage",
            contactId,
            mode: "simulated",
            ownerId,
            photoIds: [],
            providerMessageId: "place-pickup-reply",
          })
      );

      if (messageId === null) {
        throw new Error("Missing incoming reply");
      }

      const context = await backend.query(internal.replies.replyContext, {
        messageId,
        taskId,
      });

      expect(context?.appointment).toMatchObject({
        startsAt: arrivalIso,
        title: "the library",
      });
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      const withReply = await owner.query(api.tasks.detail, { taskId });

      const confirm = withReply.actions.find(
        (view) => view.action.kind === "confirm_arrangement"
      );

      if (!confirm?.current) {
        throw new Error("Missing confirmation");
      }

      expect(confirm.current.details).toMatchObject({
        appointmentId: null,
        pickupAt: Date.parse(pickupIso),
        summary: expect.stringContaining("the library"),
      });
      await owner.mutation(api.actions.approve, {
        actionId: confirm.action._id,
        fingerprint: confirm.current.fingerprint,
        method: "tap",
        version: confirm.current.version,
      });
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      const confirmed = await owner.query(api.tasks.detail, { taskId });

      const reminder = confirmed.actions.find(
        (view) => view.action.kind === "create_reminder"
      );

      if (!reminder?.current) {
        throw new Error("Missing reminder");
      }

      await owner.mutation(api.actions.approve, {
        actionId: reminder.action._id,
        fingerprint: reminder.current.fingerprint,
        method: "tap",
        version: reminder.current.version,
      });
      await backend.finishAllScheduledFunctions(vi.runAllTimers);
      const done = await owner.query(api.tasks.detail, { taskId });

      const saved = await backend.run(async (ctx) => ({
        appointments: await ctx.db.query("appointments").collect(),
        reminders: await ctx.db.query("reminders").collect(),
      }));

      expect({ status: done.task.status, ...saved }).toMatchObject({
        appointments: [],
        reminders: [
          {
            remindAt: Date.parse(pickupIso) - 30 * 60_000,
            title: expect.stringContaining("the library"),
          },
        ],
        status: "completed",
      });
    }
  );

  it.each([
    { dateTimeIso: null },
    { dateTimeAsSaid: "ride" },
    { dateTimeAsSaid: "invented at 10:30 AM" },
    { dateTimeIso: "invalid" },
    { dateTimeIso: "2026-10-24T10:30:00-04:00" },
    {
      dateTimeIso: null,
      pickupTimeAsSaid: "pickup at 10 AM",
      pickupTimeIso: pickupIso,
    },
  ])(
    "rejects missing, fabricated or invalid arrival evidence: %j",
    async (fields) => {
      const backend = newBackend();
      const { owner, ownerId } = await ownerWithContact(backend, false);
      const result = await apply(backend, ownerId, fields);
      expect(result.taskId).toBeNull();
      await expect(
        owner.query(api.tasks.list, { include: "all" })
      ).resolves.toHaveLength(0);

      const appointments = await backend.run(
        async (ctx) => await ctx.db.query("appointments").collect()
      );

      expect(appointments).toHaveLength(0);
    }
  );

  it("rejects foreign explicit appointment/contact IDs and contradictory appointment/place selectors", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const other = await signUp(backend, {
      demo: false,
      name: "Other",
      role: "owner",
      subject: "other",
    });

    const foreign = await other.person.mutation(api.appointments.create, {
      location: null,
      notes: null,
      startsAt: Date.parse(arrivalIso),
      title: "Foreign",
    });

    const contact = await other.person.mutation(api.contacts.create, {
      channels: [
        { address: "foreign@example.com", channel: "email", preferred: true },
      ],
      name: "Sam",
      relationship: "Son",
      trusted: true,
    });

    const own = await owner.mutation(api.appointments.create, {
      location: null,
      notes: null,
      startsAt: Date.parse(arrivalIso),
      title: "Doctor",
    });

    const outcomes = await Promise.all([
      apply(backend, ownerId, { appointmentId: foreign }),
      apply(backend, ownerId, {
        recipients: [{ contactId: contact, nameAsSaid: "Sam" }],
      }),
      apply(backend, ownerId, { appointmentId: own }),
    ]);

    expect(outcomes.map((result) => result.taskId)).toStrictEqual([
      null,
      null,
      null,
    ]);
    await expect(
      owner.query(api.tasks.list, { include: "all" })
    ).resolves.toHaveLength(0);
  });

  it.each([
    "Can Sam drive me to the library?",
    `Can Sam pick me up at ${pickupIso} to the library?`,
    "Can Sam drive me to the library at ten?",
  ])(
    "clarifies destination arrival instead of substituting a stored appointment: %s",
    async (text) => {
      const backend = newBackend();
      const { ownerId } = await ownerWithContact(backend, false);

      const context = await backend.query(internal.assistant.planningContext, {
        ownerId,
      });

      if (!context) {
        throw new Error("Missing context");
      }

      const plan = rulesPlan(text, context);
      expect(plan.intent).toBe("clarify");
      expect(plan.reply).toBe(
        "When do you need to be there? Please give the day and time."
      );
      expect(toProposal(plan)).toBeNull();
    }
  );

  it("refuses pickup-only evidence proposed as destination arrival through the model tool", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const result = await apply(
      backend,
      ownerId,
      { dateTimeAsSaid: "pickup November 3 at 10 AM", dateTimeIso: pickupIso },
      "Ask Sam for a ride to the library; pickup November 3 at 10 AM"
    );

    expect(result.taskId).toBeNull();
    expect(result.message).toBe(
      "When do you need to be there? Please give the day and time."
    );
    await expect(
      owner.query(api.tasks.list, { include: "all" })
    ).resolves.toHaveLength(0);
  });

  it.each([
    [
      "the library",
      "Ask Sam for a ride to the library, arriving November 3 at 10:30 AM; pickup November 3 at 10 AM",
    ],
    [
      "biblioteca",
      "Llévame a biblioteca, llegada el 3 de noviembre a las 10:30; recogida el 3 de noviembre a las 10:00",
    ],
    ["图书馆", "请送我去图书馆，到达时间11月3日10:30；接我时间11月3日10:00"],
  ])(
    "keeps arrival and separate pickup from the same whole quoted request: %s",
    async (rideDestination, text) => {
      const backend = newBackend();
      const { owner, ownerId } = await ownerWithContact(backend, false);

      const result = await apply(
        backend,
        ownerId,
        {
          dateTimeAsSaid: text,
          pickupTimeAsSaid: text,
          pickupTimeIso: pickupIso,
          rideDestination,
        },
        text
      );

      if (result.taskId === null) {
        throw new Error(result.message);
      }

      const { current } = await onlyAction(owner, result.taskId);
      expect(current.details).toMatchObject({
        body: expect.stringContaining("10:30"),
      });
      expect(current.details).toMatchObject({
        body: expect.stringContaining("10:00"),
      });
    }
  );

  it("keeps grounded arrival-only quotes valid", async () => {
    const backend = newBackend();
    const { ownerId } = await ownerWithContact(backend, false);
    const result = await apply(backend, ownerId);
    expect(result.taskId).not.toBeNull();
  });

  it("clarifies an arrival phrase without an arrival clock alongside pickup", async () => {
    const backend = newBackend();
    const { ownerId } = await ownerWithContact(backend, false);

    const text =
      "Ask Sam for a ride to the library; arriving after pickup November 3 at 10 AM";

    const result = await apply(
      backend,
      ownerId,
      { dateTimeAsSaid: text, dateTimeIso: pickupIso },
      text
    );

    expect(result.taskId).toBeNull();
  });
});
