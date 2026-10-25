import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { DAY, connectFamily, newBackend, signUp } from "./harness";
import type { Backend, Person } from "./harness";

const settle = async (backend: Backend): Promise<void> => {
  await backend.finishAllScheduledFunctions(vi.runAllTimers);
};

/** Approve every waiting action of the task exactly as shown, one tap at a time. */
const approveWaiting = async (
  owner: Person,
  taskId: Id<"tasks">
): Promise<string[]> => {
  const detail = await owner.query(api.tasks.detail, { taskId });

  const waiting = detail.actions.filter(
    (view) => view.action.status === "awaiting_approval"
  );

  for (const view of waiting) {
    if (view.current === null) {
      throw new Error("action without details");
    }

    // oxlint-disable-next-line eslint/no-await-in-loop -- approvals are tapped one at a time, as a person would.
    await owner.mutation(api.actions.approve, {
      actionId: view.action._id,
      fingerprint: view.current.fingerprint,
      method: "tap",
      version: view.current.version,
    });
  }

  return waiting.map((view) => view.action.kind).toSorted();
};

/** A demo owner with seeded sample data (Sam, Dr. Patel's appointment). */
const demoOwner = async (backend: Backend) => {
  const { id: ownerId, person: owner } = await signUp(backend, {
    demo: true,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

  await settle(backend);

  const contacts = await owner.query(api.contacts.list, {});
  const sam = contacts.find((contact) => contact.name === "Sam Rivera");

  const upcoming = await owner.query(api.appointments.upcoming, { days: 30 });

  // Practice has several appointments; this journey is the ride to the doctor.
  const appointment = upcoming.find(({ title }) => title === "Dr. Patel");

  if (sam === undefined || appointment === undefined) {
    throw new Error("demo seed did not run");
  }

  return { appointmentId: appointment._id, owner, ownerId, samId: sam._id };
};

interface RideProposal {
  appointmentId: Id<"appointments"> | null;
  ownerId: Id<"profiles">;
  samId: Id<"contacts"> | null;
}

/** Prepare a ride request through the same server-side path the assistant's tool uses. */
const proposeRide = async (
  backend: Backend,
  ride: RideProposal
): Promise<Id<"tasks">> => {
  const outcome = await backend.mutation(
    internal.assistant.applyProposalForOwner,
    {
      channel: "text",
      model: "test",
      ownerId: ride.ownerId,
      proposalJson: JSON.stringify({
        appointmentId: ride.appointmentId,
        dateTimeAsSaid: null,
        dateTimeIso: null,
        groceryItems: [],
        intent: "ride_request",
        messageDraft: null,
        recipients: [{ contactId: ride.samId, nameAsSaid: "Sam" }],
        reminderTitle: null,
      }),
      request: "Can you ask Sam to drive me to my appointment?",
    }
  );

  if (outcome.taskId === null) {
    throw new Error(outcome.message);
  }

  return outcome.taskId;
};

describe("appointment to confirmed ride (demo mode)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes the exact request from the appointment and waits for approval", async () => {
    const backend = newBackend();
    const { appointmentId, ownerId, owner, samId } = await demoOwner(backend);

    const taskId = await proposeRide(backend, {
      appointmentId,
      ownerId,
      samId,
    });

    const detail = await owner.query(api.tasks.detail, { taskId });
    const details = detail.actions[0]?.current?.details;
    const send = details?.kind === "send_message" ? details : null;

    expect(detail.task.status).toBe("awaiting_approval");
    expect(send?.body).toContain("Dr. Patel");
    expect({ address: send?.address, channel: send?.channel }).toStrictEqual({
      address: "+15555550142",
      channel: "imessage",
    });
  });

  it("asks, receives a reply, confirms, saves a reminder, and updates permitted family", async () => {
    const backend = newBackend();
    const { appointmentId, owner, ownerId, samId } = await demoOwner(backend);

    const { family } = await connectFamily(backend, owner, [
      "rides.view",
      "appointments.view",
    ]);

    const taskId = await proposeRide(backend, {
      appointmentId,
      ownerId,
      samId,
    });

    const approvals: string[][] = [];

    approvals.push(await approveWaiting(owner, taskId));
    await settle(backend);
    approvals.push(await approveWaiting(owner, taskId));
    await settle(backend);
    approvals.push(await approveWaiting(owner, taskId));
    await settle(backend);

    const done = await owner.query(api.tasks.detail, { taskId });

    const reminders = await backend.run(
      async (ctx) => await ctx.db.query("reminders").collect()
    );

    const view = await family.query(api.family.overview, { ownerId });

    expect(approvals).toStrictEqual([
      ["send_message"],
      ["confirm_arrangement"],
      ["create_reminder", "family_update"],
    ]);
    expect({
      allStepsDone: done.steps.every((step) => step.status === "succeeded"),
      gotSimulatedReply: done.messages.some(
        (message) =>
          message.direction === "incoming" && message.mode === "simulated"
      ),
      ride: done.appointment?.rideStatus,
      task: done.task.status,
    }).toStrictEqual({
      allStepsDone: true,
      gotSimulatedReply: true,
      ride: "confirmed",
      task: "completed",
    });
    expect(
      reminders.map((reminder) => reminder.title.includes("picks you up"))
    ).toStrictEqual([true]);
    expect(
      view?.updates.map((update) =>
        update.text.startsWith("Sam will drive Ruth")
      )
    ).toStrictEqual([true]);
    expect(view?.appointments?.[0]?.rideStatus).toBe("confirmed");
  });

  it("skips the family update when nobody may see ride plans", async () => {
    const backend = newBackend();
    const { appointmentId, owner, ownerId, samId } = await demoOwner(backend);

    const taskId = await proposeRide(backend, {
      appointmentId,
      ownerId,
      samId,
    });

    await approveWaiting(owner, taskId);
    await settle(backend);
    await approveWaiting(owner, taskId);
    await settle(backend);

    const last = await approveWaiting(owner, taskId);

    await settle(backend);

    const done = await owner.query(api.tasks.detail, { taskId });
    const familyStep = done.steps.find((step) => step.kind === "family_update");

    expect(last).toStrictEqual(["create_reminder"]);
    expect({
      family: familyStep?.status,
      task: done.task.status,
    }).toStrictEqual({ family: "skipped", task: "completed" });
  });

  it("asks which appointment when the request does not say", async () => {
    const backend = newBackend();
    const { owner, ownerId, samId } = await demoOwner(backend);

    await owner.mutation(api.appointments.create, {
      location: null,
      notes: null,
      startsAt: Date.now() + 10 * DAY,
      title: "Dentist",
    });

    const taskId = await proposeRide(backend, {
      appointmentId: null,
      ownerId,
      samId: null,
    });

    const detail = await owner.query(api.tasks.detail, { taskId });

    const fields = detail.actions[0]?.current?.ambiguities.map(
      (ambiguity) => ambiguity.field
    );

    expect(detail.task.status).toBe("needs_clarification");
    expect(fields).toStrictEqual(["appointment"]);
    expect(detail.contact?.id).toBe(samId);
  });
});
