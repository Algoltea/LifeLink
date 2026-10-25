import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun: string, position: number, total: number) =>
    `${noun} ${position} / ${total}`,
  showEverything: "显示全部",
};

export { steps };
