const format = {
  at: (day: string, time: string) => `${day} at ${time}`,
  hoursAgo: (hours: number) => `${hours} ${hours === 1 ? "hour" : "hours"} ago`,
  justNow: "Just now",
  minutesAgo: (minutes: number) =>
    `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`,
  today: "Today",
  tomorrow: "Tomorrow",
  yesterday: "Yesterday",
};

export { format };
