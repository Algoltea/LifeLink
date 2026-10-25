/**
 * A fuller practice day: more family messages, emails, and appointments, so
 * Today and its lists look lived-in. Added on its own so accounts that
 * already have sample data also get it the next time practice mode is on.
 * Everything is simulated and never reaches a real provider.
 */
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { DAY, HOUR, MINUTE, startOfLocalDay } from "./time";

/** Present once this day has been added, so it is never added twice. */
const MARKER = "sample-day-pharmacy";

type Channel = "discord" | "email" | "imessage" | "in_app";

/** `hour:minute` local time, `days` after today. */
const localAt = (
  now: number,
  timeZone: string,
  days: number,
  hour: number,
  minute = 0
): number =>
  startOfLocalDay(now + days * DAY, timeZone) + hour * HOUR + minute * MINUTE;

const sampleContacts = async (
  ctx: MutationCtx,
  ownerId: Id<"profiles">
): Promise<Doc<"contacts">[]> =>
  await ctx.db
    .query("contacts")
    .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
    .filter((row) => row.eq(row.field("sample"), true))
    .take(20);

const addFullerDay = async (
  ctx: MutationCtx,
  owner: Doc<"profiles">
): Promise<void> => {
  const done = await ctx.db
    .query("emails")
    .withIndex("by_provider_message", (index) =>
      index.eq("ownerId", owner._id).eq("providerMessageId", MARKER)
    )
    .first();

  if (done !== null) {
    return;
  }

  const now = Date.now();
  const name = owner.preferredName;

  await ctx.db.insert("contacts", {
    channels: [
      { address: "+15555550177", channel: "imessage", preferred: true },
    ],
    createdAt: now,
    hue: 15,
    linkedProfileId: null,
    name: "Rosa Martinez",
    ownerId: owner._id,
    relationship: "Friend",
    sample: true,
    trusted: true,
  });

  const contacts = await sampleContacts(ctx, owner._id);
  const byName = new Map(contacts.map((contact) => [contact.name, contact]));

  const message = async (
    contactName: string,
    channel: Channel,
    body: string,
    agoMs: number,
    direction: "incoming" | "outgoing" = "incoming"
  ): Promise<void> => {
    const contact = byName.get(contactName);

    if (contact === undefined) {
      return;
    }

    const at = now - agoMs;

    await ctx.db.insert("messages", {
      actionId: null,
      body,
      channel,
      contactId: contact._id,
      createdAt: at,
      direction,
      mode: "simulated",
      ownerId: owner._id,
      photoIds: [],
      providerMessageId: null,
      status: direction === "incoming" ? "received" : "read",
      statusUpdatedAt: at,
      taskId: null,
    });
  };

  // Earlier in each conversation, so the threads have some history.
  await message(
    "Linda Rivera",
    "email",
    "Lunch on Sunday sounds lovely. Shall we try that diner on Elm Street?",
    30 * HOUR,
    "outgoing"
  );
  await message(
    "Rosa Martinez",
    "imessage",
    "Thank you for the soup recipe! I made it last night and it was perfect.",
    28 * HOUR,
    "outgoing"
  );
  await message(
    "Sam Rivera",
    "imessage",
    `Morning, ${name}. The plumber can come Wednesday at 9. I gave him your number.`,
    20 * HOUR
  );

  // The newest message from each person, which Today lists.
  await message(
    "Linda Rivera",
    "email",
    `Hi ${name}! Still on for lunch Sunday at 12:30? I'll bring the photos from the beach. Love, Linda`,
    40 * MINUTE
  );
  await message(
    "Marcus Rivera",
    "discord",
    "I made the honor roll this term! Can I come by Saturday and show you my report card?",
    3 * HOUR
  );
  await message(
    "Rosa Martinez",
    "imessage",
    "Book club moved to Thursday at 2 at the library. Want me to save you a seat?",
    6 * HOUR
  );
  await message(
    "Dana Whitfield",
    "email",
    "Hi, a package for you was left on my porch by mistake. I'll bring it over this afternoon. Dana",
    9 * HOUR
  );

  const email = async (
    providerMessageId: string,
    fromName: string,
    fromAddress: string,
    subject: string,
    paragraphs: string[],
    agoMs: number
  ): Promise<void> => {
    await ctx.db.insert("emails", {
      actionNeeded: null,
      bodyText: paragraphs.join("\n\n"),
      connectionId: null,
      fromAddress,
      fromName,
      mode: "simulated",
      ownerId: owner._id,
      provider: "gmail",
      providerMessageId,
      providerThreadId: null,
      receivedAt: now - agoMs,
      selectedForReview: false,
      subject,
      summary: null,
      suspicious: null,
    });
  };

  await email(
    MARKER,
    "Riverside Pharmacy",
    "refills@riversidepharmacy.example",
    "Your prescription is ready for pickup",
    [
      `Hello ${owner.displayName},`,
      "Your refill of lisinopril 10 mg is ready at Riverside Pharmacy, 2140 River Road.",
      "We are open until 8 PM today. Please bring your photo ID. Your copay is $4.00.",
    ],
    1 * HOUR
  );
  await email(
    "sample-day-photos",
    "Linda Rivera",
    "linda.rivera@example.com",
    "Photos from the beach",
    [
      `Hi ${name},`,
      "Here are a few photos from our week at the shore. The kids loved the tide pools.",
      "I'll bring printed copies on Sunday. Love, Linda",
    ],
    4 * HOUR
  );
  await email(
    "sample-day-newsletter",
    "Oak Hollow Senior Center",
    "news@oakhollowcenter.example",
    "November at Oak Hollow: chair yoga, bingo, and a holiday lunch",
    [
      "Chair yoga is now on Mondays and Wednesdays at 10 AM.",
      "Bingo night is Friday, November 6 at 6 PM. Prizes donated by Rosie's Diner.",
      "Our holiday lunch is Thursday, November 19. Sign up at the front desk by November 12.",
    ],
    7 * HOUR
  );
  await email(
    "sample-day-utility",
    "City Water & Power",
    "billing@citywaterpower.example",
    "Your October statement is ready",
    [
      "Your October statement is ready. Amount due: $48.12.",
      "Autopay is on, so this will be paid from your checking account on November 3. No action is needed.",
    ],
    26 * HOUR
  );
  await email(
    "sample-day-gift-card",
    "Rewards Center",
    "winner@reward-claims.example",
    "Congratulations! You've been selected for a $500 gift card",
    [
      "You have been chosen to receive a $500 gift card as a loyal customer.",
      "To claim it, pay a $4.99 shipping fee within 12 hours using the secure link below.",
      "http://reward-claims.example/claim",
    ],
    32 * HOUR
  );

  const appointment = async (
    title: string,
    startsAt: number,
    minutes: number,
    location: string,
    providerName: string | null,
    notes: string | null
  ): Promise<void> => {
    await ctx.db.insert("appointments", {
      createdAt: now,
      endsAt: startsAt + minutes * MINUTE,
      location,
      mode: "simulated",
      notes,
      ownerId: owner._id,
      providerName,
      ridePickupAt: null,
      rideStatus: "none",
      rideWithContactId: null,
      sourceEmailId: null,
      startsAt,
      title,
    });
  };

  const zone = owner.timeZone;

  await appointment(
    "Plumber visit",
    localAt(now, zone, 1, 9),
    60,
    "Home",
    "Reliable Plumbing",
    "Kitchen sink. Sam gave them your number."
  );
  await appointment(
    "Book club",
    localAt(now, zone, 2, 14),
    90,
    "Maple Street Library",
    null,
    "Rosa is saving you a seat."
  );
  await appointment(
    "Haircut",
    localAt(now, zone, 3, 11),
    45,
    "Shear Elegance Salon",
    "Maria",
    null
  );
  await appointment(
    "Lunch with Linda",
    localAt(now, zone, 5, 12, 30),
    90,
    "Rosie's Diner, Elm Street",
    null,
    "Linda is bringing the beach photos."
  );
  await appointment(
    "Dentist",
    localAt(now, zone, 6, 15),
    60,
    "Bright Smile Dental",
    "Dr. Kim",
    "Cleaning and checkup."
  );
};

export { addFullerDay };
