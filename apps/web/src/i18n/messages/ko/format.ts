import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day, time) => `${day} ${time}`,
  hoursAgo: (hours) => `${hours}시간 전`,
  justNow: "방금",
  minutesAgo: (minutes) => `${minutes}분 전`,
  today: "오늘",
  tomorrow: "내일",
  yesterday: "어제",
};

export { format };
