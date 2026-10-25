/**
 * Task journeys. The ride journey keeps each kind of step distinct:
 *   send_message  → the request went out (a receipt, not an answer)
 *   await_reply   → the contact answered (an incoming message)
 *   confirm_arrangement → the person confirmed the ride (their approval)
 *   create_reminder     → a reminder is saved and scheduled
 *   create_appointment  → an appointment is added to the person's week
 *   family_update       → permitted family members can see the plan
 */
import type { ActionDetails } from "@lifelink/contracts/actions";
import type { ReplyClassification } from "@lifelink/contracts/model-output";

import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { audit } from "./audit";
import type { Mode } from "./capabilities";
import { ridePlaceDraft, rideRequestDraft } from "./drafts";
import { createAction } from "./lifecycle";
import type { Ambiguity } from "./lifecycle";
import { contactLocale } from "./locale";
import { activeGrantsWithScope } from "./permissions";
import { MINUTE, formatDay, formatTime, parseAbsoluteIso } from "./time";

type StepKind = Doc<"taskSteps">["kind"];

type TaskKind = Doc<"tasks">["kind"];

type Channel = Doc<"messages">["channel"];

type RideDestination = NonNullable<Doc<"tasks">["destination"]>;

interface NewTask {
  appointmentId: Id<"appointments"> | null;
  contactId: Id<"contacts"> | null;
  destination?: RideDestination;
  kind: TaskKind;
  mode: Mode;
  origin: Doc<"tasks">["origin"];
  ownerId: Id<"profiles">;
  request: string;
  steps: { kind: StepKind; label: string }[];
  title: string;
}

const createTask = async (
  ctx: MutationCtx,
  task: NewTask
): Promise<{ stepIds: Id<"taskSteps">[]; taskId: Id<"tasks"> }> => {
  const now = Date.now();

  const taskId = await ctx.db.insert("tasks", {
    appointmentId: task.appointmentId,
    contactId: task.contactId,
    createdAt: now,
    destination: task.destination,
    kind: task.kind,
    mode: task.mode,
    origin: task.origin,
    ownerId: task.ownerId,
    request: task.request,
    status: "awaiting_approval",
    title: task.title,
    updatedAt: now,
  });

  const stepIds = await Promise.all(
    task.steps.map(
      async (step, order) =>
        await ctx.db.insert("taskSteps", {
          actionId: null,
          detail: null,
          kind: step.kind,
          label: step.label,
          order,
          status: "pending",
          taskId,
          updatedAt: now,
        })
    )
  );

  await audit(ctx, {
    actor: "system",
    detail: task.title,
    event: "task.created",
    ownerId: task.ownerId,
    taskId,
  });

  return { stepIds, taskId };
};

// ── Recipients ────────────────────────────────────────────────────────────

