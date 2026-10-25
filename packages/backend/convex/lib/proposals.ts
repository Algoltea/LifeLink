import { draftProblem } from "@lifelink/contracts/draft-safety";
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
import { assistantMessagesFor } from "./assistantMessages";
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

const normalizeName = (name: string): string =>
  name.normalize("NFKC").trim().replaceAll(/\s+/gu, " ").toLowerCase();

interface ProposalOutcome {
  message: string;
  taskId: Id<"tasks"> | null;
}

interface Planning {
  contacts: Doc<"contacts">[];
  ctx: MutationCtx;
  draftSource: string;
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

// These recognize clock evidence, not dates or instants. Interpretation remains
// a proposal; unrelated copied words cannot establish that a clock was stated.
const CLOCK_EVIDENCE =
  /(?:\p{N}{1,2}[:：]\p{N}{2}|\p{N}{1,2}\s*(?:[ap]\.?m\.?|uhr|h(?:eures?)?|giờ|시|点|點|時)|(?:at|a las|às|à|alle|um|lúc|alas)\s+\p{N}{1,2}\b|\b(?:noon|midnight|mediodía|medianoche|midi|minuit|mezzogiorno|mezzanotte|mittag|mitternacht)\b|正午|午夜|정오|자정)/iu;

// A small clock-phrase vocabulary also permits ordinary voice transcripts.
// This detects evidence only; it never derives a date, offset, or instant.
const ENGLISH_CLOCK_EVIDENCE =
  /\b(?:(?:at|by|around)\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)(?:\s+(?:oh\s+)?(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|(?:twenty|thirty|forty|fifty)(?:[ -](?:one|two|three|four|five|six|seven|eight|nine))?))?|(?:half|quarter)\s+(?:past|to)\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve))\b/iu;

const PICKUP_EVIDENCE =
  /(?:\bpick(?:up| me up)\b|\brecog(?:ida|er|erme)\b|\babhol(?:en|ung)\b|\bchercher\b|\bprelievo\b|\bprendere\b|\bbusc(?:a|ar)\b|\bpagsundo\b|\bsunduin\b|đón|픽업|데리러|接)/iu;

const hasClockEvidence = (text: string): boolean =>
  CLOCK_EVIDENCE.test(text) || ENGLISH_CLOCK_EVIDENCE.test(text);

const isQuotedTime = (
  source: string,
  text: string | null | undefined
): boolean => {
  const quote = text?.trim();

  return (
    quote !== undefined &&
    quote.length > 0 &&
    hasClockEvidence(quote) &&
    source.toLocaleLowerCase().includes(quote.toLocaleLowerCase())
  );
};

const isQuotedPickup = (
  source: string,
  text: string | null | undefined
): boolean => isQuotedTime(source, text) && PICKUP_EVIDENCE.test(text ?? "");

// If a quote explicitly mentions pickup, it cannot establish arrival unless
// it also states a clock after an arrival phrase and before the next pickup.
// Unrecognized role wording clarifies; this does not infer dates or travel time.
const ARRIVAL_EVIDENCE =
  /(?:\b(?:arriv(?:e|ing|al)|be there|get there|reach|llegar|llegada|estar allí|ankunft|ankommen|arriver|arrivée|être là|arrivare|arrivo|chegar|chegada|pagdating|makarating)\b|đến|có mặt|도착|到达|抵达)/iu;

const isQuotedArrival = (
  source: string,
  text: string | null | undefined
): boolean => {
  if (!isQuotedTime(source, text)) {
    return false;
  }

  const quote = text ?? "";

  if (!PICKUP_EVIDENCE.test(quote)) {
    return true;
  }

  const arrival = ARRIVAL_EVIDENCE.exec(quote);

  if (arrival === null) {
    return false;
  }

  const [arrivalClock] = quote
    .slice(arrival.index + arrival[0].length)
    .split(PICKUP_EVIDENCE, 1);

  return hasClockEvidence(arrivalClock ?? "");
};

