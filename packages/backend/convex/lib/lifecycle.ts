/**
 * The approval and execution state machine.
 *
 *   awaiting_approval ──approve──▶ approved ──begin──▶ executing ──▶ succeeded
 *          ▲                          │                    │
 *          └──── revise (new version) ┘                    ├──▶ failed  (safe to retry)
 *                                                          └──▶ unknown (reconcile first)
 *
 * Approval binds to one version and its fingerprint. A revision that changes
 * consequential details invalidates the approval. Execution re-checks
 * identity, permissions, capabilities, and spending before every attempt.
 */
import { consequentialDetails } from "@lifelink/contracts/actions";
import type { ActionDetails } from "@lifelink/contracts/actions";
import { fingerprint } from "@lifelink/contracts/fingerprint";
import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { audit } from "./audit";
import { executionProblems } from "./capabilities";
import type { Mode } from "./capabilities";
import { markIntroduced } from "./imessage";

interface Ambiguity {
  field: string;
  options: { label: string; value: string }[];
  question: string;
  resolvedValue: string | null;
}

interface NewAction {
  ambiguities: Ambiguity[];
  details: ActionDetails;
  mode: Mode;
  ownerId: Id<"profiles">;
  proposedBy: "model" | "person" | "system";
  rationale: string | null;
  stepId: Id<"taskSteps"> | null;
  taskId: Id<"tasks">;
}

const fingerprintOf = async (details: ActionDetails): Promise<string> =>
  await fingerprint(consequentialDetails(details));

const currentVersionOf = async (
  ctx: MutationCtx,
  action: Doc<"actions">
): Promise<Doc<"actionVersions">> => {
  const version = await ctx.db
    .query("actionVersions")
    .withIndex("by_action_version", (index) =>
      index.eq("actionId", action._id).eq("version", action.currentVersion)
    )
    .unique();

  if (version === null) {
    throw new ConvexError({
      code: "corrupt",
      message: "This action is missing its details.",
    });
  }

  return version;
};

const createAction = async (
  ctx: MutationCtx,
  input: NewAction
): Promise<Id<"actions">> => {
  const now = Date.now();

  const actionId = await ctx.db.insert("actions", {
    createdAt: now,
    currentVersion: 1,
    kind: input.details.kind,
    mode: input.mode,
    ownerId: input.ownerId,
    status: "awaiting_approval",
    stepId: input.stepId,
    taskId: input.taskId,
    updatedAt: now,
  });

  await ctx.db.insert("actionVersions", {
    actionId,
    ambiguities: input.ambiguities,
    createdAt: now,
    details: input.details,
    fingerprint: await fingerprintOf(input.details),
    proposedBy: input.proposedBy,
    rationale: input.rationale,
    version: 1,
  });

  if (input.stepId !== null) {
    await ctx.db.patch(input.stepId, {
      actionId,
      status: "awaiting_approval",
      updatedAt: now,
    });
  }

  return actionId;
};

interface Revision {
  ambiguities: Ambiguity[];
  details: ActionDetails;
  proposedBy: "model" | "person" | "system";
  reason: string;
}

interface RevisionResult {
  approvalInvalidated: boolean;
  version: number;
}

