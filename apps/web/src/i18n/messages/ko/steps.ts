import type { Messages } from "../en";

const steps: Messages["steps"] = {
  position: (noun, position, total) => `${noun} ${total}개 중 ${position}번째`,
  showEverything: "모두 보기",
};

export { steps };
