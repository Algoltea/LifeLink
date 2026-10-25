import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "대화 기록 닫기",
  composerLabel: "LifeLink에 글이나 말로 요청해 주세요",
  conversationLabel: "LifeLink와의 대화",
  copied: "복사됨",
  copy: "복사",
  copyUnavailable:
    "여기서는 복사 기능을 사용할 수 없습니다. 대신 글을 직접 선택하실 수 있습니다.",
  emailSummary: {
    cloud: "클라우드 요약",
    cloudConsent:
      "더 자세한 요약을 위해 클라우드 AI를 사용합니다. 가져온 이메일 중 가장 최근 15개의 읽을 수 있는 본문과 저장된 요약을 AI 제공업체에 보냅니다. 선택하지 않으시면 LifeLink 안에서 요약합니다.",
    count: (count) => `최근에 가져온 이메일 ${count}개 · `,
    empty:
      "아직 가져온 이메일이 없습니다. 이메일 화면에서 새 이메일을 확인한 뒤 다시 요약해 주세요.",
    emptyGroup: "이 분류에 해당하는 이메일이 없습니다.",
    groups: {
      check_first: "행동하기 전에 확인",
      low_priority: "나중에 보셔도 됨",
      reply: "답장이 필요할 수 있음",
      review: "살펴보시면 좋음",
    },
    howMade: "이 요약을 만든 방법",
    local: "LifeLink 요약",
    noSubject: "(제목 없음)",
    offline: "가져온 이메일을 요약하려면 인터넷에 연결해 주세요.",
    openEmail: "이메일 열기",
    options: "요약 옵션",
    practicePrefix: "연습 · ",
    suggestionsOnly:
      "참고용 제안입니다. 행동하시기 전에 원본 메시지를 확인해 주세요. 메일함에서 보내거나 변경한 내용은 없습니다.",
    summarize: "이메일 요약",
    summarizing: "이메일 요약 중…",
    title: "최근 이메일 요약",
    working: "이 대화에 이메일 요약을 추가하는 중…",
  },
  failed: "답변을 끝까지 작성하지 못했습니다. 다시 물어봐 주세요.",
  history: "기록",
  historyDescription: "지난 대화를 이어가세요.",
  historyEmpty: "아직 대화가 없습니다. 첫 대화가 여기에 저장됩니다.",
  historyGroups: { earlier: "이전", thisWeek: "이번 주" },
  historyTitle: "대화 기록",
  lifeLinkSaid: "LifeLink의 말: ",
  loadEarlier: "이전 메시지 보기",
  loadEarlierConversations: "이전 대화 보기",
  loadingConversation: "대화를 불러오는 중",
  loadingConversations: "대화를 불러오는 중…",
  loadingEarlier: "이전 메시지를 불러오는 중…",
  loadingHistory: "대화 기록을 불러오는 중",
  newChat: "새 대화",
  openNow: ", 현재 열림",
  opening: "대화를 여는 중",
  quickActions: "빠른 요청",
  suggestions: {
    reminder: { label: "알림 설정", prompt: "다음 내용을 알려 주세요: " },
    ride: {
      label: "차편 부탁하기",
      prompt:
        "이 날짜에 약속 장소까지 태워 줄 수 있는지 가족에게 물어봐 주세요: ",
    },
    write: {
      label: "가족에게 글쓰기",
      prompt: "이 사람에게 보낼 메시지를 쓰도록 도와주세요: ",
    },
  },
  thinking: "생각하는 중…",
  title: "LifeLink에 물어보기",
  titlePrefix: "LifeLink에 물어보기: ",
  waitingConnection: "연결을 기다리고 있습니다. 아직 보낸 내용은 없습니다.",
  waitingForConnection: "연결을 기다리는 메시지",
  whatCanIHelp: "오늘은 무엇을 도와드릴까요?",
  youSaid: "내가 한 말: ",
  yourConversation: "내 대화",
};

export { ask };
