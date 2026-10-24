"use client";

import { useSyncExternalStore } from "react";

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
  const isClient = useSyncExternalStore(subscribeToNothing, onClient, onServer);

  if (isClient) {
    return <SolitaireTable />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <h1 className="text-mobile-title sm:text-page-title font-semibold">
        Solitaire
      </h1>
      <output className="bg-parchment text-body block rounded-lg px-4 py-3">
        Shuffling the cards.
      </output>
    </div>
  );
};
