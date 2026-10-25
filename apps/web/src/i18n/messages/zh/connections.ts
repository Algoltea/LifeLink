import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label: string) => `账号：${label}`,
  allowProvider: (label: string) => `在 ${label} 的页面上选择“允许”。`,
  appAccount: "此功能使用应用自身的账号，您无需登录。",
  callback: {
    back: "返回连接页面",
    checking: (label: string) => `正在检查 ${label} 连接`,
    connected: (label: string) => `${label} 已连接。`,
    connectedTitle: (label: string) => `${label} 已连接`,
    declined: (label: string) =>
      `${label} 未能完成连接。没有更改任何内容。您可以重试。`,
    missing: "打开此页面时没有待完成的连接。请从连接页面重新开始。",
    practice: "练习模式已开启。完成真实连接前，请先在设置中关闭练习模式。",
    service: "此服务",
    subline: "返回连接页面查看您的服务，或重新开始。",
    title: "连接状态",
    unavailable: "LifeLink 尚无法连接此服务。请返回连接页面查看其限制。",
  },
  canDo: "可以做什么",
  cancel: "取消",
  cardLabel: (
    label: string,
    status: string,
    permissions: string,
    action: string
  ) => `${label}。${status}。${permissions}。${action}。`,
  close: "关闭",
  comingLater: "以后提供",
  connect: "连接",
  connectProvider: (label: string) => `连接 ${label}`,
  connectionState: (status: string) => `连接状态：${status}。`,
  connectionStates: {
    active: "有效",
    deleted: "已删除",
    expired: "已过期",
    failed: "失败",
    inactive: "未启用",
    initiated: "已发起",
    pending: "等待中",
    revoked: "已撤销",
  },
  detailLabel: (label: string, summary: string) =>
    `${label}。${summary} 详情。`,
  details: "详情",
  developerSetupAfter: (label: string) => `，然后选择 ${label}。`,
  developerSetupBefore: "请 LifeLink 管理人员运行 ",
  disconnect: (label: string) => `断开 ${label} 连接`,
  disconnectPractice: "断开练习账号连接",
  disconnectTip: (label: string) =>
    `提示：对方随时可以在此窗口断开 ${label} 连接。`,
  disconnected: (label: string) => `${label} 已断开连接。今后不会再使用它。`,
  discordSetup: (practice: boolean) =>
    `${practice ? "使用真实 Discord 时，请" : "请"}在信任圈中添加每个人的 Discord 用户 ID。`,
  empty: "没有列出的服务。",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "此应用尚未设置连接。请运行 bun run dev:setup。",
    "Please sign in again.": "请重新登录。",
    "Practice connections are only available in practice mode.":
      "练习连接仅在练习模式下可用。",
    "That account could not be found.": "找不到该账号。",
    "That connection could not be found.": "找不到该连接。",
    "The connection did not finish. You can try again.":
      "连接未完成。您可以重试。",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "请求处理期间，此连接发生了变化。请返回连接页面查看状态。",
    "This connection was not started from your account. Please try connecting again.":
      "此连接并非从您的账号发起。请重新连接。",
    "This service does not use a personal sign-in.":
      "此服务不使用个人账号登录。",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "连接或更改真实账号前，请先在设置中关闭练习模式。",
    "We could not confirm the connection.": "无法确认连接。",
  },
  groups: {
    appointments: "管理预约安排",
    email: "阅读和撰写邮件",
    messages: "给家人和朋友发消息",
  },
  helperTitle: "在帮别人设置吗？",
  imessageIntro:
    "将信任圈中的每个人关联到 Photon 中已有的联系人。LifeLink 不会登记新联系人。",
  imessageSteps: [
    "保存对方发送 iMessage 时使用的确切电话号码或 Apple ID 邮箱。即使属于同一个人，电话号码和邮箱也是不同的身份标识。",
    "请确认这个确切地址已在 Photon 管理后台登记。如果没有，请先在那里添加联系人。然后在信任圈中选择“关联 iMessage”，并使用为此联系人显示的分配号码。",
    "请对方从这个已保存的确切地址，向分配的号码发送首条 iMessage。收到首条消息后，LifeLink 才能向对方发送消息。",
  ],
  intro: (label: string) =>
    `LifeLink 可以通过 ${label} 做以下事情。只有您批准后才会发送内容。`,
  limitTags: { not_offered: "无法提供", not_wired: "以后提供" },
  limitsCount: (count: number) => `LifeLink 暂时做不到的事（${count}）`,
  limitsTitle: "LifeLink 暂时做不到的事",
  loading: "正在加载连接",
  manage: "管理",
  notSetUp: "此功能尚未启用。请联系为您设置 LifeLink 的人开启。",
  openCircle: "打开信任圈",
  permissions: {
    add: "添加",
    calendar: "查找日期",
    draft: "草稿",
    message: "消息",
    money: "款项",
    notice: "提醒",
    post: "发布",
    read: "阅读",
    replies: "回复",
    send: "发送",
    unavailable: "暂无",
  },
  practiceAccount: "使用练习账号",
  practiceBlocked: (label: string) =>
    `您的真实 ${label} 连接已保存。练习账号不能替换它。请在设置中关闭练习模式后再管理。`,
  practiceConnected: (label: string) =>
    `练习版 ${label} 账号已连接。它绝不会访问真实服务。`,
  practiceDisconnected: (label: string) => `练习版 ${label} 账号已断开连接。`,
  practiceMessages: (imessage: boolean): string =>
    imessage
      ? "练习 iMessage 为模拟消息，不会送达您的联系人。"
      : "练习 Discord 消息为模拟消息，不会送达您的联系人。",
  practiceNeverConnects: "此练习账号绝不会连接真实服务。",
  pressConnect: (label: string) => `请按下方的“${label}”。`,
  providers: {
    discord: {
      accountRequirement:
        "家人与应用机器人在同一个服务器中，或已先给机器人发过消息。",
      capabilities: {
        "discord.receive": {
          label: "接收回复",
          note: "LifeLink 的 Discord 机器人在线时，回复会送达。",
        },
        "discord.send": { label: "您批准后发送私信" },
      },
      summary: "通过 Discord 与家人互发私信。",
    },
    ebay: {
      accountRequirement: "这里无法连接个人 eBay 账号。",
      capabilities: {
        "ebay.search": { label: "搜索 eBay 商品" },
        "ebay.selling": { label: "您发布的商品、订单或购买记录" },
      },
      summary: "搜索功能以后提供。LifeLink 绝不买卖物品。",
    },
    facebook: {
      accountRequirement: "仅支持 Facebook 公共主页功能，不支持个人资料页。",
      capabilities: {
        "facebook.page_inbox": { label: "阅读并回复公共主页消息" },
        "facebook.page_post": { label: "您批准后在公共主页发帖" },
        "facebook.personal": {
          label: "个人动态和朋友的消息",
          note: "Facebook 不允许应用读取或发送个人 Messenger 聊天。",
        },
      },
      summary: "仅限商业公共主页。以后提供。",
    },
    gmail: {
      accountRequirement: "一个 Google 账号。",
      capabilities: {
        "email.appointments": { label: "查找邮件中的预约安排" },
        "email.draft": { label: "撰写草稿供您核对" },
        "email.new_message_event": { label: "发现新邮件（约每分钟检查一次）" },
        "email.read_selected": { label: "阅读您选定的邮件以生成摘要" },
        "email.send": { label: "您批准后发送邮件" },
      },
      summary: "阅读、撰写和发送邮件。查找邮件中的预约安排。",
    },
    google_calendar: {
      accountRequirement: "一个 Google 账号。",
      capabilities: {
        "calendar.create": { label: "添加已批准的预约安排" },
        "calendar.read": { label: "查看即将到来的活动" },
      },
      summary: "您批准后，将预约安排添加到日历。",
    },
    google_drive: {
      accountRequirement: "一个 Google 账号。",
      capabilities: {
        "drive.create": { label: "您批准后，将预约笔记保存为文档" },
        "drive.read": {
          label: "查找您在 Drive 中已有的文件",
          note: "LifeLink 只能看到文件名和链接，看不到文件内容。",
        },
      },
      summary: "查找您的文件并保存预约笔记。",
    },
    imessage: {
      accountRequirement:
        "您的联系人无需邀请、LifeLink 账号或 Photon 管理后台访问权限。",
      capabilities: {
        "imessage.delivery": {
          label: "送达状态更新",
          note: "LifeLink 知道消息已发出，但不知道是否已送达或被阅读。",
        },
        "imessage.first_contact": {
          label: "与新人开始对话",
          note: "每个人都必须先发送首条消息。",
        },
        "imessage.receive": { label: "接收回复" },
        "imessage.send": {
          label: "您批准后发送文字或照片",
          note: "对方先发送首条消息后才能使用。",
        },
      },
      summary: "与家人和朋友互发消息。每个人都需先发送首条消息。",
    },
    instacart: {
      accountRequirement: "现在已不能通过 LifeLink 购物。",
      capabilities: {},
      summary: "现在已不能通过 LifeLink 购物。",
    },
    instagram: {
      accountRequirement: "一个 Instagram 商业或创作者账号。",
      capabilities: {
        "instagram.messages": { label: "回复私信" },
        "instagram.personal": { label: "个人账号" },
        "instagram.post": { label: "您批准后分享照片帖子" },
      },
      summary: "仅限商业和创作者账号。以后提供。",
    },
    outlook: {
      accountRequirement: "一个 Microsoft 账号。部分工作账号需要管理员同意。",
      capabilities: {
        "calendar.create": { label: "将已批准的预约安排添加到 Outlook 日历" },
        "email.draft": { label: "撰写草稿供您核对" },
        "email.new_message_event": { label: "及时发现新邮件" },
        "email.read_selected": { label: "阅读您选定的邮件以生成摘要" },
        "email.send": { label: "您批准后发送邮件" },
      },
      summary: "一次连接，即可使用 Outlook 邮件和日历。",
    },
    paypal: {
      accountRequirement: "这里无法连接个人 PayPal 账号。",
      capabilities: {
        "paypal.invoices": { label: "查询账单" },
        "paypal.send_money": {
          label: "向个人转账",
          note: "LifeLink 绝不转账。",
        },
      },
      summary: "账单功能以后提供。LifeLink 绝不转账。",
    },
    telegram: {
      accountRequirement:
        "家人打开 LifeLink 为其生成的链接，并在 Telegram 中点击“开始”。",
      capabilities: {
        "telegram.first_contact": {
          label: "与新人开始对话",
          note: "每个人都必须先在机器人对话中点击“开始”。",
        },
        "telegram.receive": { label: "接收回复" },
        "telegram.send": { label: "您批准后发送消息或照片" },
      },
      summary: "通过 Telegram 与家人互发消息。",
    },
  },
  realImessage: "使用真实 iMessage 时，请按照以下步骤操作。",
  requirements: "需要准备什么",
  retry: "重新连接",
  returnConnected: "返回这里后，会显示“已连接”。",
  setup: "设置",
  signInProvider: (label: string) =>
    `您将在 ${label} 自己的页面上登录。LifeLink 绝不会看到您的密码。`,
  signInTheirAccount: "请使用对方的账号登录，不要使用您自己的账号。",
  status: {
    connected: "已连接",
    disconnected: "未连接",
    error: "连接未成功",
    notOn: "未开启",
    pending: "未完成",
    practice: "练习",
    practiceAccount: "练习账号",
    ready: "已就绪",
    realSaved: "真实账号已保存",
  },
  subline: "连接您已有的服务。打开其中一项，查看 LifeLink 可以用它做什么。",
  telegramSetup: (practice: boolean) =>
    `${practice ? "使用真实 Telegram 时，请" : "请"}在信任圈中打开每个人，选择“关联 Telegram”，并将链接发给对方。对方只需点击一次“开始”。`,
  title: "连接",
  unavailableFeatures: (label: string) =>
    `LifeLink 尚无可用的 ${label} 功能。您无需连接账号。`,
  unavailableIntro: (label: string) => `LifeLink 暂时无法使用 ${label}。`,
};

export { connections };
