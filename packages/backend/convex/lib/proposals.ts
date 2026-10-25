import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
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
import type { RecipientMatch, RideDestination } from "./journey";
import { createAction } from "./lifecycle";
import { ownerLocale } from "./locale";
import { resolveMessageRecipients } from "./messageRecipients";
import { proposalMessagesFor } from "./proposalMessages";
import { DAY, MINUTE, formatDay, formatWhen, parseAbsoluteIso } from "./time";

const UPCOMING_WINDOW = 45 * DAY;
const MAX_GROCERY_ITEMS = 50;

interface ProposalOutcome {
  message: string;
  taskId: Id<"tasks"> | null;
}

interface Planning {
  contacts: Doc<"contacts">[];
  ctx: MutationCtx;
  locale: InterfaceLocale;
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

const ridePreparedMessage = (
  ride: { startsAt: number; title: string } | null,
  contact: Doc<"contacts"> | null,
  timeZone: string,
  locale: InterfaceLocale
): string =>
  proposalMessagesFor(locale).ridePrepared(
    contact === null ? null : firstName(contact.name),
    ride === null
      ? null
      : {
          day: formatDay(ride.startsAt, timeZone, intlLocaleOf(locale)),
          title: ride.title,
        }
  );

/**
 * A ride to a place the person named, such as the store or church, when it is
 * not one of their saved appointments. It needs a clear time to ask for.
 */
const rideDestinationOf = (
  proposal: Proposal,
  proposedAppointment: Doc<"appointments"> | null,
  now: number
): RideDestination | "needs_time" | null => {
  const place = proposal.rideDestination?.trim() ?? "";

  if (proposedAppointment !== null || place.length === 0) {
    return null;
  }

  const startsAt = parseAbsoluteIso(proposal.dateTimeIso);

  return startsAt === null || startsAt < now
    ? "needs_time"
    : { place, startsAt };
};

const proposeRide = async (planning: Planning): Promise<ProposalOutcome> => {
  const { ctx, locale, now, owner, proposal } = planning;

  const appointments = await ctx.db
    .query("appointments")
    .withIndex("by_owner_start", (index) =>
      index
        .eq("ownerId", owner._id)
        .gte("startsAt", now)
        .lte("startsAt", now + UPCOMING_WINDOW)
    )
    .collect();

  const proposedAppointment =
    appointments.find(
      (appointment) => appointment._id === proposal.appointmentId
    ) ?? null;

  const destination = rideDestinationOf(proposal, proposedAppointment, now);

  if (destination === "needs_time") {
    return outcome(proposalMessagesFor(locale).whichRideTime);
  }

  if (destination === null && appointments.length === 0) {
    return outcome(proposalMessagesFor(locale).noAppointment);
  }

  const onlyAppointment =
    appointments.length === 1 ? (appointments[0] ?? null) : null;

  const appointment =
    destination === null ? (proposedAppointment ?? onlyAppointment) : null;

  const reachable = planning.contacts.filter(
    (contact) => contact.trusted && channelFor(contact) !== null
  );

  const [recipient] = proposal.recipients;
  const match = recipientMatchFor(reachable, proposal);

  if (recipient !== undefined && match.kind === "none") {
    return outcome(
      proposalMessagesFor(locale).missingTrustedContact(recipient.nameAsSaid)
    );
  }

  if (reachable.length === 0) {
    return outcome(proposalMessagesFor(locale).noTrustedRoute);
  }

  const contact = match.kind === "one" ? match.contact : null;
  const contactOptions = match.kind === "many" ? match.contacts : reachable;

  const taskId = await startRideRequest(ctx, {
    appointment,
    appointmentOptions:
      appointment === null && destination === null ? appointments : [],
    contact,
    contactOptions: contact === null ? contactOptions : [],
    destination,
    mode: planning.mode,
    origin: planning.origin,
    owner,
    request: planning.request,
  });

  return outcome(
    ridePreparedMessage(
      appointment ??
        (destination === null
          ? null
          : { startsAt: destination.startsAt, title: destination.place }),
      contact,
      owner.timeZone,
      locale
    ),
    taskId
  );
};

const proposeMessage = async (planning: Planning): Promise<ProposalOutcome> => {
  const { ctx, locale, owner, proposal } = planning;

  const body = proposal.messageDraft?.trim() ?? "";

  if (body.length === 0) {
    return outcome("What would you like the message to say?");
  }

  const resolved = resolveMessageRecipients(
    planning.contacts,
    proposal.recipients
  );

  if (resolved.error) {
    return outcome(resolved.error);
  }

  const { contacts } = resolved;

  if (contacts.length === 0) {
    return outcome(proposalMessagesFor(locale).whichRecipient);
  }

  const { stepIds, taskId } = await createTask(ctx, {
    appointmentId: null,
    contactId: contacts.length === 1 ? (contacts[0]?._id ?? null) : null,
    kind: "send_message",
    mode: planning.mode,
    origin: planning.origin,
    ownerId: owner._id,
    request: planning.request,
    steps: contacts.map((contact) => ({
      kind: "send_message",
      label: `Message ${contact.name}`,
    })),
    title: `Message to ${contacts.map((contact) => contact.name).join(", ")}`,
  });

  await Promise.all(
    contacts.map(async (contact, index) => {
      const channel = channelFor(contact);

      if (channel === null) {
        throw new Error(`${contact.name} has no saved messaging channel.`);
      }

      await createAction(ctx, {
        ambiguities: [],
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
        stepId: stepIds[index] ?? null,
        taskId,
      });
    })
  );

  return outcome(
    contacts.length === 1
      ? proposalMessagesFor(locale).messagePrepared(
          firstName(contacts[0]?.name ?? "")
        )
      : `I've prepared separate messages for ${contacts.map((contact) => contact.name).join(", ")}, using each person's saved communication preference. Review and approve each message below. Nothing has been sent.`,
    taskId
  );
};

const proposeReminder = async (
  planning: Planning
): Promise<ProposalOutcome> => {
  const { ctx, locale, owner, proposal } = planning;
  const remindAt = parseAbsoluteIso(proposal.dateTimeIso);
  const title = proposal.reminderTitle?.trim() ?? "";

  if (remindAt === null || remindAt < planning.now || title.length === 0) {
    return outcome(proposalMessagesFor(locale).whichReminder);
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
    proposalMessagesFor(locale).reminderPrepared(
      title,
      formatWhen(remindAt, owner.timeZone, intlLocaleOf(locale))
    ),
    taskId
  );
};

const APPOINTMENT_LENGTH = 60 * MINUTE;
const MAX_APPOINTMENT_TITLE = 120;
const MAX_APPOINTMENT_LOCATION = 200;

/** An appointment the model heard about waits in the chat until the person approves adding it. */
const proposeAppointment = async (
  planning: Planning
): Promise<ProposalOutcome> => {
  const { ctx, locale, owner, proposal } = planning;
  const startsAt = parseAbsoluteIso(proposal.dateTimeIso);

  const title = (proposal.appointmentTitle ?? "")
    .trim()
    .slice(0, MAX_APPOINTMENT_TITLE);

  if (startsAt === null || startsAt < planning.now || title.length === 0) {
    return outcome(proposalMessagesFor(locale).whichAppointment);
  }

  const location =
    proposal.appointmentLocation?.trim().slice(0, MAX_APPOINTMENT_LOCATION) ||
    null;

  const { stepIds, taskId } = await createTask(ctx, {
    appointmentId: null,
    contactId: null,
    kind: "create_appointment",
    mode: planning.mode,
    origin: planning.origin,
    ownerId: owner._id,
    request: planning.request,
    steps: [{ kind: "create_appointment", label: "Add the appointment" }],
    title: `Appointment: ${title}`,
  });

  await createAction(ctx, {
    ambiguities: [],
    details: {
      endsAt: startsAt + APPOINTMENT_LENGTH,
      kind: "create_appointment",
      location,
      notes: null,
      startsAt,
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
    proposalMessagesFor(locale).appointmentPrepared(
      title,
      formatWhen(startsAt, owner.timeZone, intlLocaleOf(locale))
    ),
    taskId
  );
};

/** Adding items to the person's own list is reversible and spends nothing, so it needs no approval. */
const addGroceries = async (planning: Planning): Promise<ProposalOutcome> => {
  const { ctx, locale, now, owner } = planning;
  const items = planning.proposal.groceryItems.slice(0, MAX_GROCERY_ITEMS);

  if (items.length === 0) {
    return outcome(proposalMessagesFor(locale).whichGroceries);
  }

  // The newest current list is this week's; the usual list is the template.
  const lists = await ctx.db
    .query("groceryLists")
    .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
    .order("desc")
    .collect();

  const current = lists.filter((list) => list.archivedAt === undefined);
  const existing = current.find((list) => list.usual !== true) ?? current.at(0);

  const listId =
    existing?._id ??
    (await ctx.db.insert("groceryLists", {
      budgetCents: null,
      items: [],
      lastHandoff: null,
      name: proposalMessagesFor(locale).groceryListName,
      ownerId: owner._id,
      preferences: [],
      updatedAt: now,
    }));

  const list = await ctx.db.get(listId);

  if (list === null) {
    return outcome(proposalMessagesFor(locale).whichGroceries);
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
    proposalMessagesFor(locale).groceriesAdded(
      items.map((item) => item.name).join(", "),
      list.name
    )
  );
};

const startScamCheck = async (planning: Planning): Promise<ProposalOutcome> => {
  await planning.ctx.scheduler.runAfter(0, internal.scam.reviewFromAssistant, {
    ownerId: planning.owner._id,
    text: planning.request,
  });

  return outcome(proposalMessagesFor(planning.locale).scamChecking);
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
    locale: await ownerLocale(ctx, owner._id),
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

    case "create_appointment": {
      return await proposeAppointment(planning);
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
