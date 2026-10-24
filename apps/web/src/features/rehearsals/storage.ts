import {
  parseRehearsal,
  serializeRehearsal,
} from "@lifelink/rehearsals/rehearsal";
import type { Rehearsal } from "@lifelink/rehearsals/rehearsal";

/** Rehearsals live only in this browser; they are never sent to LifeLink's server. */
const STORAGE_KEY = "lifelink:rehearsal:v1";

const loadRehearsal = (): Rehearsal | null => {
  try {
    const saved = globalThis.localStorage.getItem(STORAGE_KEY);

    return saved === null ? null : parseRehearsal(saved);
  } catch {
    return null;
  }
};

const saveRehearsal = (rehearsal: Rehearsal | null): void => {
  try {
    if (rehearsal === null) {
      globalThis.localStorage.removeItem(STORAGE_KEY);

      return;
    }

    globalThis.localStorage.setItem(STORAGE_KEY, serializeRehearsal(rehearsal));
  } catch {
    // Private browsing can refuse storage; the rehearsal still works, it just won't resume.
  }
};

export { loadRehearsal, saveRehearsal };