/** Store a new version. Consequential changes invalidate any approval of older versions. */
const reviseAction = async (
  ctx: MutationCtx,
  action: Doc<"actions">,
  revision: Revision
): Promise<RevisionResult> => {
  if (action.status !== "awaiting_approval" && action.status !== "approved") {
    throw new ConvexError({
      code: "locked",
      message: "This can no longer be changed because it has already started.",
    });
  }

  if (revision.details.kind !== action.kind) {
    throw new ConvexError({
      code: "invalid",
      message: "An action cannot change into a different kind of action.",
    });
  }

  const previous = await currentVersionOf(ctx, action);
  const nextFingerprint = await fingerprintOf(revision.details);
  const consequentialChange = nextFingerprint !== previous.fingerprint;
  const now = Date.now();
  const version = action.currentVersion + 1;

  await ctx.db.insert("actionVersions", {
    actionId: action._id,
    ambiguities: revision.ambiguities,
    createdAt: now,
    details: revision.details,
    fingerprint: nextFingerprint,
    proposedBy: revision.proposedBy,
    rationale: revision.reason,
    version,
  });

  let approvalInvalidated = false;

  if (consequentialChange) {
    const approvals = await ctx.db
      .query("approvals")
      .withIndex("by_action", (index) => index.eq("actionId", action._id))
      .collect();

    const stillValid = approvals.filter(
      (approval) => approval.invalidatedAt === null
    );

    await Promise.all(
      stillValid.map(
        async (approval) =>
          await ctx.db.patch(approval._id, {
            invalidatedAt: now,
            invalidatedReason: revision.reason,
          })
      )
    );
    approvalInvalidated = stillValid.length > 0;
  }

  await ctx.db.patch(action._id, {
    currentVersion: version,
    status: consequentialChange ? "awaiting_approval" : action.status,
    updatedAt: now,
  });

  if (consequentialChange && action.stepId !== null) {
    await ctx.db.patch(action.stepId, {
      status: "awaiting_approval",
      updatedAt: now,
    });
  }

  if (!consequentialChange && approvalInvalidated === false) {
    // Display-only change: carry an existing approval forward to the new version.
    const approvals = await ctx.db
      .query("approvals")
      .withIndex("by_action", (index) =>
        index.eq("actionId", action._id).eq("version", previous.version)
      )
      .collect();

    const carried = approvals.filter(
      (approval) => approval.invalidatedAt === null
    );

    await Promise.all(
      carried.map(
        async (approval) =>
          await ctx.db.insert("approvals", {
            actionId: action._id,
            approvedAt: approval.approvedAt,
            approvedByProfileId: approval.approvedByProfileId,
            fingerprint: approval.fingerprint,
            invalidatedAt: null,
            invalidatedReason: null,
            method: approval.method,
            recurringAuthorizationId: approval.recurringAuthorizationId,
            version,
          })
      )
    );
  }

  await audit(ctx, {
    actor: revision.proposedBy === "person" ? "person" : revision.proposedBy,
    detail: consequentialChange
      ? `Version ${version}: ${revision.reason}${approvalInvalidated ? " Earlier approval no longer applies." : ""}`
      : `Version ${version}: ${revision.reason} (no change to what will happen)`,
    event: "action.revised",
    ownerId: action.ownerId,
    taskId: action.taskId,
  });

  return { approvalInvalidated, version };
};

interface ApprovalRequest {
  fingerprint: string;
  method: "keyboard" | "offline_queue" | "tap";
  version: number;
}

/** Validate everything, then record the approval for exactly this version. */
const approveAction = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">,
  action: Doc<"actions">,
  request: ApprovalRequest
): Promise<Id<"approvals">> => {
  if (action.ownerId !== owner._id || owner.role !== "owner") {
    throw new ConvexError({
      code: "not_found",
      message: "That could not be found.",
    });
  }

  if (action.status !== "awaiting_approval") {
    throw new ConvexError({
      code: "not_awaiting",
      message:
        action.status === "approved"
          ? "This is already approved."
          : "This is not waiting for approval.",
    });
  }

  const current = await currentVersionOf(ctx, action);

  const changedSinceShown =
    request.version !== current.version ||
    request.fingerprint !== current.fingerprint;

  if (changedSinceShown) {
    throw new ConvexError({
      code: "changed",
      message:
        request.method === "offline_queue"
          ? "This changed while you were offline. Please look it over again before approving."
          : "The details changed since you looked. Please review them again.",
    });
  }

  const unresolved = current.ambiguities.filter(
    (ambiguity) => ambiguity.resolvedValue === null
  );

  if (unresolved.length > 0) {
    throw new ConvexError({
      code: "ambiguous",
      message:
        unresolved[0]?.question ?? "Please answer the open question first.",
    });
  }

  const recomputed = await fingerprintOf(current.details);

  if (recomputed !== current.fingerprint) {
    throw new ConvexError({
      code: "corrupt",
      message:
        "These details could not be verified. Please prepare them again.",
    });
  }

  const problems = await executionProblems(
    ctx,
    owner,
    current.details,
    action.mode
  );

  if (problems.length > 0) {
    throw new ConvexError({ code: "blocked", message: problems.join(" ") });
  }

  const now = Date.now();

  const approvalId = await ctx.db.insert("approvals", {
    actionId: action._id,
    approvedAt: now,
    approvedByProfileId: owner._id,
    fingerprint: current.fingerprint,
    invalidatedAt: null,
    invalidatedReason: null,
    method: request.method,
    recurringAuthorizationId: null,
    version: current.version,
  });

  await ctx.db.patch(action._id, { status: "approved", updatedAt: now });

  if (action.stepId !== null) {
    await ctx.db.patch(action.stepId, { status: "running", updatedAt: now });
  }

  await audit(ctx, {
    actor: "person",
    detail: `Approved version ${current.version} (${request.method}).`,
    event: "action.approved",
    ownerId: owner._id,
    taskId: action.taskId,
  });

  return approvalId;
};

