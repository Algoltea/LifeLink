import type { InboxMessage } from "@lifelink/contracts/inbox";

import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { LOCAL_SCAN_VERSION } from "../scam";

/** Match the owner's saved email addresses, never a sender-supplied display name. */
const knownEmailSenders = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">
): Promise<Set<string>> => {
  const contacts = await ctx.db
    .query("contacts")
    .withIndex("by_owner", (index) => index.eq("ownerId", owner._id))
    .take(200);

  const addresses = new Set<string>();

  for (const contact of contacts) {
    if (!contact.trusted || (contact.sample && !owner.demoMode)) {
      continue;
    }

    for (const channel of contact.channels) {
      if (channel.channel === "email") {
        addresses.add(channel.address.trim().toLowerCase());
      }
    }
  }

  return addresses;
};

const inboxMessage = (
  email: Doc<"emails">,
  knownSenders: ReadonlySet<string>
): InboxMessage => ({
  bodyText: email.bodyText,
  checked: email.scamCheck?.rulesVersion === LOCAL_SCAN_VERSION,
  fromAddress: email.fromAddress,
  fromName: email.fromName,
  id: email._id,
  senderKnown: knownSenders.has(email.fromAddress.trim().toLowerCase()),
  subject: email.subject,
  summary: email.summary,
  suspicious: email.suspicious,
});

export { inboxMessage, knownEmailSenders };
