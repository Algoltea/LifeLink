import type { Messages } from "../en";

const errors: Messages["errors"] = {
  goToToday: "前往今日",
  notFoundBody: "链接可能已过期，或地址有输入错误。没有更改任何内容。",
  notFoundTitle: "找不到此页面",
  pageBody:
    "没有发送或更改任何内容。通常是暂时的网络连接问题，重试往往可以解决。",
  pageTitle: "此页面未能加载",
};

export { errors };
