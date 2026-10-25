import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun, position, total) => `${noun} ${position} von ${total}`,
  showEverything: "Alles anzeigen",
};

export { steps };