/**
 * A ride to a place the person named, such as the store or church, when it is
 * not one of their saved appointments. It needs a clear time to ask for.
 */
const rideDestinationOf = (
  planning: Planning
): RideDestination | "needs_time" | null => {
  const { proposal, draftSource, now } = planning;

  if (
    proposal.rideDestination === null ||
    proposal.rideDestination === undefined
  ) {
    return null;
  }

  const place = proposal.rideDestination.trim();
  const startsAt = parseAbsoluteIso(proposal.dateTimeIso);

  if (
    place.length === 0 ||
    !draftSource.toLocaleLowerCase().includes(place.toLocaleLowerCase()) ||
    startsAt === null ||
    startsAt <= now ||
    !isQuotedArrival(draftSource, proposal.dateTimeAsSaid)
  ) {
    return "needs_time";
  }

  return { place, startsAt };
};

const appointmentTimeProblem = (
  planning: Planning,
  appointment: Doc<"appointments"> | null
): string | null => {
  const { locale, owner, proposal } = planning;
  const proposedTime = parseAbsoluteIso(proposal.dateTimeIso);
  const hasAppointmentTime = proposal.dateTimeIso !== null;

  // Model dates are proposals, not evidence that the person stated a time.
  if (
    hasAppointmentTime &&
    (proposedTime === null ||
      !isQuotedTime(planning.draftSource, proposal.dateTimeAsSaid))
  ) {
    return proposalMessagesFor(locale).whichRideTime;
  }

  if (hasAppointmentTime && appointment === null) {
    return proposalMessagesFor(locale).whichRideTime;
  }

  if (
    appointment !== null &&
    proposedTime !== null &&
    Math.floor(proposedTime / MINUTE) !==
      Math.floor(appointment.startsAt / MINUTE)
  ) {
    return proposalMessagesFor(locale).rideTimeConflict(
      formatWhen(proposedTime, owner.timeZone, intlLocaleOf(locale)),
      formatWhen(appointment.startsAt, owner.timeZone, intlLocaleOf(locale)),
      owner.timeZone
    );
  }

  return null;
};

const pickupTimeProblem = (
  planning: Planning,
  appointment: { startsAt: number } | null
): string | null => {
  const { locale, now, proposal } = planning;
  const pickupAt = parseAbsoluteIso(proposal.pickupTimeIso ?? null);

  const hasPickup =
    (proposal.pickupTimeIso ?? proposal.pickupTimeAsSaid ?? null) !== null;

  if (
    hasPickup &&
    (pickupAt === null ||
      !isQuotedPickup(planning.draftSource, proposal.pickupTimeAsSaid))
  ) {
    return proposalMessagesFor(locale).whichRideTime;
  }

  // Resolve appointment choices first rather than attach a pickup to an unknown day.
  if (
    hasPickup &&
    (appointment === null ||
      pickupAt === null ||
      pickupAt <= now ||
      pickupAt >= appointment.startsAt ||
      pickupAt < appointment.startsAt - DAY)
  ) {
    return proposalMessagesFor(locale).whichRideTime;
  }

  return null;
};

type RideTarget =
  | {
      kind: "ready";
      appointment: Doc<"appointments"> | null;
      destination: RideDestination | null;
    }
  | { kind: "clarify"; message: string };

const resolveRideTarget = (
  planning: Planning,
  appointments: Doc<"appointments">[]
): RideTarget => {
  const { locale, proposal } = planning;

  const proposedAppointment =
    appointments.find(
      (appointment) => appointment._id === proposal.appointmentId
    ) ?? null;

  if (
    proposal.appointmentId !== null &&
    (proposedAppointment === null ||
      (proposal.rideDestination ?? null) !== null)
  ) {
    return {
      kind: "clarify",
      message: proposalMessagesFor(locale).whichRideTime,
    };
  }

  const destination = rideDestinationOf(planning);

  if (destination === "needs_time") {
    return {
      kind: "clarify",
      message: proposalMessagesFor(locale).whichRideArrival,
    };
  }

  if (destination === null && appointments.length === 0) {
    return {
      kind: "clarify",
      message: proposalMessagesFor(locale).noAppointment,
    };
  }

  const onlyAppointment =
    appointments.length === 1 ? (appointments[0] ?? null) : null;

  const appointment =
    destination === null ? (proposedAppointment ?? onlyAppointment) : null;

  const timeProblem =
    (destination === null
      ? appointmentTimeProblem(planning, appointment)
      : null) ?? pickupTimeProblem(planning, appointment ?? destination);

  if (timeProblem !== null) {
    return { kind: "clarify", message: timeProblem };
  }

  return { appointment, destination, kind: "ready" };
};

