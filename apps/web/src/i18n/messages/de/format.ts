import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day} um ${time}`,
  hoursAgo: (hours) => `Vor ${hours} ${hours === 1 ? "Stunde" : "Stunden"}`,
  justNow: "Gerade eben",
  minutesAgo: (minutes) =>
    `Vor ${minutes} ${minutes === 1 ? "Minute" : "Minuten"}`,
  today: "Heute",
  tomorrow: "Morgen",
  yesterday: "Gestern",
};

export { format };
