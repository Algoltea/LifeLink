import type { Proposal } from "@lifelink/contracts/model-output";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { QueryCtx } from "../convex/_generated/server";
import { rulesPlan, toProposal } from "../convex/assistant";
import { recordIncoming } from "../convex/lib/incoming";
import { newBackend, onlyAction, ownerWithContact, signUp } from "./harness";
import type { Backend } from "./harness";

const base: Proposal = {
  appointmentId: null,
  dateTimeAsSaid: null,
  dateTimeIso: null,
  groceryItems: [],
  intent: "ride_request",
  messageDraft: null,
  recipients: [{ contactId: null, nameAsSaid: "Sam" }],
  reminderTitle: null,
};

const apply = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  fields: Partial<Proposal>,
  request = "Ask Sam for a ride."
) =>
  await backend.mutation(internal.assistant.applyProposalForOwner, {
    channel: "text",
    model: "test",
    ownerId,
    proposalJson: JSON.stringify({ ...base, ...fields }),
    request,
  });

const itemsFor = async (ctx: QueryCtx, id: Id<"groceryLists">) => {
  const list = await ctx.db.get(id);

  return list?.items;
};

const milk = { name: "milk", quantity: null, unit: null };
const storedTime = "2026-11-03T10:30:00-05:00";
const requestedTime = "2026-11-03T10:00:00-05:00";

const appointmentFor = async (backend: Backend) => {
  const people = await ownerWithContact(backend, false);

  const appointmentId = await people.owner.mutation(api.appointments.create, {
    location: "Clinic",
    notes: null,
    startsAt: Date.parse(storedTime),
    title: "Doctor",
  });

  return { ...people, appointmentId };
};

