import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `초대를 복사했습니다. ${contactName}에게 직접 보내 주세요.`,
  copiedLink: (contactName) =>
    `링크를 복사했습니다. ${contactName}에게 직접 보내 주세요.`,
  copyInvitation: "초대 복사",
  copyInvitationFailed: "초대를 복사하지 못했습니다. 위 주소를 복사해 주세요.",
  copyLink: "링크 복사",
  copyLinkFailed: "링크를 복사하지 못했습니다. 위 링크를 선택해 복사해 주세요.",
  expires: (day) => ` 한 번만 사용할 수 있으며 ${day}에 만료됩니다.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `${contactName}, 안녕하세요! Telegram에서 ${botUrl} 링크를 열고 시작을 눌러 주세요. 그러면 LifeLink를 통해 서로 메시지를 주고받을 수 있어요.`,
  link: "Telegram 연결",
  linked: (account, contactName) =>
    `${account}에 연결되었습니다. ${contactName}에게 보내도록 승인하신 메시지를 Telegram으로 보낼 수 있으며, 상대방의 답장은 메시지 화면에 도착합니다.`,
  loading: "Telegram 설정을 불러오는 중…",
  newLink: "새 링크 만들기",
  notConfigured:
    "앱 설정이 필요합니다. 이 연락처에 Telegram을 연결하려면 LifeLink 운영자가 먼저 Telegram을 연결해야 합니다.",
  ownerOnly: "계정 소유자만 자신의 연락처에 Telegram을 연결할 수 있습니다.",
  sendLink: (contactName) =>
    `${contactName}에게 이 링크를 보내 주세요. 상대방이 링크를 열고 시작을 누르면 여기에 Telegram이 자동으로 연결됩니다.`,
  theirAccount: "상대방의 Telegram 계정",
  unlink: "Telegram 연결 해제",
  waitingAsk: (contactName) =>
    `. ${contactName}에게 다음 링크를 열어 달라고 요청해 주세요: `,
  waitingFor: (username) => `@${username}의 응답을 기다리는 중`,
  waitingRest: " — Telegram에서 열고 시작을 누르면 LifeLink가 바로 연결합니다.",
};

export { telegramSetup };
