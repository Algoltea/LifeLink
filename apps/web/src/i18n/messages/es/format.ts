import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day} a las ${time}`,
  hoursAgo: (hours) => `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`,
  justNow: "Ahora mismo",
  minutesAgo: (minutes) =>
    `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`,
  today: "Hoy",
  tomorrow: "Mañana",
  yesterday: "Ayer",
};

export { format };
