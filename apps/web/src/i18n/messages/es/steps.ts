import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun, position, total) => `${noun} ${position} de ${total}`,
  showEverything: "Mostrar todo",
};

export { steps };