const WORD_SPLIT = /[\s,.'’-]+/u;
const POSSESSIVE = /^(?:my|our)\s+/u;

const normalizeWords = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(POSSESSIVE, "")
    .split(WORD_SPLIT)
    .filter((word) => word.length > 0);

/** Everyday family words mapped to one saved-category word, in both directions. */
const RELATION_SYNONYMS = new Map([
  ["dad", "father"],
  ["daddy", "father"],
  ["gramps", "grandfather"],
  ["gran", "grandmother"],
  ["grandad", "grandfather"],
  ["granddad", "grandfather"],
  ["grandkid", "grandchild"],
  ["grandma", "grandmother"],
  ["grandmom", "grandmother"],
  ["grandpa", "grandfather"],
  ["grandpop", "grandfather"],
  ["granny", "grandmother"],
  ["hubby", "husband"],
  ["kid", "child"],
  ["ma", "mother"],
  ["mama", "mother"],
  ["mom", "mother"],
  ["mommy", "mother"],
  ["mum", "mother"],
  ["mummy", "mother"],
  ["nana", "grandmother"],
  ["pa", "father"],
  ["papa", "father"],
  ["pop", "father"],
  ["pops", "father"],
  ["stepdad", "stepfather"],
  ["stepmom", "stepmother"],
  ["stepmum", "stepmother"],
]);

const canonicalRelation = (word: string): string =>
  RELATION_SYNONYMS.get(word) ?? word;

type RecipientMatch =
  | { contact: Doc<"contacts">; kind: "one" }
  | { contacts: Doc<"contacts">[]; kind: "many" }
  | { kind: "none" };

/** Match a spoken name or relationship to stored contacts; never guess between two. */
const matchRecipient = (
  contacts: Doc<"contacts">[],
  proposedId: string | null,
  nameAsSaid: string
): RecipientMatch => {
  const byId = contacts.find((contact) => contact._id === proposedId);
  const words = normalizeWords(nameAsSaid);

  const matches = contacts.filter((contact) => {
    const nameWords = normalizeWords(contact.name);

    const relationWords = new Set(
      normalizeWords(contact.relationship).map(canonicalRelation)
    );

    return (
      words.length > 0 &&
      words.every(
        (word) =>
          nameWords.includes(word) || relationWords.has(canonicalRelation(word))
      )
    );
  });

  if (
    byId !== undefined &&
    (matches.length === 0 ||
      matches.some((contact) => contact._id === byId._id))
  ) {
    return matches.length > 1
      ? { contacts: matches, kind: "many" }
      : { contact: byId, kind: "one" };
  }

  if (matches.length === 1 && matches[0] !== undefined) {
    return { contact: matches[0], kind: "one" };
  }

  return matches.length > 1
    ? { contacts: matches, kind: "many" }
    : { kind: "none" };
};

/** The contact's preferred channel, or the in-app thread when they have joined. */
const channelFor = (
  contact: Doc<"contacts">
): { address: string; channel: Channel } | null => {
  const preferred =
    contact.channels.find((channel) => channel.preferred) ??
    contact.channels[0];

  if (preferred !== undefined) {
    return { address: preferred.address, channel: preferred.channel };
  }

  return contact.linkedProfileId === null
    ? null
    : { address: contact.linkedProfileId, channel: "in_app" };
};

const firstName = (name: string): string => name.split(" ")[0] ?? name;

const signOff = (owner: Doc<"profiles">): string =>
  owner.signOffName ?? owner.preferredName;

// ── Ride journey ──────────────────────────────────────────────────────────

/** A place ride has no stored id; an appointment always has one. */
const isPlace = (
  ride: Doc<"appointments"> | RideDestination
): ride is RideDestination => !("_id" in ride);

/** The ride request, written in the language the contact reads. */
const rideRequestBody = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">,
  contact: Doc<"contacts">,
  ride: Doc<"appointments"> | RideDestination
): Promise<string> => {
  const locale = await contactLocale(ctx, owner._id, contact);

  if (isPlace(ride)) {
    return ridePlaceDraft(
      {
        firstName: firstName(contact.name),
        place: ride.place,
        signOff: signOff(owner),
        startsAt: ride.startsAt,
        timeZone: owner.timeZone,
      },
      locale
    );
  }

  return rideRequestDraft(
    {
      firstName: firstName(contact.name),
      location: ride.location,
      signOff: signOff(owner),
      startsAt: ride.startsAt,
      timeZone: owner.timeZone,
      title: ride.title,
    },
    locale
  );
};

/** Where a ride goes: the saved appointment, else the place the person named. */
const rideTitleOf = (
  appointment: Doc<"appointments"> | null,
  task: Doc<"tasks">
): string =>
  appointment?.title ?? task.destination?.place ?? "your appointment";

const RIDE_STEPS: { kind: StepKind; label: string }[] = [
  { kind: "send_message", label: "Ask for a ride" },
  { kind: "await_reply", label: "Wait for an answer" },
  { kind: "confirm_arrangement", label: "Confirm the ride" },
  { kind: "create_reminder", label: "Save a reminder" },
  { kind: "family_update", label: "Let family know" },
];

interface RideRequest {
  appointment: Doc<"appointments"> | null;
  appointmentOptions: Doc<"appointments">[];
  contact: Doc<"contacts"> | null;
  contactOptions: Doc<"contacts">[];
  /** A ride to a place the person named, when it is not a saved appointment. */
  destination: RideDestination | null;
  mode: Mode;
  origin: Doc<"tasks">["origin"];
  owner: Doc<"profiles">;
  request: string;
}

