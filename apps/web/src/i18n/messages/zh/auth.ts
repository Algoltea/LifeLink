import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "请稍候…",
  connectionFailed: "无法连接。请检查网络连接后重试。",
  createAccount: "创建账号",
  createFailed: "无法创建账号。请重试。",
  createTitle: "创建您的账号",
  credentialsMismatch: "邮箱和密码不匹配。请核对后重试。",
  email: "电子邮箱",
  friend: "朋友",
  fullName: "您的姓名",
  hide: "隐藏",
  hidePassword: "隐藏密码",
  intro:
    "LifeLink 帮您与家人保持联系，记住每天的安排。没有您的同意，不会发送任何内容。",
  minimumPassword: (count: number) => `请设置至少 ${count} 个字符的密码。`,
  modeLabel: "登录或创建账号",
  password: "密码",
  passwordHint: (count: number) => `至少 ${count} 个字符。`,
  playGuest: "无需登录即可玩纸牌接龙",
  show: "显示",
  showPassword: "显示密码",
  signIn: "登录",
  signUp: "创建账号",
  takingBreak: "想休息一下？",
  welcome: "欢迎回来",
};

export { auth };
