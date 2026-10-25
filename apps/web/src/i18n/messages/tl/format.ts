import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day}, ${time}`,
  hoursAgo: (hours) => `${hours} oras ang nakalipas`,
  justNow: "Ngayon lang",
  minutesAgo: (minutes) => `${minutes} minuto ang nakalipas`,
  today: "Ngayon",
  tomorrow: "Bukas",
  yesterday: "Kahapon",
};

export { format };