/**
 * Create the ride task and its first action. Unclear recipients or dates
 * become ambiguities that block approval until the person picks one.
 */
const startRideRequest = async (
  ctx: MutationCtx,
  input: RideRequest
): Promise<Id<"tasks">> => {
  const contact = input.contact ?? input.contactOptions[0] ?? null;
  const appointment = input.appointment ?? input.appointmentOptions[0] ?? null;
  const ride = appointment ?? input.destination;

  if (contact === null || ride === null) {
    throw new Error(
      "A ride request needs at least one candidate contact and an appointment or a place."
    );
  }

  const ambiguities: Ambiguity[] = [];

  if (input.contact === null) {
    ambiguities.push({
      field: "recipient",
      options: input.contactOptions.map((option) => ({
        label: `${option.name} (${option.relationship})`,
        value: option._id,
      })),
      question: "Who would you like to ask?",
      resolvedValue: null,
    });
  }

  if (appointment !== null && input.appointment === null) {
    ambiguities.push({
      field: "appointment",
      options: input.appointmentOptions.map((option) => ({
        label: `${option.title}, ${formatDay(option.startsAt, input.owner.timeZone)} at ${formatTime(option.startsAt, input.owner.timeZone)}`,
        value: option._id,
      })),
      question: "Which appointment is the ride for?",
      resolvedValue: null,
    });
  }

  const channel = channelFor(contact);

  if (channel === null) {
    throw new Error(`${contact.name} has no way to be reached yet.`);
  }

  const { stepIds, taskId } = await createTask(ctx, {
    appointmentId: appointment?._id ?? null,
    contactId: contact._id,
    destination: isPlace(ride) ? ride : undefined,
    kind: "ride_request",
    mode: input.mode,
    origin: input.origin,
    ownerId: input.owner._id,
    request: input.request,
    steps: RIDE_STEPS,
    title: `Ride to ${isPlace(ride) ? ride.place : ride.title}`,
  });

  if (ambiguities.length > 0) {
    await ctx.db.patch(taskId, { status: "needs_clarification" });
  }

  await createAction(ctx, {
    ambiguities,
    details: {
      address: channel.address,
      body: await rideRequestBody(ctx, input.owner, contact, ride),
      channel: channel.channel,
      contactId: contact._id,
      contactName: contact.name,
      kind: "send_message",
      photoIds: [],
    },
    mode: input.mode,
    ownerId: input.owner._id,
    proposedBy: "system",
    rationale: isPlace(ride)
      ? "Written from the place and time you gave so they match exactly."
      : "Written from the appointment details so the date and time match exactly.",
    stepId: stepIds[0] ?? null,
    taskId,
  });

  return taskId;
};

const stepOfKind = async (
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  kind: StepKind
): Promise<Doc<"taskSteps"> | null> => {
  const steps = await ctx.db
    .query("taskSteps")
    .withIndex("by_task", (index) => index.eq("taskId", taskId))
    .collect();

  return steps.find((step) => step.kind === kind) ?? null;
};

const settleTaskStatus = async (
  ctx: MutationCtx,
  taskId: Id<"tasks">
): Promise<void> => {
  const task = await ctx.db.get(taskId);

  if (task === null || task.status === "cancelled") {
    return;
  }

  const steps = await ctx.db
    .query("taskSteps")
    .withIndex("by_task", (index) => index.eq("taskId", taskId))
    .collect();

  let status: Doc<"tasks">["status"] = "in_progress";

  if (
    steps.every(
      (step) => step.status === "succeeded" || step.status === "skipped"
    )
  ) {
    status = "completed";
  } else if (
    steps.some((step) => step.status === "failed" || step.status === "unknown")
  ) {
    status = "needs_attention";
  } else if (steps.some((step) => step.status === "awaiting_approval")) {
    status = "awaiting_approval";
  } else if (steps.some((step) => step.status === "waiting")) {
    status = "waiting_for_reply";
  }

  await ctx.db.patch(taskId, { status, updatedAt: Date.now() });
};

