import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "关于此次检查",
  adviceNote: "此建议来自消息本身，因此不计为警示信号",
  adviceTitle: "消息本身提供的建议",
  allWords: "LifeLink 读取到的全部文字",
  cannotProve:
    "此结果无法证明消息真实。对于意料之外的请求，请通过您原本就认识的联系人核实。",
  checkDidNotFinish: "检查未能完成",
  checkingMessage: "正在检查您的消息…",
  compareWithPhoto: "请与您的照片对照",
  confidence: {
    high: "多项细节支持这一判断。但仍无法核实发送者身份。",
    low: "信息不足，无法确定。请他人帮忙判断可能会有帮助。",
    medium: "一些细节支持这一判断。请通过独立渠道核实此请求。",
  },
  couldNotRead: "LifeLink 无法清楚读取这张照片",
  delete: "删除此次检查",
  deleteConfirm: "删除此次检查？它将从“以往检查”中移除。",
  deleting: "正在删除…",
  howChecked: "此次检查如何进行",
  imageUnverified:
    "这些文字从照片中读取，可能有误或不完整。LifeLink 无法将其与原始文字核对。请与您的照片对照。",
  keep: "保留此次检查",
  kinds: {
    email: "邮件",
    screenshot: "照片或截图",
    text: "消息",
  },
  localLanguageNotice:
    "此本地检查仅为英语设计，可能遗漏西班牙语和其他语言中的诈骗。没有警示信号并不代表消息安全。",
  method: {
    cloud: "经您许可，云端 AI 服务协助进行了此次检查。",
    cloudOld: "云端 AI 服务协助进行了这次以往检查。此记录未保存许可详情。",
    rules: "LifeLink 使用了常见警示规则。此次检查未将消息发送给云端 AI 服务。",
    rulesFallback:
      "由于云端 AI 不可用或未能完成检查，LifeLink 使用了常见警示规则。服务方可能已收到此内容。",
    rulesOld:
      "LifeLink 使用了常见警示规则。这份较早的记录未注明云端 AI 服务是否也收到了消息。",
  },
  newPhoto: "重新拍照",
  noFullWording:
    "此次检查未保存完整文字。上方引用并非全文。请与照片对照，或输入文字重新检查。",
  noSigns: "未发现明确的警示信号。这并不能证明消息真实。",
  noStepsHint:
    "在按意料之外的请求行动前，请使用您已保存的联系方式，向您认识的人核实。",
  originalEmail: "邮件原文",
  originalMessage: "消息原文",
  photo: {
    alt: "此次检查使用的照片",
    larger: "放大查看照片",
    noPreview: "此次检查的照片预览不可用。",
    readSaved: "您仍可阅读已保存的结果。",
    reopen: "请尝试重新打开检查。",
    see: "查看照片",
    smaller: "缩小照片",
    smallerAria: "缩小照片",
  },
  photoRetention: {
    old: "这次较早的检查没有已保存的照片预览。删除检查会移除结果，但旧照片可能仍保留在存储中。",
    owned:
      "您的照片随此检查保留。删除检查时也会删除照片，除非其他已保存的检查或照片仍在使用它。",
  },
  readAloud: "朗读结果",
  readingPhoto: "正在读取您照片中的文字…",
  recoveryMessage: "请谨慎对待这条消息。您可以再检查一次，或请信任的人帮忙。",
  recoveryPhoto:
    "请在光线充足时拍摄更清晰的照片，让所有文字都在画面内，或直接输入文字。此次检查无法判断消息是否真实。",
  removedQuotes: "助手指出的一些文字未在消息中找到，因此不予显示。",
  savedWording: "随此次检查保存的文字",
  signCount: (count: number) => `${count} 个警示信号`,
  signsNoteMessage: "这条消息中值得注意的内容",
  signsNotePhoto: "附有 LifeLink 从您的照片读取的文字",
  step: "步骤",
  titles: {
    email: "您的邮件检查",
    screenshot: "您的照片检查",
    text: "您的消息检查",
  },
  typeWords: "改为输入文字",
  verdicts: {
    likely_safe: "没有明确警示信号",
    likely_scam: "很可能是诈骗",
    suspicious: "发现警示信号",
    unsure: "未经核实",
  },
  waitHint:
    "通常只需几秒。请保持此页面打开。在结果出来前，请勿使用消息中的链接或电话号码，也不要向任何人付款。",
  whatNow: "现在该怎么做",
};

export { scamResult };
