import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "잠시만 기다려 주세요…",
  connectionFailed:
    "연결하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.",
  createAccount: "계정 만들기",
  createFailed: "계정을 만들지 못했습니다. 다시 시도해 주세요.",
  createTitle: "계정을 만들어 주세요",
  credentialsMismatch:
    "이메일과 비밀번호가 일치하지 않습니다. 확인한 뒤 다시 시도해 주세요.",
  email: "이메일",
  friend: "친구",
  fullName: "성함",
  hide: "숨기기",
  hidePassword: "비밀번호 숨기기",
  intro:
    "LifeLink는 가족과 연락하고 하루 일과를 챙기실 수 있도록 도와드립니다. 허락 없이 보내는 일은 없습니다.",
  minimumPassword: (count) => `비밀번호는 ${count}자 이상으로 정해 주세요.`,
  modeLabel: "로그인 또는 계정 만들기",
  password: "비밀번호",
  passwordHint: (count) => `${count}자 이상이어야 합니다.`,
  playGuest: "로그인 없이 솔리테어 즐기기",
  show: "보기",
  showPassword: "비밀번호 보기",
  signIn: "로그인",
  signUp: "계정 만들기",
  takingBreak: "잠시 쉬어 가시겠어요?",
  welcome: "다시 오셔서 반갑습니다",
};

export { auth };