/** Propose the reminder and the family update once the ride is confirmed. */
const proposeAfterConfirmation = async (
  ctx: MutationCtx,
  task: Doc<"tasks">,
  owner: Doc<"profiles">,
  details: Extract<ActionDetails, { kind: "confirm_arrangement" }>
): Promise<void> => {
  const appointment =
    task.appointmentId === null ? null : await ctx.db.get(task.appointmentId);

  const what = rideTitleOf(appointment, task);
  const pickup = formatTime(details.pickupAt, owner.timeZone);
  const day = formatDay(details.pickupAt, owner.timeZone);
  const reminderStep = await stepOfKind(ctx, task._id, "create_reminder");
  const familyStep = await stepOfKind(ctx, task._id, "family_update");

  const reminderAt = Math.max(
    Date.now() + MINUTE,
    details.pickupAt - 30 * MINUTE
  );

  if (reminderStep !== null) {
    await createAction(ctx, {
      ambiguities: [],
      details: {
        kind: "create_reminder",
        remindAt: reminderAt,
        shareWithCircle: false,
        title: `${firstName(details.contactName)} picks you up at ${pickup} for ${what}`,
      },
      mode: task.mode,
      ownerId: owner._id,
      proposedBy: "system",
      rationale: "A reminder 30 minutes before the pickup.",
      stepId: reminderStep._id,
      taskId: task._id,
    });
  }

  if (familyStep === null) {
    return;
  }

  const grants = await activeGrantsWithScope(ctx, owner._id, "rides.view");

  if (grants.length === 0) {
    await ctx.db.patch(familyStep._id, {
      detail:
        "Nobody in your trusted circle can see ride plans, so no update was shared.",
      status: "skipped",
      updatedAt: Date.now(),
    });

    return;
  }

  await createAction(ctx, {
    ambiguities: [],
    details: {
      granteeIds: grants.map((grant) => grant._id),
      kind: "family_update",
      scope: "rides.view",
      text: `${firstName(details.contactName)} will drive ${owner.preferredName} to ${what} on ${day}. Pickup at ${pickup}.`,
    },
    mode: task.mode,
    ownerId: owner._id,
    proposedBy: "system",
    rationale: "Shared only with people you allowed to see ride plans.",
    stepId: familyStep._id,
    taskId: task._id,
  });
};

/** Apply effects that live inside this app. Runs inside the attempt's mutation, so it happens once. */
const applyLocalEffect = async (
  ctx: MutationCtx,
  action: Doc<"actions">,
  details: ActionDetails,
  owner: Doc<"profiles">
): Promise<string> => {
  switch (details.kind) {
    case "create_reminder": {
      const reminderId = await ctx.db.insert("reminders", {
        createdAt: Date.now(),
        dismissedAt: null,
        firedAt: null,
        mode: action.mode,
        ownerId: owner._id,
        remindAt: details.remindAt,
        scheduledJobId: null,
        shareWithCircle: details.shareWithCircle,
        sourceActionId: action._id,
        title: details.title,
      });

      const jobId = await ctx.scheduler.runAt(
        details.remindAt,
        internal.reminders.fire,
        { reminderId }
      );

      await ctx.db.patch(reminderId, { scheduledJobId: jobId });

      return `Reminder saved for ${formatDay(details.remindAt, owner.timeZone)} at ${formatTime(details.remindAt, owner.timeZone)}.`;
    }

    case "create_appointment": {
      await ctx.db.insert("appointments", {
        createdAt: Date.now(),
        endsAt: details.endsAt,
        location: details.location,
        mode: action.mode,
        notes: details.notes,
        ownerId: owner._id,
        providerName: null,
        ridePickupAt: null,
        rideStatus: "none",
        rideWithContactId: null,
        sourceEmailId: null,
        startsAt: details.startsAt,
        title: details.title,
      });

      await audit(ctx, {
        actor: "person",
        detail: `Added ${details.title}.`,
        event: "appointment.created",
        ownerId: owner._id,
      });

      return `Appointment saved for ${formatDay(details.startsAt, owner.timeZone)} at ${formatTime(details.startsAt, owner.timeZone)}.`;
    }

    case "confirm_arrangement": {
      const appointmentId =
        details.appointmentId === null
          ? null
          : ctx.db.normalizeId("appointments", details.appointmentId);

      const contactId = ctx.db.normalizeId("contacts", details.contactId);

      if (appointmentId !== null) {
        await ctx.db.patch(appointmentId, {
          ridePickupAt: details.pickupAt,
          rideStatus: "confirmed",
          rideWithContactId: contactId,
        });
      }

      return `Ride confirmed: ${details.summary}`;
    }

    case "family_update": {
      const granteeIds = details.granteeIds.flatMap((granteeId) => {
        const id = ctx.db.normalizeId("sharingGrants", granteeId);

        return id === null ? [] : [id];
      });

      await ctx.db.insert("familyUpdates", {
        createdAt: Date.now(),
        granteeIds,
        mode: action.mode,
        ownerId: owner._id,
        scope: details.scope,
        sourceActionId: action._id,
        text: details.text,
      });

      return `Shared with ${granteeIds.length} ${granteeIds.length === 1 ? "person" : "people"} in your trusted circle.`;
    }

    default: {
      throw new Error(`${details.kind} is not a local action.`);
    }
  }
};

