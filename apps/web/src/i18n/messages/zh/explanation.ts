import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "关闭解释",
  cloud: "经您许可，请云端 AI 解读。每处引用都已与消息原文核对。",
  cloudConsent:
    "使用云端助手获取更完整的解释。消息文字会发送给 AI 服务提供方。不勾选则在本地解读。",
  cloudConsentWithNotes:
    "使用云端助手获取更完整的解释。消息文字和您关于帮助偏好的笔记会发送给 AI 服务提供方。不勾选则在本地解读。",
  dateSpoken: (quote: string, date: string) =>
    `提到的日期：${quote}${date ? `，${date}` : ""}。`,
  dates: "提到的日期和时间",
  droppedNote:
    "助手提供的一些细节与消息原文并非逐字一致，因此已标为猜测或省略。",
  explainAgainWithCloud: "用云端 AI 重新解释",
  explainThis: "解释这条消息",
  explainWithCloud: "用云端 AI 解释",
  facts: "消息说了什么",
  guessNote: "这些是猜测，并非消息中明确说出的内容。",
  guessSpoken: (text: string) => `猜测：${text}`,
  guesses: "可能是什么意思",
  inPlainWords: "用简单的话说",
  intro:
    "LifeLink 可以说明这条消息提出了什么要求、提到了哪些日期，以及哪些信息没有说清楚。",
  loading: "正在加载解释",
  local: {
    chosen:
      "本地解读：通过模式匹配找到内容，并不代表完全理解。没有向 AI 服务提供方发送任何内容。",
    failed:
      "本地解读。您请求了云端解读，但未能完成。服务提供方可能已收到这条消息。",
    limit: "本地解读。今天的云端解读次数已达上限，因此没有继续发送内容。",
    practice: "练习：在 LifeLink 内解释。练习消息绝不会发送给 AI 服务提供方。",
    unavailable:
      "本地解读。尚未设置云端助手，因此没有向 AI 服务提供方发送任何内容。",
  },
  localLanguageNotice:
    "基于本地规则的解释仍为英语，尚未翻译。云端解释可以使用您选择的语言。原始消息中的引用保持不变。",
  missing: "尚未说明",
  missingSpoken: (detail: string) => `尚未说明：${detail}`,
  onlyYou: "只有您能看到。绝不会发送给家人或与家人分享。",
  part: "部分",
  practiceNote:
    "在练习模式下，LifeLink 在本地解读消息。练习消息绝不会发送给 AI 服务提供方。",
  readAloud: "朗读解释",
  readReply: "朗读这条回复",
  reading: "正在阅读消息…",
  replies: "可供参考的回复",
  repliesHint:
    "不会发送任何内容。回复会放入您的消息输入框，您可以修改并核对后再进行下一步。",
  requestSpoken: (text: string, quote: string) =>
    `对方的要求：${text} 原话是：${quote}。`,
  requests: "对方提出的要求",
  title: "帮助理解这条消息",
  useReply: "使用这条回复",
  useReplyLabel: (label: string) => `使用这条回复：${label}`,
};

export { explanation };
