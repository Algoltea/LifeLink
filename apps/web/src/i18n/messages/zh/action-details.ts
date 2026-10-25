import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: "和",
  budget: (amount: string) => `预算：${amount}。`,
  by: (channel: string) => `通过${channel}`,
  calendar: "日历",
  confirming: "您正在确认",
  document: "文档",
  draftSavedIn: (provider: string) =>
    `已保存到您的 ${provider} 草稿中。只有您在那里发送后，它才会发出。`,
  driveNoteHint:
    "将作为新文档保存到您的 Google Drive。除非您在那里分享，否则只有您能看到。",
  estimate: (amount: string) => `您的估算：${amount}。`,
  event: "活动",
  itemCount: (name: string, count: number) => `${name}：${count} 项`,
  noEstimate: "暂无估算。",
  noJustYou: "否，仅您可见",
  notGiven: "未提供",
  onlyGrantees: (names: string, scope: string) =>
    `只有 ${names} 能看到，因为您与他们分享了${scope}。`,
  peopleYouAllowed: "您允许的人",
  readEmail: "朗读邮件",
  readMessage: "朗读消息",
  readNote: "朗读笔记",
  readUpdate: "朗读近况",
  reminder: "提醒",
  sharedWithCircle: "与信任圈分享",
  shoppingRecord: "这是之前购物请求的记录。现在已不能通过 LifeLink 购物。",
  spoken: {
    calendar: (title: string, when: string, location: string | null) =>
      `${title}。${when}${location ? `，地点：${location}` : ""}。`,
    confirm: (summary: string) => `您正在确认：${summary}`,
    driveNote: (title: string, body: string) =>
      `您 Google Drive 中的笔记，标题为 ${title}。内容是：${body}`,
    email: (to: string, subject: string, body: string) =>
      `发给 ${to} 的邮件。主题：${subject}。内容是：${body}`,
    emailAloud: (subject: string, body: string) => `主题：${subject}。${body}`,
    message: (name: string, channel: string, route: string, body: string) =>
      `发给 ${name}，通过${channel}${route}。消息内容是：${body}`,
    reminder: (title: string, when: string, shared: boolean) =>
      `提醒：${title}。${when}。${shared ? "与您的信任圈分享。" : "仅您可见。"}`,
    update: (text: string) => `近况内容是：${text}`,
  },
  starts: "开始时间",
  subject: "主题",
  thisScope: "此内容",
  to: "收件人",
  toAddress: (address: string) => `，发送至 ${address}`,
  toName: (name: string) => `发给 ${name}`,
  when: "时间",
  where: "地点",
  withPhotos: (count: number) => `附 ${count} 张照片。`,
  yesShared: "是",
};

export { actionDetails };
