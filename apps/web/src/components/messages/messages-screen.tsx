"use client";

import { EmptyNote } from "@/components/app/states";
import { useMessages } from "@/i18n/locale";

/** With no conversation open, wide screens say what the space beside the list is for. */
const MessagesScreen = () => {
  const t = useMessages().threads;

  return (
    <EmptyNote className="hidden @3xl/content:mt-12 @3xl/content:flex">
      {t.chooseConversation}
    </EmptyNote>
  );
};

export { MessagesScreen };
