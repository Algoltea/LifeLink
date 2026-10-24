import { describe, expect, it } from "vitest";

import { api } from "../convex/_generated/api";
import { createTask } from "../convex/lib/journey";
import { createAction, reviseAction } from "../convex/lib/lifecycle";
import { newBackend, onlyAction, ownerWithContact } from "./harness";

describe("approval binds to one exact version", () => {
  it("rejects an approval of details that have since changed", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);

    const taskId = await owner.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });

    const { current, view } = await onlyAction(owner, taskId);

    await expect(
      owner.mutation(api.actions.approve, {
        actionId: view.action._id,
        fingerprint: "not-the-current-fingerprint",
        method: "tap",
        version: current.version,
      })
    ).rejects.toThrow(/changed/u);

    await expect(
      owner.mutation(api.actions.approve, {
        actionId: view.action._id,
        fingerprint: current.fingerprint,
        method: "tap",
        version: current.version + 1,
      })
    ).rejects.toThrow(/changed/u);
  });

  it("invalidates an approval when consequential details change", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);

    const taskId = await owner.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });

    const { current, view } = await onlyAction(owner, taskId);

    await owner.mutation(api.actions.approve, {
      actionId: view.action._id,
      fingerprint: current.fingerprint,
      method: "keyboard",
      version: current.version,
    });

    const result = await owner.mutation(api.actions.revise, {
      actionId: view.action._id,
      body: "Hello Sam, call me",
    });

    const after = await onlyAction(owner, taskId);

    expect(result.approvalInvalidated).toBeTruthy();
    expect(after.view.action.status).toBe("awaiting_approval");
    expect(after.view.currentApproval).toBeNull();
    expect(after.view.invalidatedApprovals).toHaveLength(1);
    expect(after.current.fingerprint).not.toBe(current.fingerprint);
  });

  it("keeps an approval when only display details change", async () => {
    const backend = newBackend();
    const { contactId, owner } = await ownerWithContact(backend, true);

    const taskId = await owner.mutation(api.messages.draft, {
      body: "Hello Sam",
      contactId,
      photoIds: [],
    });

    const { current, view } = await onlyAction(owner, taskId);

    await owner.mutation(api.actions.approve, {
      actionId: view.action._id,
      fingerprint: current.fingerprint,
      method: "tap",
      version: current.version,
    });

    const result = await backend.run(async (ctx) => {
      const action = await ctx.db.get(view.action._id);

      if (action === null || current.details.kind !== "send_message") {
        throw new Error("missing action");
      }

      return await reviseAction(ctx, action, {
        ambiguities: [],
        details: { ...current.details, contactName: "Sam A." },
        proposedBy: "system",
        reason: "Shorter display name.",
      });
    });

    const after = await onlyAction(owner, taskId);

    expect(result.approvalInvalidated).toBeFalsy();
    expect(after.view.action.status).toBe("approved");
    expect(after.view.currentApproval).not.toBeNull();
    expect(after.current.fingerprint).toBe(current.fingerprint);
  });

  it("blocks approval until an open question is answered", async () => {
    const backend = newBackend();
    const { contactId, owner, ownerId } = await ownerWithContact(backend, true);

    const taskId = await backend.run(async (ctx) => {
      const created = await createTask(ctx, {
        appointmentId: null,
        contactId,
        kind: "send_message",
        mode: "simulated",
        origin: "text",
        ownerId,
        request: "Tell Sam I'm home",
        steps: [{ kind: "send_message", label: "Message Sam" }],
        title: "Message to Sam",
      });

      await createAction(ctx, {
        ambiguities: [
          {
            field: "recipient",
            options: [{ label: "Sam Alvarez (Son)", value: contactId }],
            question: "Which person did you mean?",
            resolvedValue: null,
          },
        ],
        details: {
          address: "+15555550142",
          body: "I'm home",
          channel: "imessage",
          contactId,
          contactName: "Sam Alvarez",
          kind: "send_message",
          photoIds: [],
        },
        mode: "simulated",
        ownerId,
        proposedBy: "model",
        rationale: null,
        stepId: created.stepIds[0] ?? null,
        taskId: created.taskId,
      });

      return created.taskId;
    });

    const { current, view } = await onlyAction(owner, taskId);

    await expect(
      owner.mutation(api.actions.approve, {
        actionId: view.action._id,
        fingerprint: current.fingerprint,
        method: "tap",
        version: current.version,
      })
    ).rejects.toThrow(/ambiguous/u);

    await owner.mutation(api.actions.resolveAmbiguity, {
      actionId: view.action._id,
      field: "recipient",
      value: contactId,
    });

    const resolved = await onlyAction(owner, taskId);

    await owner.mutation(api.actions.approve, {
      actionId: view.action._id,
      fingerprint: resolved.current.fingerprint,
      method: "tap",
      version: resolved.current.version,
    });

    const approved = await onlyAction(owner, taskId);

    expect(approved.view.action.status).toBe("approved");
  });

  it("blocks a grocery handoff over the per-order spending limit", async () => {
    const backend = newBackend();
    const { owner } = await ownerWithContact(backend, true);

    const listId = await owner.mutation(api.groceries.createList, {
      name: "Weekly groceries",
    });

    await owner.mutation(api.groceries.addItem, {
      estimatedCents: 9000,
      listId,
      name: "Big shop",
      quantity: 1,
      unit: null,
    });
    await owner.mutation(api.groceries.setLimit, {
      monthlyCents: null,
      perOrderCents: 8000,
    });

    const taskId = await owner.mutation(api.groceries.proposeHandoff, {
      listId,
    });

    const { current, view } = await onlyAction(owner, taskId);

    await expect(
      owner.mutation(api.actions.approve, {
        actionId: view.action._id,
        fingerprint: current.fingerprint,
        method: "tap",
        version: current.version,
      })
    ).rejects.toThrow(/grocery limit/u);
  });
});
