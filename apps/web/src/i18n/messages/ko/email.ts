import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "사기 확인 안내",
  appointmentAdded: "오늘 화면의 이번 주 일정에 추가되었습니다.",
  appointmentFound: "약속을 찾았습니다",
  backToInbox: "받은편지함으로 돌아가기",
  checkAnother: "다른 메시지 확인",
  checkCouldNotFinish: (error) => `사기 확인을 마치지 못했습니다. ${error}`,
  checkFirst: "행동하시기 전에 흔한 위험 신호가 있는지 확인해 보세요.",
  checkForNew: "새 이메일 확인",
  checkManually: " 아래에서 직접 확인하실 수 있습니다.",
  checkThis: "이 이메일 확인",
  checked: (when) => `확인: ${when}`,
  checkedAt: (when) => ` 확인: ${when}.`,
  checking: "확인 중…",
  checksAutomatic:
    "설정에서 AI 이메일 확인을 켜시면 새로 받은 실제 이메일이 클라우드 AI 제공업체에 전송될 수 있습니다. 연습용 이메일은 LifeLink 안에만 남습니다. 클라우드 AI가 꺼져 있거나, 사용할 수 없거나, 확인을 마치지 못하면 영어 전용 로컬 규칙을 사용합니다. 클라우드 요청이 실패해도 이메일이 이미 제공업체에 전달되었을 수 있습니다. 어느 방법으로도 보낸 사람의 신원을 확인하거나 이메일이 안전함을 증명할 수는 없습니다.",
  checksIntro:
    "LifeLink가 새 이메일에서 흔한 사기 신호를 확인합니다. 메시지를 선택하시면 내용과 주의할 부분을 보실 수 있습니다.",
  checksTitle: "이메일 확인 방법",
  chooseEmail: "이메일을 선택하시면 내용과 사기 확인 결과를 보실 수 있습니다.",
  cloudCheckNotice:
    "클라우드 AI가 이 이메일 확인을 도왔습니다. 실수할 수 있으며 보낸 사람의 신원을 확인할 수 없습니다. 위험 신호가 없다고 해서 안전한 이메일이라는 뜻은 아닙니다.",
  cloudConsent:
    "이 이메일을 클라우드 AI 서비스에 보내 요약하고 약속이 있는지 찾아봅니다. 선택하지 않으시면 LifeLink에서 짧은 미리보기를 만듭니다.",
  concern:
    "이 이메일에 주의할 부분이 있습니다. 행동하시기 전에 요청 내용을 확인해 주세요.",
  connectMailbox: "Gmail 또는 Outlook 연결",
  connected: (list) => `연결됨: ${list}.`,
  countEmails: (count) => `이메일 ${count}개`,
  empty:
    "아직 이메일이 없습니다. 메일함을 연결하고 ‘새 이메일 확인’을 선택하시면 최근 메시지를 가져옵니다.",
  from: "보낸 분: ",
  helpMeUnderstand: "내용 이해하기",
  inbox: "받은편지함",
  linksNotOpened:
    "LifeLink는 이메일의 링크를 열지 않습니다. 돈이나 개인정보를 요구한다면 먼저 확인해 주세요.",
  loadingEmail: "이메일을 불러오는 중",
  loadingEmails: "이메일을 불러오는 중",
  localLanguageNotice:
    "이 이메일은 영어 전용으로 만든 로컬 규칙으로 확인했습니다. 스페인어 등 다른 언어의 사기를 놓칠 수 있습니다. 위험 신호가 없다고 해서 안전한 이메일이라는 뜻은 아닙니다.",
  lowerPriority: "나중에 보셔도 됨",
  mailboxes: "내 메일함",
  mayNeedReply: "답장이 필요할 수 있음",
  needsAttention: (label, error) =>
    `${label} 확인이 필요합니다${error ? `: ${error}` : "."}`,
  newEmails: (count) =>
    count === 0 ? "새 이메일이 없습니다." : `새 이메일 ${count}개가 있습니다.`,
  noMailbox: "연결된 메일함이 없습니다.",
  noSigns: "위험 신호를 찾지 못했습니다. 보낸 사람은 확인되지 않았습니다.",
  noSubject: "(제목 없음)",
  noSubjectSpoken: "제목 없음",
  noText: "이 이메일에는 본문이 없습니다.",
  notChecked: "아직 확인하지 않음",
  notCheckedEmail: "아직 확인하지 않은 이메일입니다.",
  notCheckedNote: "아직 확인하지 않음",
  nowTheEmail: "이제 이메일을 읽어드리겠습니다.",
  openManualCheck: "직접 사기 확인 열기",
  opened: (subject) => `열림: ${subject}`,
  paging: {
    loadOlder: "이전 이메일 불러오기",
    loading: "불러오는 중…",
    newer: "최근 이메일",
    noMoreImported:
      "추가로 가져온 이메일이 없습니다. 이전 이메일이 더 있다면 다음 묶음을 불러와 보세요.",
    noOlder: "더 이전 이메일이 없습니다.",
    older: "이전 이메일",
    page: (page) => `${page}페이지 · 한 번에 최대 15개 이메일`,
  },
  preview: "짧은 미리보기",
  readSummary: "요약 소리 내어 읽기",
  readingNow: "읽는 중…",
  readyToRead: "읽을 준비가 되었습니다",
  reconnect: "다시 연결",
  reply: "답장",
  replyAdded: "답장을 초안에 추가했습니다. 검토 전에 수정하실 수 있습니다.",
  replyComposer: {
    nothingSent: (provider) =>
      `아직 보내지 않습니다. 먼저 검토하시면 ${provider}에 초안으로 저장됩니다.`,
    placeholder: "답장을 적어 주세요…",
    replyTo: (to) => `받는 분: ${to}`,
    review: "초안 검토",
    speak: "말하기",
    stopListening: "듣기 중지",
  },
  ride: {
    asked: "차편을 부탁하셨습니다.",
    confirmed: "차편이 확정되었습니다.",
    declined: "차편 요청을 상대방이 거절했습니다.",
  },
  sampleEmails: " 안전하게 연습하실 수 있는 예시 이메일입니다.",
  scamCheck: "사기 확인",
  scamCheckNotDone: "아직 사기 확인을 하지 않았습니다",
  scamSigns: "사기의 징후가 있습니다. 요청한 일을 하시기 전에 확인해 주세요.",
  spokenFrom: (subject, from, body) => `${subject}. 보낸 분: ${from}. ${body}`,
  summarizeCloud: "클라우드 AI로 요약",
  summary: "요약",
  summaryNote: "LifeLink의 짧은 미리보기를 보시거나 클라우드 AI를 선택하세요",
  summarySpoken: "이메일 요약입니다.",
  theEmail: "이메일 원문",
  title: "이메일",
  unknownCheckNotice:
    "저장된 확인 기록에는 클라우드 AI와 로컬 규칙 중 어느 방법을 썼는지 나와 있지 않습니다. 로컬 규칙은 영어만 지원하며 다른 언어의 사기를 놓칠 수 있습니다. 위험 신호가 없다고 해서 안전한 이메일이라는 뜻은 아닙니다.",
  warning: {
    concern:
      "이 이메일에 주의할 부분이 있습니다. 행동하시기 전에 요청 내용을 확인해 주세요.",
    intro: (reason) =>
      `사기일 수 있습니다. ${reason} 확신이 서지 않으시면 답장하거나, 링크를 열거나, 돈을 보내거나, 개인정보를 알려주시기 전에 믿을 수 있는 사람에게 물어봐 주세요.`,
    signs: (signs) => `위험 신호: ${signs}.`,
  },
  warningSigns: "위험 신호",
  warningSignsFound: "위험 신호를 찾았습니다",
  whatShouldIDo: "어떻게 하면 좋을까요?",
};

export { email };
