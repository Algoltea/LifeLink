import { getLocale, useLocale } from "@/i18n/locale";
import { connections as enConnections } from "@/i18n/messages/en/connections";
import type { ConnectionsMessages } from "@/i18n/messages/en/connections";
import { connections as esConnections } from "@/i18n/messages/es/connections";
import { translateServerMessage } from "@/i18n/server-messages";

const UNAVAILABLE_FEATURES =
  /^(?<label>.+) has no available features in LifeLink yet\. You do not need to connect an account\.$/u;

const SAVED_REAL_ACCOUNT =
  /^Your real (?<label>.+) connection is saved\. Practice accounts cannot replace it\. Turn off Practice mode in Settings to manage it\.$/u;

const CONNECTION_STATE = /^The connection is (?<status>.+)\.$/u;

const useConnectionMessages = (): ConnectionsMessages =>
  useLocale() === "es" ? esConnections : enConnections;

const translateConnectionMessage = (message: string): string => {
  const words: ConnectionsMessages =
    getLocale() === "es" ? esConnections : enConnections;

  const text = message.trim();

  if (Object.hasOwn(words.errors, text)) {
    return words.errors[text] ?? message;
  }

  const unavailable = UNAVAILABLE_FEATURES.exec(text);

  if (unavailable?.[1]) {
    return words.unavailableFeatures(unavailable[1]);
  }

  const saved = SAVED_REAL_ACCOUNT.exec(text);

  if (saved?.[1]) {
    return words.practiceBlocked(saved[1]);
  }

  const state = CONNECTION_STATE.exec(text);

  if (state?.[1]) {
    return words.connectionState(words.connectionStates[state[1]] ?? state[1]);
  }

  return translateServerMessage(message);
};

export { translateConnectionMessage, useConnectionMessages };
