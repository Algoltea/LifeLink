/**
 * Turn a proposal (from the Agent's tool call, or the demo rules planner)
 * into tasks and actions awaiting approval. Every contact id, appointment id,
 * and time is resolved against stored data here; nothing the model says is
 * trusted, and nothing consequential happens until the person approves.
 * The returned message is written by the server, never by the model.
 */
import type { Proposal } from "@lifelink/contracts/model-output";

import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { audit } from "./audit";
import {
  channelFor,
  createTask,
  firstName,
  matchRecipient,
  startRideRequest,
} from "./journey";
import type { RecipientMatch } from "./journey";
import { createAction } from "./lifecycle";
import { DAY, formatDay, formatWhen, parseAbsoluteIso } from "./time";

const UPCOMING_WINDOW = 45 * DAY;
const MAX_GROCERY_ITEMS = 50;

interface ProposalOutcome {
  message: string;
  taskId: Id<"tasks"> | null;
}

interface Planning {
  contacts: Doc<"contacts">[];
  ctx: MutationCtx;
  mode: "live" | "simulated";
  now: number;
  origin: Doc<"tasks">["origin"];
  owner: Doc<"profiles">;
  proposal: Proposal;
  request: string;
}

const outcome = (
  message: string,
  taskId: Id<"tasks"> | null = null
): ProposalOutcome => ({ message, taskId });

const recipientMatchFor = (
  contacts: Doc<"contacts">[],
  proposal: Proposal
): RecipientMatch => {
  const [recipient] = proposal.recipients;

  return recipient === undefined
    ? { kind: "none" }
    : matchRecipient(contacts, recipient.contactId, recipient.nameAsSaid);
};

const proposeRide = async (planning: Planning): Promise<ProposalOutcome> => {
  const { ctx, now, owner, proposal } = planning;

  const appointments = await ctx.db
    .query("appointments")
    .withIndex("by_owner_start", (index) =>
      index
        .eq("ownerId", owner._id)
        .gte("startsAt", now)
        .lte("startsAt", now + UPCOMING_WINDOW)
    )
    .collect();

  if (appointments.length === 0) {
    return outcome(
      "I don't see an appointment coming up. Add it on Today first, or open an email about it, and I can ask someone for a ride."
    );
  }

  const proposedAppointment =
    appointments.find(
      (appointment) => appointment._id === proposal.appointmentId
    ) ?? null;

  const onlyAppointment =
    appointments.length === 1 ? (appointments[0] ?? null) : null;

  const appointment = proposedAppointment ?? onlyAppointment;

  const reachable = planning.contacts.filter(
    (contact) => contact.trusted && channelFor(contact) !== null
  );

  const [recipient] = proposal.recipients;
  const match = recipientMatchFor(reachable, proposal);

  if (recipient !== undefined && match.kind === "none") {
    return outcome(
      `I couldn't find ${recipient.nameAsSaid} among the trusted people you can message. You can add them under Trusted circle.`
    );
  }

  if (reachable.length === 0) {
    return outcome(
      "Nobody in your trusted circle can be messaged yet. Add a way to reach them under Trusted circle."
    );
  }

  const contact = match.kind === "one" ? match.contact : null;
  const contactOptions = match.kind === "many" ? match.contacts : reachable;

  const taskId = await startRideRequest(ctx, {
    appointment,
    appointmentOptions: appointment === null ? appointments : [],
    contact,
    contactOptions: contact === null ? contactOptions : [],
    mode: planning.mode,
    origin: planning.origin,
    owner,
    request: planning.request,
  });

  const chosen =
    appointment === null
      ? ""
      : ` for ${appointment.title} on ${formatDay(appointment.startsAt, owner.timeZone)}`;

  const who = contact === null ? "someone" : firstName(contact.name);

  const next =
    contact === null || appointment === null
      ? "First, answer the question on screen. Then read the message and"
      : "Please read it, and";

  return outcome(
    `I've written a message asking ${who} for a ride${chosen}. ${next} press Approve when it looks right. Nothing is sent until you do.`,
    taskId
  );
};

const proposeMessage = async (planning: Planning): Promise<ProposalOutcome> => {
  const { ctx, owner, proposal } = planning;

  const reachable = planning.contacts.filter(
    (contact) => channelFor(contact) !== null
  );

  const [recipient] = proposal.recipients;
  const match = recipientMatchFor(reachable, proposal);
  const body = proposal.messageDraft?.trim() ?? "";

  if (match.kind === "none" || body.length === 0) {
    return outcome(
      recipient === undefined
        ? "Who would you like to write to?"
        : `I couldn't find ${recipient.nameAsSaid} in your contacts.`
    );
  }

  const contact =
    match.kind === "one" ? match.contact : (match.contacts[0] ?? null);

  const channel = contact === null ? null : channelFor(contact);

  if (contact === null || channel === null) {
    return outcome("I couldn't find a way to reach them.");
  }

  const { stepIds, taskId } = await createTask(ctx, {
    appointmentId: null,
    contactId: contact._id,
    kind: "send_message",
    mode: planning.mode,
    origin: planning.origin,
    ownerId: owner._id,
    request: planning.request,
    steps: [
      { kind: "send_message", label: `Message ${firstName(contact.name)}` },
    ],
    title: `Message to ${contact.name}`,
  });

  const ambiguities =
    match.kind === "many"
      ? [
          {
            field: "recipient",
            options: match.contacts.map((option) => ({
              label: `${option.name} (${option.relationship})`,
              value: option._id,
            })),
            question: "Which person did you mean?",
            resolvedValue: null,
          },
        ]
      : [];

  await createAction(ctx, {
    ambiguities,
    details: {
      address: channel.address,
      body,
      channel: channel.channel,
      contactId: contact._id,
      contactName: contact.name,
      kind: "send_message",
      photoIds: [],
    },
    mode: planning.mode,
    ownerId: owner._id,
    proposedBy: "model",
    rationale: null,
    stepId: stepIds[0] ?? null,
    taskId,
  });

  if (match.kind === "many") {
    await ctx.db.patch(taskId, { status: "needs_clarification" });
  }

  const name = match.kind === "many" ? "them" : firstName(contact.name);

  return outcome(
    `I've drafted a message to ${name}. Read it, change anything you like, and press Approve to send it.`,
    taskId
  );
};

