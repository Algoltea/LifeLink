import type { Messages } from "../en";

const format: Messages["format"] = {
  at: (day: string, time: string) => `${day} ${time}`,
  hoursAgo: (hours: number) => `${hours} 小时前`,
  justNow: "刚刚",
  minutesAgo: (minutes: number) => `${minutes} 分钟前`,
  today: "今天",
  tomorrow: "明天",
  yesterday: "昨天",
};

export { format };
