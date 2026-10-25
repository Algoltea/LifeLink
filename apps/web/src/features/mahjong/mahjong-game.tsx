"use client";

import { buttonVariants } from "@lifelink/ui/components/button";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { useMessages } from "@/i18n/locale";
import { authClient } from "@/lib/auth-client";

import { MahjongTable } from "./mahjong-table";
import { MAHJONG_SCREEN } from "./screen";

const subscribeToWidth = (onChange: () => void) => {
  const query = window.matchMedia(MAHJONG_SCREEN);

  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
};

const isWideEnough = () => window.matchMedia(MAHJONG_SCREEN).matches;

const onServer = () => null;

const Title = () => {
  const messages = useMessages().mahjong;

  return (
    <h1 className="text-mobile-title sm:text-page-title font-semibold">
      {messages.title}
    </h1>
  );
};

/** What a phone shows instead of the board. A saved game stays on the device for a bigger screen. */
const NeedsBiggerScreen = () => {
  const messages = useMessages().mahjong;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Title />
      <div className="bg-parchment flex flex-col items-start gap-4 rounded-lg px-4 py-4">
        <p className="text-body max-w-prose">{messages.biggerScreen}</p>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/solitaire"
        >
          {messages.playSolitaire}
        </Link>
      </div>
    </div>
  );
};

/**
 * Mahjong for the offline-ready /mahjong route. The board renders only in the
 * browser because it resumes the saved game from localStorage and depends on
 * the screen width; the server and the first hydration pass show the same
 * quiet placeholder.
 */
export const MahjongGame = () => {
  const messages = useMessages().mahjong;
  const wide = useSyncExternalStore(subscribeToWidth, isWideEnough, onServer);
  const { data: session } = authClient.useSession();

  if (wide === false) {
    return <NeedsBiggerScreen />;
  }

  if (wide) {
    return <MahjongTable guest={!session} />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Title />
      <output className="bg-parchment text-body block rounded-lg px-4 py-3">
        {messages.preparing}
      </output>
    </div>
  );
};
