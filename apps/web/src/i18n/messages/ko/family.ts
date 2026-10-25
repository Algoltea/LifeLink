import type { Messages } from "../en";

const family: Messages["family"] = {
  appointments: "약속",
  budget: (amount) => ` · 예산 ${amount}`,
  checked: (kind, day) => `${kind} 확인: ${day}`,
  codeHint:
    "초대하신 분의 믿을 수 있는 사람들 화면에서 코드를 확인하실 수 있습니다.",
  connect: "연결",
  connected:
    "연결되었습니다. 상대방이 공유하기로 정한 내용만 보실 수 있습니다.",
  empty:
    "아직 공유받은 내용이 없습니다. 초대를 받으시면 아래에 코드를 입력해 주세요.",
  groceries: "장보기",
  haveCode: "초대 코드가 있으신가요?",
  invitationCode: "초대 코드",
  kinds: { email: "이메일", screenshot: "화면 캡처", text: "글" },
  likelyScam: "사기일 가능성이 높음",
  loadingMessages: "메시지를 불러오는 중",
  loadingPhoto: "사진을 불러오는 중…",
  loadingShared: "공유 정보를 불러오는 중",
  loadingWhatWasShared: "공유된 내용을 불러오는 중",
  messagesWith: (name) => `${name} 님과의 메시지`,
  noMessages: "아직 LifeLink에 메시지가 없습니다.",
  noSharedReminders: "공유된 알림이 없습니다.",
  notSharing: "이 사람은 현재 나에게 내용을 공유하고 있지 않습니다.",
  nothingLeft: "더 살 물건이 없습니다.",
  nothingSoon: "앞으로 30일 동안 일정이 없습니다.",
  onlyResult: "결과만 공유하며 메시지 원문은 공유하지 않습니다.",
  photoUnavailable: "이 사진을 볼 수 없습니다.",
  photos: "사진",
  replyTo: (name) => `${name}에게 답장`,
  ride: {
    asked: "차편을 부탁했으며 아직 확정되지 않음",
    confirmed: "차편 확정됨",
    declined: "차편 요청이 거절됨",
  },
  scamChecks: "사기 확인",
  sendReply: "답장 보내기",
  sharedPhoto: "공유된 사진",
  sharedReminders: "공유된 알림",
  shares: (name, scopes) =>
    `${name}의 공유 항목: ${scopes}. 내용을 보실 수만 있으며, 대신 보내거나 승인하거나 돈을 쓸 수는 없습니다.`,
  subline:
    "각 사람이 공유하기로 정한 내용만 보실 수 있습니다. 내용을 볼 수만 있으며, 대신 보내거나 승인하거나 돈을 쓸 수는 없습니다.",
  suspicious: "의심스러움",
  theyWrote: (name) => `${name}의 글: `,
  title: "가족",
  updates: "새 소식",
  withPhotos: " · 사진 포함",
  you: "나",
  youWrote: "내가 쓴 글: ",
};

export { family };
