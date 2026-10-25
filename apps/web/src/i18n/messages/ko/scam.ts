import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "덧붙이실 내용이 있나요? (선택)",
  addNotePlaceholder: "예: 누구라고 하면서 보냈는지",
  ask: "믿을 수 있는 사람에게 물어보기",
  callCheckTitle: "사기 의심 통화 확인",
  checkSomethingElse: "다른 내용 확인",
  checking: "확인 중",
  checkingMessage: "메시지를 확인하는 중…",
  chooseEmail: "이메일 선택",
  chooseRecent: "최근 이메일에서 선택",
  cloudNote:
    "AI 서비스가 이 내용을 읽고 확인합니다. 비밀번호와 카드 번호는 빼 주세요.",
  didNotFinish: "완료하지 못함",
  earlier: "이전 확인 기록",
  earlierEmpty: "메시지, 사진, 통화 확인 기록이 여기에 표시됩니다.",
  emailMissing:
    "이 이메일은 최근 받은편지함에 없습니다. 다른 이메일을 고르시거나 아래에 내용을 입력해 주세요.",
  from: (sender) => `보낸 분: ${sender}`,
  guidance: {
    ai: "AI 서비스가 메시지와 사진 확인을 돕습니다. 사진은 확인 기록을 삭제하실 때까지 함께 보관합니다. 연습 확인에는 AI를 사용하지 않습니다.",
    intro:
      "흔한 위험 신호를 살펴보는 기능입니다. 누가 메시지를 보냈는지, 내용이 사실인지는 확인할 수 없습니다.",
    next: "결과를 읽고 ‘지금 할 일’을 참고하시거나, 믿을 수 있는 사람에게 의견을 구하세요. 다음에 무엇을 할지는 본인이 정하십니다.",
    title: "사기 확인으로 무엇을 알 수 있나요?",
  },
  howToShow: "어떤 방법으로 메시지를 보여주시겠어요?",
  loadingEarlier: "이전 확인 기록을 불러오는 중",
  loadingEmail: "이메일을 불러오는 중",
  loadingEmails: "이메일을 불러오는 중",
  localNote:
    "지금은 AI 확인을 사용할 수 없습니다. 대신 LifeLink가 흔한 위험 신호를 살펴봅니다.",
  messageWords: "메시지 원문",
  messageWordsPlaceholder: "여기에 붙여넣거나 입력해 주세요",
  noLongerAvailable:
    "이 확인 기록은 더 이상 볼 수 없습니다. 새로 확인하실 수 있습니다.",
  noRecentEmails: "선택할 최근 이메일이 없습니다. ",
  noRecentEmailsRest: ", 또는 메시지 내용을 직접 입력해 주세요.",
  noSubject: "(제목 없음)",
  openEmail: "이메일 열기",
  opening: "확인 기록을 여는 중",
  photo: {
    availabilityChecking: "사진 확인을 사용할 수 있는지 알아보는 중…",
    practice:
      "연습 모드가 켜져 있습니다. 사진을 확인하거나 AI 서비스에 보내지 않습니다.",
    unavailable:
      "지금은 사진 확인을 사용할 수 없습니다. 사진은 업로드되지 않습니다.",
    unavailableType: "사진 확인을 사용할 수 없습니다. 대신 글을 입력해 주세요.",
  },
  practiceEmailNote:
    "연습용 이메일입니다. 클라우드 AI 없이 이 기기에서 확인합니다.",
  practiceNote:
    "연습 확인에서는 흔한 위험 신호를 살펴봅니다. AI 서비스에 보내는 내용은 없습니다.",
  practiceSuffix: " · 연습",
  preparing: "확인을 준비하는 중…",
  review: "검토",
  sources: { email: "이메일", screenshot: "사진", text: "글" },
  startNew: "새로 확인",
  subline:
    "메시지나 통화가 의심스러우신가요? 행동하시기 전에 LifeLink가 위험 신호를 살펴봅니다.",
  submit: {
    email: "이 이메일 확인",
    screenshot: "이 사진 확인",
    text: "이 메시지 확인",
  },
  title: "사기 확인",
  uploading: "사진을 올리는 중…",
  uploadingNote:
    "사진을 올리고 있습니다. 이 화면을 열어 두세요. 다음으로 글을 읽습니다.",
};

export { scam };
