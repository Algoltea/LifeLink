import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day} às ${time}`,
  hoursAgo: (hours) => `Há ${hours} ${hours === 1 ? "hora" : "horas"}`,
  justNow: "Agora mesmo",
  minutesAgo: (minutes) =>
    `Há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`,
  today: "Hoje",
  tomorrow: "Amanhã",
  yesterday: "Ontem",
};

export { format };
