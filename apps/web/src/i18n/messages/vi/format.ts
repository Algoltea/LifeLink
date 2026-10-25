import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day} lúc ${time}`,
  hoursAgo: (hours) => `${hours} giờ trước`,
  justNow: "Vừa xong",
  minutesAgo: (minutes) => `${minutes} phút trước`,
  today: "Hôm nay",
  tomorrow: "Ngày mai",
  yesterday: "Hôm qua",
};

export { format };