/**
 * Approve under a bounded recurring authorization the person created
 * themselves (grocery handoffs only). Every bound is re-checked: not revoked,
 * not expired, uses remaining, and the estimate within the per-use cap.
 */
const approveUnderAuthorization = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">,
  action: Doc<"actions">,
  authorization: Doc<"recurringAuthorizations">
): Promise<{ ok: false; reason: string } | { ok: true }> => {
  const now = Date.now();
  const current = await currentVersionOf(ctx, action);
  const { details } = current;

  if (
    authorization.ownerId !== owner._id ||
    authorization.revokedAt !== null ||
    authorization.expiresAt <= now
  ) {
    return { ok: false, reason: "The standing permission has ended." };
  }

  if (authorization.usesCount >= authorization.maxUses) {
    return {
      ok: false,
      reason:
        "The standing permission has been used the number of times you allowed.",
    };
  }

  if (
    details.kind !== "grocery_handoff" ||
    details.listId !== authorization.listId
  ) {
    return {
      ok: false,
      reason: "The standing permission only covers this grocery list.",
    };
  }

  if (
    details.estimatedCents === null ||
    details.estimatedCents > authorization.maxPerUseCents
  ) {
    return {
      ok: false,
      reason:
        "This list is over the amount you allowed, so it needs your approval.",
    };
  }

  const problems = await executionProblems(ctx, owner, details, action.mode);

  if (
    problems.length > 0 ||
    current.ambiguities.some((ambiguity) => ambiguity.resolvedValue === null)
  ) {
    return {
      ok: false,
      reason: problems.join(" ") || "There is an open question.",
    };
  }

  await ctx.db.insert("approvals", {
    actionId: action._id,
    approvedAt: now,
    approvedByProfileId: owner._id,
    fingerprint: current.fingerprint,
    invalidatedAt: null,
    invalidatedReason: null,
    method: "recurring_authorization",
    recurringAuthorizationId: authorization._id,
    version: current.version,
  });
  await ctx.db.patch(authorization._id, {
    usesCount: authorization.usesCount + 1,
  });
  await ctx.db.patch(action._id, { status: "approved", updatedAt: now });

  if (action.stepId !== null) {
    await ctx.db.patch(action.stepId, { status: "running", updatedAt: now });
  }

  await audit(ctx, {
    actor: "system",
    detail: `Approved under your standing permission (use ${authorization.usesCount + 1} of ${authorization.maxUses}).`,
    event: "action.approved_recurring",
    ownerId: owner._id,
    taskId: action.taskId,
  });

  return { ok: true };
};

interface AttemptStart {
  attemptId: Id<"executionAttempts">;
  details: ActionDetails;
  idempotencyKey: string;
  mode: Mode;
  owner: Doc<"profiles">;
}

type BeginOutcome =
  | { ok: false; reason: string }
  | ({ ok: true } & AttemptStart);

/**
 * Atomically re-validate and open an attempt. Refuses while an earlier attempt
 * is running or its outcome is unknown, and after a success, so a potentially
 * completed action is never sent twice.
 */
