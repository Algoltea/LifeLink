import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, internal } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { startRideRequest } from "../convex/lib/journey";
import { DAY, newBackend, onlyAction, ownerWithContact } from "./harness";
import type { Backend, Person } from "./harness";

const UNKNOWN = {
  error: "The service took too long to answer.",
  kind: "unknown" as const,
};

/** Approve the task's action and open an attempt without running the scheduled execution. */
const approveAndBegin = async (
  backend: Backend,
  owner: Person,
  taskId: Id<"tasks">
) => {
  const { current, view } = await onlyAction(owner, taskId);

  await owner.mutation(api.actions.approve, {
    actionId: view.action._id,
    fingerprint: current.fingerprint,
    method: "tap",
    version: current.version,
  });

  const started = await backend.mutation(internal.execution.begin, {
    actionId: view.action._id,
  });

  if (!started.ok) {
    throw new Error(started.reason);
  }

  return { actionId: view.action._id, attemptId: started.attemptId };
};

const outcomesOf = async (
  backend: Backend,
  actionId: Id<"actions">
): Promise<string[]> => {
  const attempts = await backend.run(
    async (ctx) =>
      await ctx.db
        .query("executionAttempts")
        .withIndex("by_action", (index) => index.eq("actionId", actionId))
        .collect()
  );

  return attempts.map((attempt) => attempt.outcome);
};

/** The action's status, its task's status, and the latest message status, as the person would see them. */
const stateOf = async (owner: Person, taskId: Id<"tasks">) => {
  const { detail, view } = await onlyAction(owner, taskId);
  const latest = detail.messages.at(-1);

  return {
    action: view.action.status,
    message: latest?.status,
    task: detail.task.status,
  };
};

describe("unknown outcomes are reconciled before any retry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("refuses to retry or restart an unknown attempt and keeps its first outcome", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);

    const taskId = await owner.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });

    const { actionId, attemptId } = await approveAndBegin(
      backend,
      owner,
      taskId
    );

    await backend.mutation(internal.execution.complete, {
      attemptId,
      handleCache: null,
      result: UNKNOWN,
    });

    const unknown = await stateOf(owner, taskId);

    const restart = await backend.mutation(internal.execution.begin, {
      actionId,
    });

    await expect(
      owner.mutation(api.actions.retry, { actionId })
    ).rejects.toThrow(/unknown_outcome/u);

    // A late completion of the same attempt keeps the first recorded outcome.
    await backend.mutation(internal.execution.complete, {
      attemptId,
      handleCache: null,
      result: {
        kind: "succeeded",
        reference: "late",
        summary: "Late success",
        url: null,
      },
    });

    const afterLate = await stateOf(owner, taskId);

    expect(unknown).toStrictEqual({
      action: "unknown",
      message: "unknown",
      task: "needs_attention",
    });
    expect(restart.ok).toBeFalsy();
    expect(afterLate.action).toBe("unknown");
    await expect(outcomesOf(backend, actionId)).resolves.toStrictEqual([
      "unknown",
    ]);
  });

  it("retries only after the person finds it did not go through", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);

    const taskId = await owner.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });

    const { actionId, attemptId } = await approveAndBegin(
      backend,
      owner,
      taskId
    );

    await backend.mutation(internal.execution.complete, {
      attemptId,
      handleCache: null,
      result: UNKNOWN,
    });
    await owner.mutation(api.actions.markOutcome, {
      actionId,
      wentThrough: false,
    });

    const failed = await stateOf(owner, taskId);

    await owner.mutation(api.actions.retry, { actionId });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);

    const done = await stateOf(owner, taskId);

    expect(failed.action).toBe("failed");
    expect(failed.message).toBe("failed");
    expect(done.action).toBe("succeeded");
    await expect(outcomesOf(backend, actionId)).resolves.toStrictEqual([
      "reconciled_not_sent",
      "succeeded",
    ]);
  });

  it("advances the ride journey when the person confirms an unknown send went through", async () => {
    const backend = newBackend();
    const { contactId, owner, ownerId } = await ownerWithContact(backend, true);

    const appointmentId = await owner.mutation(api.appointments.create, {
      location: "Riverside Family Medicine",
      notes: null,
      startsAt: Date.now() + 3 * DAY,
      title: "Dr. Patel",
    });

    const taskId = await backend.run(async (ctx) => {
      const ownerDoc = await ctx.db.get(ownerId);
      const contact = await ctx.db.get(contactId);
      const appointment = await ctx.db.get(appointmentId);

      if (ownerDoc === null || contact === null || appointment === null) {
        throw new Error("missing seed rows");
      }

      return await startRideRequest(ctx, {
        appointment,
        appointmentOptions: [],
        contact,
        contactOptions: [],
        mode: "simulated",
        origin: "text",
        owner: ownerDoc,
        request: "Ask Sam for a ride to Dr. Patel",
      });
    });

    const { actionId, attemptId } = await approveAndBegin(
      backend,
      owner,
      taskId
    );

    await backend.mutation(internal.execution.complete, {
      attemptId,
      handleCache: null,
      result: UNKNOWN,
    });
    await owner.mutation(api.actions.markOutcome, {
      actionId,
      wentThrough: true,
    });

    const after = await owner.query(api.tasks.detail, { taskId });
    const waitStep = after.steps.find((step) => step.kind === "await_reply");

    expect({
      ride: after.appointment?.rideStatus,
      task: after.task.status,
      wait: waitStep?.status,
    }).toStrictEqual({
      ride: "asked",
      task: "waiting_for_reply",
      wait: "waiting",
    });
  });

  it("marks an attempt that never reported back as unknown", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);

    const taskId = await owner.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });

    const { actionId, attemptId } = await approveAndBegin(
      backend,
      owner,
      taskId
    );

    await backend.run(async (ctx) => {
      await ctx.db.patch(attemptId, { startedAt: Date.now() - 11 * 60_000 });
    });

    const marked = await backend.mutation(
      internal.maintenance.markStalledAttempts,
      {}
    );

    const state = await stateOf(owner, taskId);

    expect(marked).toBe(1);
    expect(state.action).toBe("unknown");
    await expect(outcomesOf(backend, actionId)).resolves.toStrictEqual([
      "unknown",
    ]);
  });
});
