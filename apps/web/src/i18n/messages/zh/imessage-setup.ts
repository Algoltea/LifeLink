import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "同意并关联此联系人",
  assignedNumber: "分配的 iMessage 号码：",
  checkComplete: "检查完成。当前状态显示在上方。",
  checkFailed: "无法检查对方的首条消息。请重试。",
  checkFirstMessage: "检查首条消息",
  checking: "正在检查对方的首条消息…",
  confirmDescription: "继续前，请核对确切地址及其用途。",
  confirmInvitation: (contactName: string, handle: string) =>
    `不会发送邀请消息。您会看到分配的号码，可自行告诉 ${contactName}。对方必须先从 ${handle} 向该号码发消息。电话号码和 Apple ID 邮箱是不同的身份标识，即使它们在同一部手机上。`,
  confirmLink: "关联 Photon 中已登记的联系人，地址为：",
  confirmLookup:
    "继续后，将在我们的 iMessage 服务提供方 Photon 中查找这个确切地址，并使用已有联系人。LifeLink 不会登记新人，也不会占用新的名额。",
  confirmNoAccount: (contactName: string) =>
    `${contactName} 无需 LifeLink 账号或管理后台邀请。这不会授予对方访问您账号中任何内容的权限。`,
  confirmTitle: (contactName: string) => `为 ${contactName} 关联 iMessage？`,
  confirmTo: "，关联至 ",
  copied: (contactName: string) =>
    `说明已复制。请您自行发送给 ${contactName}。`,
  copy: "复制说明",
  copyFailed: "无法复制说明。请选中并复制上方文字，或再次选择“复制说明”。",
  exactAddress: "确切的联系人地址：",
  firstMessageConfirmed:
    "已确认对方的首条消息。LifeLink 现在可以向此已登记地址发送消息。",
  heading: "iMessage 设置",
  instructions: (contactName: string, assignedNumber: string, handle: string) =>
    `${contactName}：要通过 iMessage 使用 LifeLink，请先从您登记的确切地址 ${handle} 向 ${assignedNumber} 发送一条 iMessage（例如“您好”）。在“信息”中，请确保对话从 ${handle} 发起。电话号码和 Apple ID 邮箱是不同的身份标识，即使它们在同一部手机上。从其他地址发来的消息无法激活此地址。您无需 LifeLink 账号或管理后台邀请。`,
  link: "关联 iMessage",
  linkExplanation:
    "关联已在 Photon 中以此确切地址登记的人。如果尚未登记，请先在 Photon 管理后台添加，再重试。LifeLink 不会创建新联系人登记。",
  linkFailed:
    "无法关联此联系人。请确认此确切地址已在 Photon 管理后台登记，然后重试。",
  loading: "正在加载 iMessage 设置…",
  lookingUp: "正在 Photon 中查找此已有联系人…",
  mustSendFirst: (contactName: string) =>
    `${contactName} 必须从上方显示的地址发送首条消息。您自己发送的消息无法激活对方的设置。`,
  needsAddress:
    "需要 iMessage 地址。请在上方添加对方的电话号码或 Apple ID 邮箱，然后保存。",
  notConfigured:
    "需要设置应用。LifeLink 的管理人员必须先连接 Photon，您才能为此联系人设置 iMessage。",
  ownerOnly: "只有账号本人可以为其联系人设置或检查 iMessage。",
  practice: (contactName: string) =>
    `练习消息只保留在 LifeLink 中，因此这里无需设置。切换到真实 iMessage 后，您可以在这里关联 ${contactName}。`,
  retryLink: "重新关联 iMessage",
  row: {
    failed: "iMessage 需要处理",
    not_registered: "尚未关联 iMessage",
    registering: "正在关联 iMessage",
    waiting: "正在等待对方的首条 iMessage",
  },
  status: {
    failed: "设置需要处理",
    not_registered: "未关联",
    ready: "iMessage 已就绪",
    registering: "正在关联",
    waiting: "正在等待对方的首条消息",
  },
};

export { imessageSetup };
