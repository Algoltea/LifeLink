"use client";

import { useSyncExternalStore } from "react";

import { useMessages } from "@/i18n/locale";
import { authClient } from "@/lib/auth-client";

import { SolitaireTable } from "./solitaire-table";

const subscribeToNothing = () => () => {
  // Nothing changes after mount; the snapshot only tells server from client.
};

const onClient = () => true;

const onServer = () => false;

/**
 * Solitaire for the offline-ready /solitaire route. The table renders only in
 * the browser because it resumes the saved game from localStorage; the server
 * and the first hydration pass show the same quiet placeholder.
 */
export const SolitaireGame = () => {
  const t = useMessages().solitaire;
  const isClient = useSyncExternalStore(subscribeToNothing, onClient, onServer);
  const { data: session } = authClient.useSession();

  if (isClient) {
    return <SolitaireTable guest={!session} />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <h1 className="text-mobile-title sm:text-page-title font-semibold">
        {t.title}
      </h1>
      <output className="bg-parchment text-body block rounded-lg px-4 py-3">
        {t.shuffling}
      </output>
    </div>
  );
};
