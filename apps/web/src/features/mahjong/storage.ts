import { isWon, newGame } from "@lifelink/mahjong/game";
import type { GameState } from "@lifelink/mahjong/game";
import type { LayoutId } from "@lifelink/mahjong/layouts";
import { parseSavedGame, serializeGame } from "@lifelink/mahjong/serialize";

export const STORAGE_KEY = "lifelink:mahjong:v1";

export interface LoadedGame {
  /** Why an existing save was set aside, when it could not be used. */
  readonly discarded: string | null;
  readonly resumedFrom: string | null;
  readonly state: GameState;
}

export const randomSeed = (): number =>
  crypto.getRandomValues(new Uint32Array(1))[0] ?? Date.now();

export const freshGame = (layout: LayoutId): GameState =>
  newGame({ layout, seed: randomSeed() });

const readStorage = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/** Resumes the saved game when it is intact and unfinished; otherwise deals a new one. */
export const loadGame = (layout: LayoutId): LoadedGame => {
  const saved = readStorage();

  if (!saved) {
    return { discarded: null, resumedFrom: null, state: freshGame(layout) };
  }

  const parsed = parseSavedGame(saved);

  if (!parsed.ok) {
    return {
      discarded: parsed.reason,
      resumedFrom: null,
      state: freshGame(layout),
    };
  }

  if (isWon(parsed.state)) {
    return {
      discarded: null,
      resumedFrom: null,
      state: freshGame(parsed.state.layout),
    };
  }

  return { discarded: null, resumedFrom: parsed.savedAt, state: parsed.state };
};

/** Saves the game; returns false when this browser will not store it. */
export const saveGame = (state: GameState): boolean => {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeGame(state));

    return true;
  } catch {
    return false;
  }
};