const isLocalKind = (kind: ActionDetails["kind"]): boolean =>
  kind === "create_reminder" ||
  kind === "create_appointment" ||
  kind === "confirm_arrangement" ||
  kind === "family_update";

/** Move the task forward after one of its actions succeeded. */
const afterActionSucceeded = async (
  ctx: MutationCtx,
  action: Doc<"actions">,
  details: ActionDetails
): Promise<void> => {
  const task = await ctx.db.get(action.taskId);
  const owner = await ctx.db.get(action.ownerId);

  if (task === null || owner === null) {
    return;
  }

  if (task.kind === "ride_request" && details.kind === "send_message") {
    const waitStep = await stepOfKind(ctx, task._id, "await_reply");

    if (waitStep !== null) {
      await ctx.db.patch(waitStep._id, {
        detail: `Waiting for ${firstName(details.contactName)} to answer.`,
        status: "waiting",
        updatedAt: Date.now(),
      });
    }

    if (task.appointmentId !== null) {
      await ctx.db.patch(task.appointmentId, { rideStatus: "asked" });
    }

    if (action.mode === "simulated") {
      await ctx.scheduler.runAfter(8000, internal.demo.simulateReply, {
        taskId: task._id,
      });
    }
  }

  if (task.kind === "ride_request" && details.kind === "confirm_arrangement") {
    await proposeAfterConfirmation(ctx, task, owner, details);
  }

  await settleTaskStatus(ctx, task._id);
};

const afterActionFailed = async (
  ctx: MutationCtx,
  action: Doc<"actions">
): Promise<void> => {
  await settleTaskStatus(ctx, action.taskId);
};

interface ReplyContext {
  confirmStep: Doc<"taskSteps">;
  contact: Doc<"contacts">;
  name: string;
  now: number;
  owner: Doc<"profiles">;
  reply: Doc<"messages">;
  task: Doc<"tasks">;
  waitStep: Doc<"taskSteps">;
}

/** A declined ride: record the answer, skip the remaining steps, and ask the person what next. */
const applyDeclinedReply = async (
  ctx: MutationCtx,
  reply: ReplyContext
): Promise<void> => {
  const later = await Promise.all(
    (["create_reminder", "family_update"] as const).map(
      async (kind) => await stepOfKind(ctx, reply.task._id, kind)
    )
  );

  await Promise.all([
    ctx.db.patch(reply.waitStep._id, {
      detail: `${reply.name} said: “${reply.reply.body}”`,
      status: "succeeded",
      updatedAt: reply.now,
    }),
    ctx.db.patch(reply.confirmStep._id, {
      detail: `${reply.name} can't drive this time. You could ask someone else.`,
      status: "skipped",
      updatedAt: reply.now,
    }),
    ...later.flatMap((step) =>
      step === null
        ? []
        : [
            ctx.db.patch(step._id, {
              detail: "Not needed because the ride was declined.",
              status: "skipped",
              updatedAt: reply.now,
            }),
          ]
    ),
  ]);

  if (reply.task.appointmentId !== null) {
    await ctx.db.patch(reply.task.appointmentId, { rideStatus: "declined" });
  }

  await ctx.db.patch(reply.task._id, {
    status: "needs_attention",
    updatedAt: reply.now,
  });
};

