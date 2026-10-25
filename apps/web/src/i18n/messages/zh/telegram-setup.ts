import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName: string) =>
    `邀请已复制。请您自行发送给 ${contactName}。`,
  copiedLink: (contactName: string) =>
    `链接已复制。请您自行发送给 ${contactName}。`,
  copyInvitation: "复制邀请",
  copyInvitationFailed: "无法复制邀请。请复制上方地址。",
  copyLink: "复制链接",
  copyLinkFailed: "无法复制链接。请选中并复制上方链接。",
  expires: (day: string) => `仅可使用一次，将于 ${day} 失效。`,
  heading: "Telegram",
  invite: (contactName: string, botUrl: string) =>
    `${contactName}，您好！请在 Telegram 中打开 ${botUrl} 并点击“开始”，这样我们就能通过 LifeLink 互发消息了。`,
  link: "关联 Telegram",
  linked: (account: string, contactName: string) =>
    `已关联 ${account}。您批准发给 ${contactName} 的消息可以通过 Telegram 发送，对方的回复会出现在“消息”中。`,
  loading: "正在加载 Telegram 设置…",
  newLink: "创建新链接",
  notConfigured:
    "需要设置应用。LifeLink 的管理人员必须先连接 Telegram，您才能为此联系人关联。",
  ownerOnly: "只有账号本人可以为其联系人关联 Telegram。",
  sendLink: (contactName: string) =>
    `请将此链接发送给 ${contactName}。对方打开并点击“开始”后，Telegram 会自动关联到这里。`,
  theirAccount: "对方的 Telegram 账号",
  unlink: "解除 Telegram 关联",
  waitingAsk: (contactName: string) =>
    `。请 ${contactName} 在 Telegram 中打开 `,
  waitingFor: (username: string) => `正在等待 @${username}`,
  waitingRest: " 并点击“开始”。完成后，LifeLink 会立即关联对方。",
};

export { telegramSetup };
