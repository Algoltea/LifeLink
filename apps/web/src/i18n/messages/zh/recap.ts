import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "已达成约定",
  agreedSpoken: (text: string) => `已达成约定：${text}`,
  changedNote:
    "助手提供的一些细节与消息原文并非逐字一致，或只是提议而非已达成的约定，因此已修改或省略。",
  close: "关闭回顾",
  cloud: "经您许可，请云端 AI 生成回顾。每处引用都已与消息原文核对。",
  cloudConsent:
    "使用云端助手获取更完整的回顾。您与此人近期的消息会发送给 AI 服务提供方。不勾选则由 LifeLink 生成简短回顾。",
  done: "已完成",
  doneFromRecords: "根据 LifeLink 自身的记录，而不是消息中所说的内容。",
  inShort: "简要回顾",
  intro: (contactName: string) =>
    `LifeLink 可以总结您与 ${contactName} 已达成的约定、仅提出的建议，以及尚未解决的事项。`,
  loading: "正在加载回顾",
  local: {
    chosen:
      "由 LifeLink 生成的简短回顾：通过模式匹配找到内容，并不代表完全理解。没有向 AI 服务提供方发送任何内容。",
    failed:
      "由 LifeLink 生成的简短回顾。您请求了云端回顾，但未能完成。服务提供方可能已收到这些消息。",
    limit:
      "由 LifeLink 生成的简短回顾。今天的云端回顾次数已达上限，因此没有继续发送内容。",
    practice:
      "练习：由 LifeLink 生成的简短回顾。练习消息绝不会发送给 AI 服务提供方。",
    unavailable:
      "由 LifeLink 生成的简短回顾。尚未设置云端助手，因此没有向 AI 服务提供方发送任何内容。",
  },
  messageTo: (contactName: string) => `发给 ${contactName} 的消息`,
  nextSteps: "可考虑的下一步",
  nextStepsHint: "您需要先准备一个步骤，查看并核对，然后批准，才会执行。",
  noFinishedTasks: (contactName: string) =>
    `LifeLink 中没有此期间与 ${contactName} 相关的已完成任务。消息中说过的事不等于已完成。`,
  offerNote: "只有对方答应后，提议才算达成约定。",
  offered: "已提议，尚未达成约定",
  offeredSpoken: (text: string) => `已提议，尚未达成约定：${text}`,
  onlyYou: "只有您能看到。绝不会发送给家人或与家人分享。",
  part: "部分",
  practiceNote:
    "在练习模式下，LifeLink 会自行生成回顾。练习消息绝不会发送给 AI 服务提供方。",
  prepare: "准备内容供核对",
  prepared: "已准备好。请核对",
  readAloud: "朗读回顾",
  reading: "正在阅读对话…",
  recapAgain: "重新回顾",
  recapThis: "回顾这段对话",
  recapWithCloud: "用云端 AI 回顾",
  reminderForYou: "给您的提醒",
  stillUnclear: "尚不明确",
  title: (contactName: string) => `与 ${contactName} 的对话回顾`,
  unclearSpoken: (text: string) => `尚不明确：${text}`,
  you: "您",
};

export { recap };