const beginAttempt = async (
  ctx: MutationCtx,
  actionId: Id<"actions">,
  provider: string
): Promise<BeginOutcome> => {
  const action = await ctx.db.get(actionId);

  if (action === null) {
    return { ok: false, reason: "The action no longer exists." };
  }

  if (action.status !== "approved") {
    return {
      ok: false,
      reason: `The action is ${action.status.replace("_", " ")}, not approved.`,
    };
  }

  const owner = await ctx.db.get(action.ownerId);

  if (owner === null) {
    return { ok: false, reason: "The account no longer exists." };
  }

  const current = await currentVersionOf(ctx, action);

  const approvals = await ctx.db
    .query("approvals")
    .withIndex("by_action", (index) =>
      index.eq("actionId", action._id).eq("version", current.version)
    )
    .collect();

  const validApproval = approvals.find(
    (approval) =>
      approval.invalidatedAt === null &&
      approval.fingerprint === current.fingerprint
  );

  if (validApproval === undefined) {
    await ctx.db.patch(action._id, {
      status: "awaiting_approval",
      updatedAt: Date.now(),
    });

    return {
      ok: false,
      reason:
        "The approval no longer matches the details, so it needs approving again.",
    };
  }

  const attempts = await ctx.db
    .query("executionAttempts")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .collect();

  const blocking = attempts.find(
    (attempt) =>
      attempt.outcome === "running" ||
      attempt.outcome === "unknown" ||
      attempt.outcome === "succeeded" ||
      attempt.outcome === "reconciled_succeeded"
  );

  if (blocking !== undefined) {
    return {
      ok: false,
      reason:
        blocking.outcome === "unknown"
          ? "An earlier try may have gone through. Check it before trying again."
          : "This has already been done or is in progress.",
    };
  }

  const problems = await executionProblems(
    ctx,
    owner,
    current.details,
    action.mode
  );

  if (problems.length > 0) {
    const now = Date.now();

    await ctx.db.patch(action._id, { status: "failed", updatedAt: now });

    if (action.stepId !== null) {
      await ctx.db.patch(action.stepId, {
        detail: problems.join(" "),
        status: "failed",
        updatedAt: now,
      });
    }

    return { ok: false, reason: problems.join(" ") };
  }

  const now = Date.now();
  // One key per approved version: provider-side de-duplication collapses retries of the same version.
  const idempotencyKey = `${action._id}:v${current.version}`;

  const attemptId = await ctx.db.insert("executionAttempts", {
    actionId: action._id,
    attemptNumber: attempts.length + 1,
    error: null,
    fingerprint: current.fingerprint,
    finishedAt: null,
    idempotencyKey,
    mode: action.mode,
    outcome: "running",
    provider,
    startedAt: now,
    version: current.version,
  });

  await ctx.db.patch(action._id, { status: "executing", updatedAt: now });

  return {
    attemptId,
    details: current.details,
    idempotencyKey,
    mode: action.mode,
    ok: true,
    owner,
  };
};

type AttemptResult =
  | { kind: "failed_safe"; error: string }
  | {
      kind: "succeeded";
      reference: string | null;
      summary: string;
      url: string | null;
    }
  | { kind: "unknown"; error: string };

/** Record the outcome of an attempt. Returns the updated action. */
const finishAttempt = async (
  ctx: MutationCtx,
  attemptId: Id<"executionAttempts">,
  result: AttemptResult
): Promise<Doc<"actions">> => {
  const attempt = await ctx.db.get(attemptId);

  if (attempt === null) {
    throw new ConvexError({ code: "not_found", message: "Attempt not found." });
  }

  const action = await ctx.db.get(attempt.actionId);

  if (action === null) {
    throw new ConvexError({ code: "not_found", message: "Action not found." });
  }

  if (attempt.outcome !== "running") {
    // A late duplicate completion: keep the first recorded outcome.
    return action;
  }

  const now = Date.now();

  if (result.kind === "succeeded") {
    await ctx.db.patch(attempt._id, { finishedAt: now, outcome: "succeeded" });
    await markIntroduced(ctx, attempt);
    await ctx.db.insert("providerReceipts", {
      actionId: action._id,
      attemptId: attempt._id,
      mode: attempt.mode,
      provider: attempt.provider,
      providerReference: result.reference,
      receivedAt: now,
      summary: result.summary,
      url: result.url,
    });
    await ctx.db.patch(action._id, { status: "succeeded", updatedAt: now });

    if (action.stepId !== null) {
      await ctx.db.patch(action.stepId, {
        detail: result.summary,
        status: "succeeded",
        updatedAt: now,
      });
    }
  } else if (result.kind === "failed_safe") {
    await ctx.db.patch(attempt._id, {
      error: result.error,
      finishedAt: now,
      outcome: "failed_safe",
    });
    await ctx.db.patch(action._id, { status: "failed", updatedAt: now });

    if (action.stepId !== null) {
      await ctx.db.patch(action.stepId, {
        detail: result.error,
        status: "failed",
        updatedAt: now,
      });
    }
  } else {
    await ctx.db.patch(attempt._id, {
      error: result.error,
      finishedAt: now,
      outcome: "unknown",
    });
    await ctx.db.patch(action._id, { status: "unknown", updatedAt: now });

    if (action.stepId !== null) {
      await ctx.db.patch(action.stepId, {
        detail: result.error,
        status: "unknown",
        updatedAt: now,
      });
    }
  }

  await audit(ctx, {
    actor: attempt.mode === "live" ? "provider" : "system",
    detail: result.kind === "succeeded" ? result.summary : result.error,
    event: `action.${result.kind}`,
    ownerId: action.ownerId,
    taskId: action.taskId,
  });

  const updated = await ctx.db.get(action._id);

  if (updated === null) {
    throw new ConvexError({ code: "not_found", message: "Action not found." });
  }

  return updated;
};