/** An acceptance proposes a confirmation; an unclear or missing pickup time becomes a question. */
const proposeConfirmation = async (
  ctx: MutationCtx,
  reply: ReplyContext,
  classification: ReplyClassification
): Promise<void> => {
  const { owner, task } = reply;

  const appointment =
    task.appointmentId === null ? null : await ctx.db.get(task.appointmentId);

  const statedPickup = parseAbsoluteIso(classification.pickupTimeIso);

  const startsAt =
    appointment?.startsAt ??
    task.destination?.startsAt ??
    reply.now + 60 * MINUTE;

  const plausiblePickup =
    statedPickup !== null &&
    statedPickup < startsAt &&
    statedPickup > startsAt - 4 * 60 * MINUTE;

  const pickupAt = plausiblePickup ? statedPickup : startsAt - 45 * MINUTE;

  const ambiguities: Ambiguity[] = plausiblePickup
    ? []
    : [
        {
          field: "pickup",
          options: [60, 45, 30].map((minutes) => ({
            label: `${formatTime(startsAt - minutes * MINUTE, owner.timeZone)} (${minutes} minutes before)`,
            value: String(startsAt - minutes * MINUTE),
          })),
          question: `${reply.name} didn't give a clear pickup time. When should you be ready?`,
          resolvedValue: null,
        },
      ];

  await ctx.db.patch(reply.waitStep._id, {
    detail: `${reply.name} said: “${reply.reply.body}”`,
    status: "succeeded",
    updatedAt: reply.now,
  });

  const summary = `${reply.name} will drive you to ${rideTitleOf(appointment, task)} on ${formatDay(pickupAt, owner.timeZone)}, picking you up at ${formatTime(pickupAt, owner.timeZone)}.`;

  await createAction(ctx, {
    ambiguities,
    details: {
      appointmentId: task.appointmentId,
      contactId: reply.contact._id,
      contactName: reply.contact.name,
      kind: "confirm_arrangement",
      pickupAt,
      summary,
    },
    mode: task.mode,
    ownerId: owner._id,
    proposedBy: "model",
    rationale: classification.summary,
    stepId: reply.confirmStep._id,
    taskId: task._id,
  });
  await settleTaskStatus(ctx, task._id);
};

/** Turn a classified reply into the next proposal. The reply itself cannot confirm anything. */
const applyReplyClassification = async (
  ctx: MutationCtx,
  task: Doc<"tasks">,
  reply: Doc<"messages">,
  classification: ReplyClassification
): Promise<void> => {
  const owner = await ctx.db.get(task.ownerId);

  const contact =
    task.contactId === null ? null : await ctx.db.get(task.contactId);

  const waitStep = await stepOfKind(ctx, task._id, "await_reply");
  const confirmStep = await stepOfKind(ctx, task._id, "confirm_arrangement");

  if (
    owner === null ||
    contact === null ||
    waitStep === null ||
    confirmStep === null ||
    waitStep.status !== "waiting"
  ) {
    return;
  }

  const context: ReplyContext = {
    confirmStep,
    contact,
    name: firstName(contact.name),
    now: Date.now(),
    owner,
    reply,
    task,
    waitStep,
  };

  if (classification.decision === "declined") {
    await applyDeclinedReply(ctx, context);

    return;
  }

  if (classification.decision === "unclear") {
    await ctx.db.patch(waitStep._id, {
      detail: `${context.name} replied, but it is not clear yet: “${reply.body}”`,
      updatedAt: context.now,
    });

    return;
  }

  await proposeConfirmation(ctx, context, classification);
};

export {
  afterActionFailed,
  afterActionSucceeded,
  applyLocalEffect,
  applyReplyClassification,
  channelFor,
  createTask,
  firstName,
  isLocalKind,
  matchRecipient,
  rideRequestBody,
  settleTaskStatus,
  signOff,
  startRideRequest,
  stepOfKind,
};

export type { RecipientMatch, RideDestination };
