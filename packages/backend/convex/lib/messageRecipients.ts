import type { Proposal } from "@lifelink/contracts/model-output";

import type { Doc } from "../_generated/dataModel";
import { channelFor, matchRecipient } from "./journey";

const GROUP_PREFIX = /^(?:(?:all|both)\s+)?(?:(?:of\s+)?(?:my|our|the)\s+)?/u;

const GROUPS = {
  brothers: ["brother", "stepbrother"],
  children: [
    "son",
    "daughter",
    "child",
    "stepson",
    "stepdaughter",
    "stepchild",
  ],
  daughters: ["daughter", "stepdaughter"],
  fathers: ["father", "dad", "stepfather"],
  grandchildren: ["grandson", "granddaughter", "grandchild"],
  granddaughters: ["granddaughter"],
  grandkids: ["grandson", "granddaughter", "grandchild"],
  grandparents: [
    "grandmother",
    "grandma",
    "grandfather",
    "grandpa",
    "grandparent",
  ],
  grandsons: ["grandson"],
  kids: ["son", "daughter", "child", "stepson", "stepdaughter", "stepchild"],
  mothers: ["mother", "mom", "mum", "stepmother"],
  parents: [
    "mother",
    "mom",
    "mum",
    "father",
    "dad",
    "parent",
    "stepmother",
    "stepfather",
  ],
  siblings: ["sister", "brother", "sibling", "stepsister", "stepbrother"],
  sisters: ["sister", "stepsister"],
  sons: ["son", "stepson"],
};

const RELATION_SEPARATOR = /[\s-]+/gu;
const COLLECTIVE_PREFIX = /^(?:all|both)\b/iu;
const CONSONANT_Y = /[^aeiou]y$/u;
const ES_ENDING = /(?:s|sh|ch|x|z)$/u;

const normalizeRelationship = (relationship: string): string =>
  relationship.toLowerCase().trim().replace(RELATION_SEPARATOR, "");

/** Compare against the saved category instead of maintaining a whitelist. */
const pluralRelationship = (relationship: string): string => {
  if (CONSONANT_Y.test(relationship)) {
    return `${relationship.slice(0, -1)}ies`;
  }

  return `${relationship}${ES_ENDING.test(relationship) ? "es" : "s"}`;
};

interface RecipientResolution {
  contacts: Doc<"contacts">[];
  error: string | null;
}

/** Expand relationship groups from saved categories, never from contact names. */
const resolveMessageRecipients = (
  contacts: Doc<"contacts">[],
  recipients: Proposal["recipients"]
): RecipientResolution => {
  const trusted = contacts.filter((contact) => contact.trusted);
  const selected = new Map<string, Doc<"contacts">>();

  for (const recipient of recipients) {
    const phrase = recipient.nameAsSaid.toLowerCase().trim();

    const group = normalizeRelationship(phrase.replace(GROUP_PREFIX, ""));

    const relationships = Object.entries(GROUPS).find(
      ([name]) => name === group
    )?.[1];

    const match = matchRecipient(trusted, null, recipient.nameAsSaid);

    const categoryMatches = trusted.filter((contact) => {
      const relationship = normalizeRelationship(contact.relationship);

      return (
        relationship.length > 0 &&
        (group === pluralRelationship(relationship) ||
          (COLLECTIVE_PREFIX.test(phrase) && group === relationship) ||
          (relationships !== undefined &&
            (relationships.includes(relationship) || group === relationship)))
      );
    });

    let matches: Doc<"contacts">[];

    if (relationships || categoryMatches.length > 0) {
      matches = categoryMatches;
    } else if (match.kind === "many") {
      return {
        contacts: [],
        error: `Which person did you mean by “${recipient.nameAsSaid}”: ${match.contacts.map((contact) => contact.name).join(", ")}? Please include each person's full name.`,
      };
    } else {
      matches = match.kind === "one" ? [match.contact] : [];
    }

    if (matches.length === 0) {
      return {
        contacts: [],
        error: `I couldn't match “${recipient.nameAsSaid}” in your Trusted circle. Check their saved name or relationship, or tell me their full name.`,
      };
    }

    for (const contact of matches) {
      if (channelFor(contact) === null) {
        return {
          contacts: [],
          error: `${contact.name} has no saved way to receive a message. Add one in Trusted circle, then ask again. No messages have been prepared.`,
        };
      }

      selected.set(contact._id, contact);
    }
  }

  if (selected.size > 20) {
    return {
      contacts: [],
      error:
        "Please choose up to 20 people at a time so you can review every message.",
    };
  }

  return { contacts: [...selected.values()], error: null };
};

export { resolveMessageRecipients };