const assertNoReconciliation = (action: Doc<"actions">): void => {
  if (
    action.reconciliation !== undefined &&
    action.reconciliation.expiresAt > Date.now()
  ) {
    throw new ConvexError({
      code: "reconciliation_in_progress",
      message:
        "We are still checking this action. Wait for that check to finish.",
    });
  }
};

/** Settle an unknown attempt once the provider (or the person) has said what happened. */
const settleUnknownAttempt = async (
  ctx: MutationCtx,
  action: Doc<"actions">,
  wentThrough: boolean,
  summary: string,
  reconciliationToken?: string
): Promise<void> => {
  if (reconciliationToken === undefined) {
    assertNoReconciliation(action);
  } else if (
    action.reconciliation?.token !== reconciliationToken ||
    action.reconciliation.expiresAt <= Date.now()
  ) {
    throw new ConvexError({
      code: "stale_reconciliation",
      message: "This check has expired.",
    });
  }

  const attempts = await ctx.db
    .query("executionAttempts")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .collect();

  const unknown = attempts.find(
    (attempt) =>
      attempt.outcome === "unknown" &&
      (reconciliationToken === undefined ||
        attempt._id === action.reconciliation?.attemptId)
  );

  if (unknown === undefined || action.status !== "unknown") {
    throw new ConvexError({
      code: "not_unknown",
      message: "There is nothing to check for this one.",
    });
  }

  // A missing message is not proof that an uncertain Spectrum request cannot
  // arrive later. This also fences original sends recovered by maintenance.
  if (
    !wentThrough &&
    unknown.provider === "photon" &&
    unknown.mode === "live"
  ) {
    throw new ConvexError({
      code: "unknown_outcome",
      message:
        "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.",
    });
  }

  const now = Date.now();

  await ctx.db.patch(unknown._id, {
    finishedAt: now,
    outcome: wentThrough ? "reconciled_succeeded" : "reconciled_not_sent",
  });

  if (wentThrough) {
    await markIntroduced(ctx, unknown);
    await ctx.db.insert("providerReceipts", {
      actionId: action._id,
      attemptId: unknown._id,
      mode: unknown.mode,
      provider: unknown.provider,
      providerReference: null,
      receivedAt: now,
      summary,
      url: null,
    });
  }

  await ctx.db.patch(action._id, {
    reconciliation: undefined,
    status: wentThrough ? "succeeded" : "failed",
    updatedAt: now,
  });

  if (action.stepId !== null) {
    await ctx.db.patch(action.stepId, {
      detail: summary,
      status: wentThrough ? "succeeded" : "failed",
      updatedAt: now,
    });
  }

  await audit(ctx, {
    actor: "system",
    detail: summary,
    event: wentThrough
      ? "action.reconciled_succeeded"
      : "action.reconciled_not_sent",
    ownerId: action.ownerId,
    taskId: action.taskId,
  });
};

/** Re-open a safely failed action for another attempt under the same approval. */
const prepareRetry = async (
  ctx: MutationCtx,
  action: Doc<"actions">
): Promise<void> => {
  assertNoReconciliation(action);

  if (action.status === "unknown") {
    throw new ConvexError({
      code: "unknown_outcome",
      message:
        "We are not sure the last try failed. Check whether it went through before trying again.",
    });
  }

  if (action.status !== "failed") {
    throw new ConvexError({
      code: "not_failed",
      message: "Only something that failed can be tried again.",
    });
  }

  const attempts = await ctx.db
    .query("executionAttempts")
    .withIndex("by_action", (index) => index.eq("actionId", action._id))
    .collect();

  const unsafe = attempts.some(
    (attempt) => attempt.outcome === "unknown" || attempt.outcome === "running"
  );

  if (unsafe) {
    throw new ConvexError({
      code: "unknown_outcome",
      message: "An earlier try is still unresolved.",
    });
  }

  const now = Date.now();

  await ctx.db.patch(action._id, { status: "approved", updatedAt: now });

  if (action.stepId !== null) {
    await ctx.db.patch(action.stepId, { status: "running", updatedAt: now });
  }
};

export {
  approveAction,
  approveUnderAuthorization,
  assertNoReconciliation,
  beginAttempt,
  createAction,
  currentVersionOf,
  finishAttempt,
  fingerprintOf,
  prepareRetry,
  reviseAction,
  settleUnknownAttempt,
};

export type { Ambiguity, AttemptResult, BeginOutcome };
