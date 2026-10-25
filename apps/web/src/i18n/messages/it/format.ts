import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day} alle ${time}`,
  hoursAgo: (hours) => `${hours} ${hours === 1 ? "ora" : "ore"} fa`,
  justNow: "Adesso",
  minutesAgo: (minutes) =>
    `${minutes} ${minutes === 1 ? "minuto" : "minuti"} fa`,
  today: "Oggi",
  tomorrow: "Domani",
  yesterday: "Ieri",
};

export { format };
