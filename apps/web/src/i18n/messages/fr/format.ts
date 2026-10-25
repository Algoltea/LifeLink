import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day} à ${time}`,
  hoursAgo: (hours) => `Il y a ${hours} ${hours > 1 ? "heures" : "heure"}`,
  justNow: "À l’instant",
  minutesAgo: (minutes) =>
    `Il y a ${minutes} ${minutes > 1 ? "minutes" : "minute"}`,
  today: "Aujourd’hui",
  tomorrow: "Demain",
  yesterday: "Hier",
};

export { format };
