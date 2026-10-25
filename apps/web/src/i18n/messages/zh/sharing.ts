import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels: string) => `可以查看：${labels}`,
  changePermissions: "更改权限",
  chooseAtLeastOne: "请至少选择一项分享内容，以创建邀请码。",
  chooseWhatToShare: "选择分享内容",
  codeAriaLabel: (spelled: string) => `邀请码 ${spelled}`,
  codeCopied: "邀请码已复制。",
  codeCopyFailed:
    "无法复制邀请码。请再次选择“复制邀请码”，或记下上方显示的邀请码。",
  codeSpoken: (spelled: string) => `邀请码是 ${spelled}`,
  codeSpokenDash: "，短横线，",
  copyCode: "复制邀请码",
  createCode: "创建邀请码",
  expiry: {
    none: "无结束日期",
    seven: "7 天",
    thirty: "30 天",
  },
  forHowLong: "分享多久",
  giveCode: (firstName: string) =>
    `请将此邀请码告诉 ${firstName}。对方创建 LifeLink 账号，选择“有家人邀请了我”，然后输入即可。邀请码仅可使用一次，14 天内有效。请现在复制；它只会在这里显示这一次。`,
  invitationWaiting: "邀请等待接受",
  inviteFailed: (error: string) =>
    `无法创建邀请。${error} 您的选择仍在这里。请重新创建邀请码。`,
  keepSharing: "继续分享",
  loadingPermissions: "正在加载权限",
  loadingPermissionsShort: "正在加载权限…",
  makingCode: "正在创建邀请码…",
  noInformationSelected: "尚未选择要分享的信息。",
  noInformationShared: "未分享信息",
  notSharing: (firstName: string) => `您没有与 ${firstName} 分享任何信息。`,
  permissionsFor: (name: string) => `${name} 的权限`,
  readCode: "朗读邀请码",
  savePermissions: "保存权限",
  scopes: {
    "appointments.view": {
      description: "即将到来的预约安排，包括时间和地点。",
      label: "预约安排",
    },
    "groceries.view": {
      description: "您保存的购物清单及其预算。",
      label: "购物清单",
    },
    "photos.view": {
      description: "您在家人对话中分享的照片。",
      label: "分享的照片",
    },
    "reminders.view": {
      description: "您已保存并选择分享的提醒。",
      label: "提醒",
    },
    "rides.view": {
      description: "接送或办事的进度：已请求、已回复、已确认。",
      label: "接送安排",
    },
    "scam_alerts.view": {
      description: "您检查疑似诈骗消息时的提示。",
      label: "诈骗警示",
    },
  },
  sharedInformation: "分享的信息",
  startSharing:
    "要开始分享，请选择对方能看到的内容，并给对方邀请码。对方在自己的 LifeLink 账号中输入即可。",
  state: {
    active: "可以查看分享的信息",
    expired: "分享已到期",
    invited: "邀请尚未使用",
    revoked: "分享已停止",
  },
  stopDescription: (name: string) =>
    `${name} 将立即无法查看您分享的任何内容。您以后可以再次邀请对方。`,
  stopFailed: (error: string) =>
    `无法停止分享。${error} 请再次选择“停止分享”。`,
  stopSharing: "停止分享",
  stopSharingWith: (name: string) => `停止与 ${name} 分享`,
  stopTitle: (name: string) => `停止与 ${name} 分享？`,
  stopped: (name: string) => `已停止与 ${name} 分享。`,
  stopping: "正在停止分享…",
  them: "对方",
  until: (day: string) => `截至 ${day}`,
  updateFailed: (error: string) =>
    `无法更新分享设置。${error} 您的选择仍在这里。请选择“保存权限”重试。`,
  updated: "分享设置已更新，立即生效。",
  viewOnly:
    "选择在 LifeLink 中分享哪些信息。对方只能查看，不能代您发消息、批准操作或花钱。",
  whatNameCanSee: (firstName: string) => `${firstName} 能看到的内容`,
  whatTheyCanSee: "对方能看到的内容",
};

export { sharing };