const proposeReminder = async (
  planning: Planning
): Promise<ProposalOutcome> => {
  const { ctx, owner, proposal } = planning;
  const remindAt = parseAbsoluteIso(proposal.dateTimeIso);
  const title = proposal.reminderTitle?.trim() ?? "";

  if (remindAt === null || remindAt < planning.now || title.length === 0) {
    return outcome(
      "What should I remind you about, and exactly when? Please give the day and time."
    );
  }

  const { stepIds, taskId } = await createTask(ctx, {
    appointmentId: null,
    contactId: null,
    kind: "create_reminder",
    mode: planning.mode,
    origin: planning.origin,
    ownerId: owner._id,
    request: planning.request,
    steps: [{ kind: "create_reminder", label: "Save the reminder" }],
    title: `Reminder: ${title}`,
  });

  await createAction(ctx, {
    ambiguities: [],
    details: {
      kind: "create_reminder",
      remindAt,
      shareWithCircle: false,
      title,
    },
    mode: planning.mode,
    ownerId: owner._id,
    proposedBy: "model",
    rationale: proposal.dateTimeAsSaid,
    stepId: stepIds[0] ?? null,
    taskId,
  });

  return outcome(
    `I can remind you "${title}" on ${formatWhen(remindAt, owner.timeZone)}. Press Approve to save it.`,
    taskId
  );
};

/** Adding items to the person's own list is reversible and spends nothing, so it needs no approval. */
const addGroceries = async (planning: Planning): Promise<ProposalOutcome> => {
  const { ctx, now, owner } = planning;
  const items = planning.proposal.groceryItems.slice(0, MAX_GROCERY_ITEMS);

  if (items.length === 0) {
    return outcome("Which items would you like on your list?");
  }

  const [existing] = await ctx.db
    .query("groceryLists")
    .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
    .take(1);

  const listId =
    existing?._id ??
    (await ctx.db.insert("groceryLists", {
      budgetCents: null,
      items: [],
      lastHandoff: null,
      name: "Groceries",
      ownerId: owner._id,
      preferences: [],
      updatedAt: now,
    }));

  const list = await ctx.db.get(listId);

  if (list === null) {
    return outcome("Which items would you like on your list?");
  }

  await ctx.db.patch(list._id, {
    items: [
      ...list.items,
      ...items.map((item) => ({
        checked: false,
        estimatedCents: null,
        id: crypto.randomUUID(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })),
    ],
    updatedAt: now,
  });

  return outcome(
    `I added ${items.map((item) => item.name).join(", ")} to your ${list.name} list. Nothing has been ordered.`
  );
};

const startScamCheck = async (planning: Planning): Promise<ProposalOutcome> => {
  await planning.ctx.scheduler.runAfter(0, internal.scam.reviewFromAssistant, {
    ownerId: planning.owner._id,
    text: planning.request,
  });

  return outcome(
    "I'm checking that message now. The result will appear under Scam check in a moment. Please don't click any links in it while you wait."
  );
};

const applyProposal = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">,
  proposal: Proposal,
  request: string,
  origin: Doc<"tasks">["origin"],
  model: string
): Promise<ProposalOutcome> => {
  const contacts = await ctx.db
    .query("contacts")
    .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
    .collect();

  const planning: Planning = {
    contacts,
    ctx,
    mode: owner.demoMode ? "simulated" : "live",
    now: Date.now(),
    origin,
    owner,
    proposal,
    request,
  };

  await audit(ctx, {
    actor: "model",
    detail: `Proposed "${proposal.intent}" (${model}).`,
    event: "assistant.proposed",
    ownerId: owner._id,
  });

  switch (proposal.intent) {
    case "ride_request": {
      return await proposeRide(planning);
    }

    case "send_message": {
      return await proposeMessage(planning);
    }

    case "create_reminder": {
      return await proposeReminder(planning);
    }

    case "grocery_list": {
      return await addGroceries(planning);
    }

    case "scam_check": {
      return await startScamCheck(planning);
    }

    default: {
      return proposal.intent satisfies never;
    }
  }
};

export { UPCOMING_WINDOW, applyProposal };

export type { ProposalOutcome };