describe("explicit grocery and ride targeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("adds to the explicitly named older list instead of the newest list", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const named = await owner.mutation(api.groceries.createList, {
      name: "Weekend",
    });

    const newest = await owner.mutation(api.groceries.createList, {
      name: "Monday",
    });

    await apply(
      backend,
      ownerId,
      {
        groceryItems: [milk],
        groceryListName: "  WEEKEND  ",
        intent: "grocery_list",
      },
      "Add milk to Weekend"
    );
    await backend.run(async (ctx) => {
      await expect(itemsFor(ctx, named)).resolves.toHaveLength(1);
      await expect(itemsFor(ctx, newest)).resolves.toHaveLength(0);
    });
  });

  it("clarifies an explicit appointment time conflict before creating a task", async () => {
    const backend = newBackend();
    const { owner, ownerId, appointmentId } = await appointmentFor(backend);

    const result = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        dateTimeAsSaid: "November 3 at 10 AM",
        dateTimeIso: requestedTime,
      },
      "Ask Sam for a ride to my appointment November 3 at 10 AM"
    );

    expect(result.taskId).toBeNull();
    expect(result.message).toMatch(/10:00/iu);
    expect(result.message).toMatch(/10:30/iu);
    await expect(
      owner.query(api.tasks.list, { include: "all" })
    ).resolves.toHaveLength(0);
  });

  it.each([
    "unknown",
    "archived",
    "foreign",
    "duplicate",
    "contradictory",
    "empty",
  ])("does not mutate any list for a %s selector", async (kind) => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const first = await owner.mutation(api.groceries.createList, {
      name: "Weekend",
    });

    const second = await owner.mutation(api.groceries.createList, {
      name: kind === "duplicate" ? " weekend " : "Monday",
    });

    let selector: Pick<Proposal, "groceryListId" | "groceryListName"> = {
      groceryListName: "Missing",
    };

    if (kind === "archived") {
      await backend.run(
        async (ctx) => await ctx.db.patch(first, { archivedAt: Date.now() })
      );
      selector = { groceryListId: first };
    } else if (kind === "foreign") {
      const other = await signUp(backend, {
        demo: false,
        name: "Other",
        role: "owner",
        subject: "other",
      });

      const foreign = await other.person.mutation(api.groceries.createList, {
        name: "Foreign",
      });

      selector = { groceryListId: foreign };
    } else if (kind === "duplicate") {
      selector = { groceryListId: first, groceryListName: "Weekend" };
    } else if (kind === "contradictory") {
      selector = { groceryListId: second, groceryListName: "Weekend" };
    } else if (kind === "empty") {
      selector = { groceryListName: " " };
    }

    const result = await apply(backend, ownerId, {
      ...selector,
      groceryItems: [milk],
      intent: "grocery_list",
    });

    expect(result.message).toMatch(/Nothing was added/u);
    await backend.run(async (ctx) => {
      await expect(itemsFor(ctx, first)).resolves.toHaveLength(0);
      await expect(itemsFor(ctx, second)).resolves.toHaveLength(0);
    });
  });

  it("preserves generic no-list creation and default current-list behavior, and explicit usual selection", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);
    await apply(backend, ownerId, {
      groceryItems: [milk],
      intent: "grocery_list",
    });
    const { lists } = await owner.query(api.groceries.lists, {});
    expect(lists).toHaveLength(1);
    const [usual] = lists;

    if (!usual) {
      throw new Error("Missing list");
    }

    await backend.run(
      async (ctx) =>
        await ctx.db.patch(usual._id, { name: "Usual", usual: true })
    );

    const current = await owner.mutation(api.groceries.createList, {
      name: "Current",
    });

    await apply(backend, ownerId, {
      groceryItems: [milk],
      intent: "grocery_list",
    });
    await apply(backend, ownerId, {
      groceryItems: [milk],
      groceryListId: usual._id,
      groceryListName: "Usual",
      intent: "grocery_list",
    });
    await backend.run(async (ctx) => {
      await expect(itemsFor(ctx, current)).resolves.toHaveLength(1);
      await expect(itemsFor(ctx, usual._id)).resolves.toHaveLength(2);
    });
  });

  it.each(["invalid", "foreign"])(
    "rejects an explicit %s appointment id without sole-appointment fallback",
    async (kind) => {
      const backend = newBackend();
      const { owner, ownerId } = await appointmentFor(backend);
      let appointmentId = "invented";

      if (kind === "foreign") {
        const other = await signUp(backend, {
          demo: false,
          name: "Other",
          role: "owner",
          subject: "other",
        });

        appointmentId = await other.person.mutation(api.appointments.create, {
          location: null,
          notes: null,
          startsAt: Date.parse(storedTime),
          title: "Other",
        });
      }

      const result = await apply(backend, ownerId, { appointmentId });
      expect(result.taskId).toBeNull();
      await expect(
        owner.query(api.tasks.list, { include: "all" })
      ).resolves.toHaveLength(0);
    }
  );

  it.each([null, "2026-11-03T15:30:00Z"])(
    "preserves no-time and equivalent-time rides: %s",
    async (dateTimeIso) => {
      const backend = newBackend();
      const { owner, ownerId, appointmentId } = await appointmentFor(backend);

      const result = await apply(
        backend,
        ownerId,
        {
          appointmentId,
          dateTimeAsSaid:
            dateTimeIso === null ? null : "November 3 at 10:30 AM",
          dateTimeIso,
        },
        "Ask Sam for a ride November 3 at 10:30 AM"
      );

      expect(result.taskId).not.toBeNull();

      if (result.taskId === null) {
        throw new Error(result.message);
      }

      const { current } = await onlyAction(owner, result.taskId);
      expect(current.details).toMatchObject({
        body: expect.stringContaining("10:30"),
        kind: "send_message",
      });
    }
  );

  it("rejects ungrounded model appointment and pickup times", async () => {
    const backend = newBackend();
    const { ownerId, appointmentId } = await appointmentFor(backend);

    const results = await Promise.all(
      [
        { dateTimeAsSaid: "invented words", dateTimeIso: requestedTime },
        { pickupTimeAsSaid: "invented words", pickupTimeIso: requestedTime },
        { pickupTimeAsSaid: "ride", pickupTimeIso: "invalid" },
      ].map(
        async (fields) =>
          await apply(backend, ownerId, { appointmentId, ...fields })
      )
    );

    for (const result of results) {
      expect(result.taskId).toBeNull();
    }
  });

  it("keeps a conflict-to-pickup follow-up in the draft and preserves it after recipient resolution", async () => {
    const backend = newBackend();

    const { owner, ownerId, appointmentId, contactId } =
      await appointmentFor(backend);

    const conflict = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        dateTimeAsSaid: "November 3 at 10 AM",
        dateTimeIso: requestedTime,
      },
      "Ask Sam for a ride to my appointment November 3 at 10 AM"
    );

    expect(conflict.taskId).toBeNull();

    const result = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        pickupTimeAsSaid: "pickup November 3 at 10 AM",
        pickupTimeIso: requestedTime,
        recipients: [],
      },
      "I meant pickup November 3 at 10 AM for the saved appointment"
    );

    if (result.taskId === null) {
      throw new Error(result.message);
    }

    const { current, view } = await onlyAction(owner, result.taskId);
    expect(current.details).toMatchObject({
      body: expect.stringContaining("10:00"),
    });
    await owner.mutation(api.actions.resolveAmbiguity, {
      actionId: view.action._id,
      field: "recipient",
      value: contactId,
    });
    const revised = await onlyAction(owner, result.taskId);
    expect(revised.current.details).toMatchObject({
      body: expect.stringContaining("10:00"),
    });
    expect(revised.current.details).toMatchObject({
      body: expect.stringContaining("10:30"),
    });
    const { taskId } = result;
    await backend.run(async (ctx) => {
      const appointment = await ctx.db.get(appointmentId);
      const task = await ctx.db.get(taskId);
      expect(appointment?.startsAt).toBe(Date.parse(storedTime));
      expect(task?.requestedRidePickupAt).toBe(Date.parse(requestedTime));
    });
  });

  it("requires appointment selection before attaching pickup to an ambiguous appointment", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await appointmentFor(backend);
    await owner.mutation(api.appointments.create, {
      location: null,
      notes: null,
      startsAt: Date.parse(storedTime) + 86_400_000,
      title: "Dentist",
    });

    const result = await apply(
      backend,
      ownerId,
      {
        pickupTimeAsSaid: "pickup November 3 at 10 AM",
        pickupTimeIso: requestedTime,
      },
      "pickup November 3 at 10 AM"
    );

    expect(result.taskId).toBeNull();
  });

  it.each(["2026-11-03T11:00:00-05:00", "2026-10-24T10:00:00-04:00"])(
    "rejects pickup after the appointment or in the past: %s",
    async (pickupTimeIso) => {
      const backend = newBackend();
      const { ownerId, appointmentId } = await appointmentFor(backend);

      const result = await apply(
        backend,
        ownerId,
        { appointmentId, pickupTimeAsSaid: "pickup", pickupTimeIso },
        "pickup"
      );

      expect(result.taskId).toBeNull();
    }
  );

  it("preserves day-only rides without requiring an invented clock time", async () => {
    const backend = newBackend();
    const { owner, ownerId, appointmentId } = await appointmentFor(backend);

    const result = await apply(
      backend,
      ownerId,
      { appointmentId, dateTimeAsSaid: "Tuesday" },
      "Can Sam drive me Tuesday?"
    );

    if (result.taskId === null) {
      throw new Error(result.message);
    }

    const { current } = await onlyAction(owner, result.taskId);
    expect(current.details).toMatchObject({
      body: expect.stringContaining("10:30"),
    });
  });

  it("uses Spanish for time and grocery clarification and explicit pickup drafts", async () => {
    const backend = newBackend();

    const { owner, ownerId, appointmentId, contactId } =
      await appointmentFor(backend);

    await owner.mutation(api.profiles.updatePreferences, {
      supportLanguage: "es",
    });
    await backend.run(
      async (ctx) => await ctx.db.patch(contactId, { language: "es" })
    );

    const conflict = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        dateTimeAsSaid: "3 de noviembre a las 10",
        dateTimeIso: requestedTime,
      },
      "Pide a Sam transporte el 3 de noviembre a las 10"
    );

    expect(conflict.message).toMatch(/Dijo.*10:00.*10:30/u);

    const missing = await apply(backend, ownerId, {
      groceryItems: [milk],
      groceryListName: "Falta",
      intent: "grocery_list",
    });

    expect(missing.message).toMatch(/No se añadió nada/u);

    const result = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        pickupTimeAsSaid: "recogida el 3 de noviembre a las 10",
        pickupTimeIso: requestedTime,
      },
      "Quiero recogida el 3 de noviembre a las 10"
    );

    if (result.taskId === null) {
      throw new Error(result.message);
    }

    const { current } = await onlyAction(owner, result.taskId);
    expect(current.details).toMatchObject({
      body: expect.stringContaining("¿Podrías recogerme"),
    });
  });

  it.each([
    ["Add milk to my grocery list", null],
    ["Add milk to my Weekend grocery list", "Weekend"],
    ["Add milk to my grocery list called Weekend", "Weekend"],
    ["Add milk to Missing list", "Missing"],
    ["Add milk to QA older list", "QA older list"],
  ])(
    "preserves the rules-planner grocery selector: %s",
    async (request, expected) => {
      const backend = newBackend();
      const { owner, ownerId } = await ownerWithContact(backend, false);
      await owner.mutation(api.groceries.createList, { name: "QA older list" });

      const context = await backend.query(internal.assistant.planningContext, {
        ownerId,
      });

      if (context === null) {
        throw new Error("Missing context");
      }

      const proposal = toProposal(rulesPlan(request, context));
      expect(proposal).toMatchObject({
        groceryListName: expected,
        intent: "grocery_list",
      });
    }
  );

  it("includes only active owner list metadata in planning context", async () => {
    const backend = newBackend();
    const { owner, ownerId } = await ownerWithContact(backend, false);

    const active = await owner.mutation(api.groceries.createList, {
      name: "Active",
    });

    const archived = await owner.mutation(api.groceries.createList, {
      name: "Archived",
    });

    await backend.run(
      async (ctx) => await ctx.db.patch(archived, { archivedAt: Date.now() })
    );

    const other = await signUp(backend, {
      demo: false,
      name: "Other",
      role: "owner",
      subject: "other",
    });

    await other.person.mutation(api.groceries.createList, { name: "Foreign" });

    const context = await backend.query(internal.assistant.planningContext, {
      ownerId,
    });

    expect(context?.groceryLists).toStrictEqual([
      { id: active, name: "Active", usual: false },
    ]);
  });

  it("preserves rules-planner explicit ISO pickup and clarifies unsupported clock syntax", async () => {
    const backend = newBackend();
    const { ownerId } = await appointmentFor(backend);

    const context = await backend.query(internal.assistant.planningContext, {
      ownerId,
    });

    if (context === null) {
      throw new Error("Missing context");
    }

    const pickup = toProposal(
      rulesPlan(`Can Sam pick me up ${requestedTime}?`, context)
    );

    expect(pickup).toMatchObject({
      dateTimeIso: null,
      pickupTimeAsSaid: `Can Sam pick me up ${requestedTime}?`,
      pickupTimeIso: requestedTime,
    });
    expect(
      rulesPlan("Can Sam drive me to my appointment at 10 AM?", context).intent
    ).toBe("clarify");
    expect(rulesPlan("Can Sam drive me Tuesday?", context).intent).toBe(
      "ride_request"
    );
    expect(rulesPlan("Add appointment to my calendar", context).intent).toBe(
      "answer_only"
    );
  });

  it.each(["pickup", "appointment"])(
    "rejects an unrelated but found quote as %s time evidence",
    async (kind) => {
      const backend = newBackend();
      const { ownerId, appointmentId } = await appointmentFor(backend);

      const fields =
        kind === "pickup"
          ? { pickupTimeAsSaid: "ride", pickupTimeIso: requestedTime }
          : { dateTimeAsSaid: "ride", dateTimeIso: requestedTime };

      const result = await apply(
        backend,
        ownerId,
        { appointmentId, ...fields },
        "Ask Sam for a ride."
      );

      expect(result.taskId).toBeNull();
      expect(result.message).not.toMatch(/You said/u);
    }
  );

  it("does not label an appointment-clause ISO as pickup because pick me up occurs earlier", async () => {
    const backend = newBackend();
    const { ownerId } = await appointmentFor(backend);

    const context = await backend.query(internal.assistant.planningContext, {
      ownerId,
    });

    if (context === null) {
      throw new Error("Missing context");
    }

    const request = `Ask Sam to pick me up for my appointment at ${storedTime}`;
    const proposal = toProposal(rulesPlan(request, context));
    expect(proposal).toMatchObject({
      dateTimeIso: storedTime,
      pickupTimeIso: null,
    });

    if (proposal === null) {
      throw new Error("Missing proposal");
    }

    const result = await apply(backend, ownerId, proposal, request);
    expect(result).toMatchObject({ taskId: expect.any(String) });
  });

  it("approves an explicit pickup, reads the driver's matching reply, confirms and saves the pickup reminder", async () => {
    const backend = newBackend();

    const { owner, ownerId, contactId, appointmentId } =
      await appointmentFor(backend);

    // Enable simulated execution without seeding unrelated demo appointments.
    await backend.run(
      async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
    );

    const result = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        pickupTimeAsSaid: "pickup November 3 at 10 AM",
        pickupTimeIso: requestedTime,
      },
      "Ask Sam for pickup November 3 at 10 AM"
    );

    if (result.taskId === null) {
      throw new Error(result.message);
    }

    const { taskId } = result;
    const initial = await onlyAction(owner, taskId);
    expect(initial.current.details).toMatchObject({
      body: expect.stringContaining("10:00"),
    });
    await owner.mutation(api.actions.approve, {
      actionId: initial.view.action._id,
      fingerprint: initial.current.fingerprint,
      method: "tap",
      version: initial.current.version,
    });
    await vi.advanceTimersByTimeAsync(0);
    await backend.finishInProgressScheduledFunctions();
    const waiting = await owner.query(api.tasks.detail, { taskId });
    expect(waiting.task.status).toBe("waiting_for_reply");
    await backend.run(
      async (ctx) =>
        await recordIncoming(ctx, {
          body: "Yes, I'll pick you up at 10 AM.",
          channel: "imessage",
          contactId,
          mode: "simulated",
          ownerId,
          photoIds: [],
          providerMessageId: "explicit-pickup-test-reply",
        })
    );
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const withReply = await owner.query(api.tasks.detail, { taskId });

    const confirm = withReply.actions.find(
      (view) => view.action.kind === "confirm_arrangement"
    );

    if (!confirm?.current) {
      throw new Error("No confirmation");
    }

    expect(confirm.current).toMatchObject({
      ambiguities: [],
      details: { pickupAt: Date.parse(requestedTime) },
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
      throw new Error("No reminder");
    }

    expect(reminder.current.details).toMatchObject({
      remindAt: Date.parse(requestedTime) - 30 * 60_000,
    });
    await owner.mutation(api.actions.approve, {
      actionId: reminder.action._id,
      fingerprint: reminder.current.fingerprint,
      method: "tap",
      version: reminder.current.version,
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const done = await owner.query(api.tasks.detail, { taskId });

    const reminders = await backend.run(
      async (ctx) => await ctx.db.query("reminders").collect()
    );

    expect({
      appointment: done.appointment,
      reminders,
      taskStatus: done.task.status,
    }).toMatchObject({
      appointment: {
        ridePickupAt: Date.parse(requestedTime),
        rideStatus: "confirmed",
        startsAt: Date.parse(storedTime),
      },
      reminders: [{ remindAt: Date.parse(requestedTime) - 30 * 60_000 }],
      taskStatus: "completed",
    });
  });

  it("does not turn an isolated quoted appointment clock into a requested pickup", async () => {
    const backend = newBackend();
    const { ownerId, appointmentId } = await appointmentFor(backend);

    const result = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        pickupTimeAsSaid: "10 AM",
        pickupTimeIso: requestedTime,
      },
      "Ask Sam for a ride to my appointment at 10 AM."
    );

    expect(result.taskId).toBeNull();
  });

  it.each([
    ["pickup", "Ask Sam for pickup at ten", "pickup at ten", requestedTime],
    [
      "appointment",
      "Ask Sam for a ride to my appointment at ten thirty",
      "appointment at ten thirty",
      storedTime,
    ],
  ])(
    "accepts grounded spelled English %s clock evidence",
    async (kind, request, quote, iso) => {
      const backend = newBackend();
      const { owner, ownerId, appointmentId } = await appointmentFor(backend);

      const fields =
        kind === "pickup"
          ? { pickupTimeAsSaid: quote, pickupTimeIso: iso }
          : { dateTimeAsSaid: quote, dateTimeIso: iso };

      const result = await apply(
        backend,
        ownerId,
        { appointmentId, ...fields },
        request
      );

      expect(result.taskId).not.toBeNull();

      if (result.taskId === null) {
        throw new Error(result.message);
      }

      const { current } = await onlyAction(owner, result.taskId);
      expect(current.details).toMatchObject({
        body: expect.stringContaining(kind === "pickup" ? "10:00" : "10:30"),
      });

      const unsupported = await apply(
        backend,
        ownerId,
        { appointmentId, ...fields },
        "Ask Sam for a ride."
      );

      expect(unsupported.taskId).toBeNull();
    }
  );

  it.each([
    "Can Sam drive me to my appointment at ten?",
    "Can Sam pick me up at ten?",
  ])(
    "clarifies a spoken clock unsupported by the local fallback: %s",
    async (request) => {
      const backend = newBackend();
      const { ownerId } = await appointmentFor(backend);

      const context = await backend.query(internal.assistant.planningContext, {
        ownerId,
      });

      if (context === null) {
        throw new Error("Missing context");
      }

      const plan = rulesPlan(request, context);
      expect(plan.intent).toBe("clarify");
      expect(toProposal(plan)).toBeNull();
      expect(rulesPlan("Can Sam drive me Tuesday?", context).intent).toBe(
        "ride_request"
      );
      expect(rulesPlan("Ask Sam for a ride.", context).intent).toBe(
        "ride_request"
      );
    }
  );

  it("retains an exact 24-hours-before pickup after a yes reply and still requires clarification", async () => {
    const backend = newBackend();

    const { owner, ownerId, contactId, appointmentId } =
      await appointmentFor(backend);

    await backend.run(
      async (ctx) => await ctx.db.patch(ownerId, { demoMode: true })
    );
    const pickupTimeIso = "2026-11-02T10:30:00-05:00";
    const pickupAt = Date.parse(pickupTimeIso);

    const result = await apply(
      backend,
      ownerId,
      {
        appointmentId,
        pickupTimeAsSaid: "pickup November 2 at 10:30 AM",
        pickupTimeIso,
        recipients: [],
      },
      "Ask Sam for pickup November 2 at 10:30 AM"
    );

    if (result.taskId === null) {
      throw new Error(result.message);
    }

    const { taskId } = result;
    const unresolved = await onlyAction(owner, taskId);
    await owner.mutation(api.actions.resolveAmbiguity, {
      actionId: unresolved.view.action._id,
      field: "recipient",
      value: contactId,
    });
    const initial = await onlyAction(owner, taskId);
    await owner.mutation(api.actions.approve, {
      actionId: initial.view.action._id,
      fingerprint: initial.current.fingerprint,
      method: "tap",
      version: initial.current.version,
    });
    await vi.advanceTimersByTimeAsync(0);
    await backend.finishInProgressScheduledFunctions();
    await backend.run(
      async (ctx) =>
        await recordIncoming(ctx, {
          body: "Yes",
          channel: "imessage",
          contactId,
          mode: "simulated",
          ownerId,
          photoIds: [],
          providerMessageId: "24-hour-pickup-reply",
        })
    );
    await backend.finishAllScheduledFunctions(vi.runAllTimers);
    const detail = await owner.query(api.tasks.detail, { taskId });

    const confirmation = detail.actions.find(
      (view) => view.action.kind === "confirm_arrangement"
    );

    if (!confirmation?.current) {
      throw new Error("No confirmation");
    }

    expect(confirmation.current.details).toMatchObject({ pickupAt });
    expect(confirmation.current.ambiguities).toMatchObject([
      {
        field: "pickup",
        options: expect.arrayContaining([
          expect.objectContaining({ value: String(pickupAt) }),
        ]),
        resolvedValue: null,
      },
    ]);
    await expect(
      owner.mutation(api.actions.approve, {
        actionId: confirmation.action._id,
        fingerprint: confirmation.current.fingerprint,
        method: "tap",
        version: confirmation.current.version,
      })
    ).rejects.toThrow(/ambiguous/u);
    const unchanged = await owner.query(api.tasks.detail, { taskId });
    expect(unchanged.appointment).toMatchObject({
      ridePickupAt: null,
      startsAt: Date.parse(storedTime),
    });
  });
});
