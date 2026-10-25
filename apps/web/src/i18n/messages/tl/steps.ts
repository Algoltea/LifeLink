import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun, position, total) => `${noun} ${position} sa ${total}`,
  showEverything: "Ipakita lahat",
};

export { steps };
