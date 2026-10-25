import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "添加此人",
  addWay: "添加另一种联系方式",
  added: (name: string) => `已添加 ${name}。`,
  anotherWay: "其他方式",
  askingForHelp: "向对方求助",
  chooseDifferentPicture: "选择其他照片",
  choosePicture: "选择照片",
  detailsNotSaved: (error: string) =>
    `无法保存此人的资料。${error} 您填写的内容仍在这里。请再次保存以重试。`,
  howToReach: "联系方式",
  language: "LifeLink 与对方交流时使用的语言",
  languageHelp:
    "LifeLink 向对方提供的文字会使用这种语言，例如首次 iMessage 中介绍您的说明。您的消息始终会严格按您批准的内容发送。",
  languageSameAsMine: (language: string) => `与我相同（${language}）`,
  name: "姓名",
  notSetYet: "尚未设置",
  picture: "照片",
  pictureFailed: (error: string) => `${error} 请选择照片后重试。`,
  pictureHelp:
    "选填。照片会在此设备上缩小并裁成正方形，保存前会移除位置和相机信息。",
  pictureNotSaved: (error: string) =>
    `此人的资料已保存，但照片未保存。${error} 您的选择仍在这里。请再次保存以重试，或选择其他照片。`,
  pictureUnusable: "无法使用这张照片。请换一张。",
  preferredWay: "首选联系方式",
  relationship: "与您的关系",
  relationshipPlaceholder: "儿子、邻居、朋友",
  removePicture: "移除照片",
  saveChanges: "保存更改",
  saved: "已保存。",
  savingPersonAndPicture: "正在保存联系人和照片…",
  trusted: "加入我的信任圈。LifeLink 可以建议我向此人求助。",
  ways: {
    discord: {
      help: "对方的 Discord 用户 ID，是一串较长的数字。在 Discord 中依次选择：设置、高级、开发者模式，然后复制用户 ID。",
      label: "Discord",
      valueLabel: "Discord 用户 ID",
    },
    email: {
      help: "对方的电子邮箱地址。",
      label: "邮件（Gmail、Outlook 等）",
      valueLabel: "电子邮箱地址",
    },
    imessageEmail: {
      help: "对方用于 iMessage 的 Apple ID 邮箱。它与电话号码是不同的身份标识。如需之后发送真实的 iMessage，请先保存此人，再选择“编辑”和“关联 iMessage”。",
      label: "iMessage（Apple ID 邮箱）",
      valueLabel: "Apple ID 邮箱",
    },
    imessagePhone: {
      help: "对方的 iPhone 号码。如需之后发送真实的 iMessage，请先保存此人，再选择“编辑”和“关联 iMessage”。",
      label: "iMessage（电话号码）",
      valueLabel: "电话号码",
    },
    telegram: {
      help: "对方的 Telegram 用户名，例如 @sam_alvarez（在 Telegram 中选择“设置”，然后查看“用户名”）。保存后，请对方在 Telegram 中打开 @LifeLinkMessage_Bot 并点击“开始”。没有用户名？可以留空，并使用下方的 Telegram 链接。",
      label: "Telegram",
      valueLabel: "Telegram 用户名",
    },
    whatsapp: {
      help: "为您保留此联系方式。LifeLink 暂时无法发送 WhatsApp 消息。",
      label: "WhatsApp（仅保存）",
      valueLabel: "WhatsApp 号码",
    },
  },
  whoTheyAre: "联系人资料",
};

export { contactForm };