const proposeRide = async (planning: Planning): Promise<ProposalOutcome> => {
  const { ctx, locale, now, owner, proposal } = planning;

  // The ride journey tracks one driver. Never silently discard extra people.
  if (proposal.recipients.length > 1) {
    return outcome(proposalMessagesFor(locale).whichRecipient);
  }

  const appointments = await ctx.db
    .query("appointments")
    .withIndex("by_owner_start", (index) =>
      index
        .eq("ownerId", owner._id)
        .gte("startsAt", now)
        .lte("startsAt", now + UPCOMING_WINDOW)
    )
    .collect();

  const target = resolveRideTarget(planning, appointments);

  if (target.kind === "clarify") {
    return outcome(target.message);
  }

  const { appointment, destination } = target;
  const pickupAt = parseAbsoluteIso(proposal.pickupTimeIso ?? null);

  const reachable = planning.contacts.filter(
    (contact) => contact.trusted && channelFor(contact) !== null
  );

  const [recipient] = proposal.recipients;
  const match = recipientMatchFor(reachable, proposal);

  if (
    recipient !== undefined &&
    (match.kind === "none" ||
      (recipient.contactId !== null &&
        !reachable.some((candidate) => candidate._id === recipient.contactId)))
  ) {
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
    requestedPickupAt: pickupAt,
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

  // Model-authored words obey the same safety boundary as suggested replies.
  // Person-authored edits still go through their separate review flow.
  if (draftProblem(body, planning.draftSource) !== null) {
    return outcome(assistantMessagesFor(locale).invalidProposal);
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

interface GroceryListResolution {
  existing: Doc<"groceryLists"> | undefined;
  valid: boolean;
}

const resolveGroceryList = (
  current: Doc<"groceryLists">[],
  proposal: Proposal
): GroceryListResolution => {
  const { groceryListId, groceryListName } = proposal;
  const explicitId = groceryListId !== null && groceryListId !== undefined;

  const explicitName =
    groceryListName !== null && groceryListName !== undefined;

  const named = explicitName
    ? current.filter(
        (list) => normalizeName(list.name) === normalizeName(groceryListName)
      )
    : [];

  const identified = explicitId
    ? current.find((list) => list._id === groceryListId)
    : undefined;

  if (
    (explicitId && identified === undefined) ||
    (explicitName &&
      (normalizeName(groceryListName).length === 0 || named.length !== 1)) ||
    (explicitId && explicitName && identified?._id !== named[0]?._id)
  ) {
    return { existing: undefined, valid: false };
  }

  let existing = current.find((list) => list.usual !== true) ?? current.at(0);

  if (explicitId) {
    existing = identified;
  } else if (explicitName) {
    [existing] = named;
  }

  return { existing, valid: true };
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
  const { existing, valid } = resolveGroceryList(current, planning.proposal);

  if (!valid) {
    return outcome(proposalMessagesFor(locale).whichGroceryList);
  }

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
  model: string,
  draftSource = request
): Promise<ProposalOutcome> => {
  const contacts = await ctx.db
    .query("contacts")
    .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
    .collect();

  const planning: Planning = {
    contacts,
    ctx,
    draftSource,
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

export { UPCOMING_WINDOW, applyProposal, hasClockEvidence };

export type { ProposalOutcome };
