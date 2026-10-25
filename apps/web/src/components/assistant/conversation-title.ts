import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { translateServerMessage } from "@/i18n/server-messages";

/** Titles with messages come from the first request, including user-authored text. */
const conversationTitleFor = (
  conversation: { hasMessages: boolean; title: string },
  locale: InterfaceLocale
): string =>
  conversation.hasMessages
    ? conversation.title
    : translateServerMessage("New conversation", locale);

export { conversationTitleFor };
