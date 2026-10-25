import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun, position, total) => `${noun} ${position} trên ${total}`,
  showEverything: "Hiện tất cả",
};

export { steps };
