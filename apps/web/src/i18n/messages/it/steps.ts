import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun, position, total) => `${noun} ${position} di ${total}`,
  showEverything: "Mostra tutto",
};

export { steps };
