import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "添加联系人",
  contactFallback: "联系人",
  edit: "编辑",
  editPerson: (name: string) => `编辑 ${name}`,
  empty:
    "添加您信任的人，您就可以给他们发消息，并选择他们在 LifeLink 中能看到的内容。仅添加联系人不会分享任何内容。",
  keep: "保留",
  loadingPeople: "正在加载联系人",
  message: "发消息",
  people: "联系人",
  peopleCount: (count: number) => `${count} 人`,
  permissions: "权限",
  permissionsFor: (name: string) => `，适用于 ${name}`,
  practiceContact: "练习联系人",
  reachNone: "尚无联系方式",
  reachTelegramWaiting: "Telegram：等待对方点击“开始”",
  reachWhatsappSaved: "已保存 WhatsApp。暂时无法发消息",
  reachedBy: {
    discord: "通过 Discord 联系",
    email: "通过邮件联系",
    imessage: "通过 iMessage 联系",
    in_app: "在 LifeLink 中联系",
    telegram: "通过 Telegram 联系",
  },
  removeConfirm: (firstName: string) => `移除 ${firstName}`,
  removeDescription: (name: string) =>
    `将移除 ${name}，您与对方分享的所有内容也会立即停止分享。`,
  removeFailed: (error: string) => `无法移除此人。${error} 请再次选择“移除”。`,
  removeFallback: "移除",
  removeNamed: (firstName: string) => `移除 ${firstName}…`,
  removePerson: "移除此人…",
  removeStopsSharing: (firstName: string) =>
    `移除 ${firstName} 也会停止与对方分享所有内容。`,
  removeTitle: (name: string) => `移除 ${name}？`,
  removed: (name: string) => `已移除 ${name}。`,
  removing: "正在移除…",
  subline: "您信任的人、他们的联系方式，以及每个人具体能看到哪些内容。",
  title: "信任圈",
  trusted: "已信任",
};

export { circle };
