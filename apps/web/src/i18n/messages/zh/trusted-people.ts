import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "添加信任的人",
  call: "打电话",
  callAria: (name: string) => `致电 ${name}`,
  callHelpMessage:
    "我接了一个让我不太放心的电话。在我提供信息或转账之前，您能帮我核实一下是否真实吗？",
  callsLoading: "账号设置加载完成前，无法打电话。",
  callsPractice: "练习模式下无法打电话。",
  contactFallback: "联系人",
  empty: "请别人帮忙判断可能会有帮助。请将您认识的人添加到",
  emptyRest: "，以便请对方帮忙核实。任何消息发送前，您都会先查看并核对。",
  failed: (name: string, error: string) =>
    `无法准备发给 ${name} 的消息。${error} 没有发送任何内容。请再次选择“准备消息”。`,
  introCall:
    "准备一条消息，请人帮忙核实通话。批准前，您可以阅读并修改。尚未发送任何内容。",
  introCheck:
    "准备一条消息，请人帮忙核实此次检查的内容。批准前，您可以阅读并修改。尚未发送任何内容。",
  list: "信任的人",
  loading: "正在加载信任的人",
  noMessageAddress: "未保存消息地址",
  noPhone: "未保存电话号码。",
  noWayToMessage: "未保存发送消息的方式。",
  prepare: "准备消息",
  prepareAria: (name: string) => `准备发给 ${name} 的消息`,
  preparing: "正在准备…",
  reachedBy: {
    discord: "通过消息联系",
    email: "通过邮件联系",
    imessage: "通过消息联系",
    in_app: "在 LifeLink 中联系",
    telegram: "通过消息联系",
  },
  saveDetails: "请将对方的联系方式保存到您的",
  trustedCircle: "信任圈",
  unavailable: "目前无法打电话或准备消息。",
};

export { trustedPeople };
