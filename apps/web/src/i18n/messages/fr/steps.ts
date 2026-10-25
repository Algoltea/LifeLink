import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun, position, total) => `${noun} ${position} sur ${total}`,
  showEverything: "Tout afficher",
};

export { steps };
