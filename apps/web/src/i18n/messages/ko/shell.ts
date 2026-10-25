import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "계정 메뉴: ",
  closeMenu: "메뉴 닫기",
  dismissNotice: "안내 닫기",
  familyMember: "가족",
  groupGames: "게임",
  groupHelpWith: "도움받기",
  groupSetup: "내 설정",
  mainNavigation: "주 메뉴",
  menu: "메뉴",
  nav: {
    ask: "LifeLink에 물어보기",
    circle: "믿을 수 있는 사람들",
    connections: "연결",
    documents: "문서",
    email: "이메일",
    family: "가족",
    groceries: "장보기",
    mahjong: "마작",
    messages: "메시지",
    scam: "사기 확인",
    settings: "설정",
    solitaire: "솔리테어",
    today: "오늘",
  },
  needsReview: (label) => `${label}: 검토가 필요합니다.`,
  notTriedAgain: "자동으로 다시 시도하지 않습니다.",
  offline:
    "인터넷에 연결되어 있지 않습니다. 계속 작성하셔도 됩니다. 승인하신 내용은 다시 연결되면 재확인한 뒤 보냅니다.",
  offlineReview: "오프라인 작업을 검토해 주세요",
  offlineWaiting: (count) => ` ${count}건이 기다리고 있습니다.`,
  openAsk: "물어보기 열기",
  openMenu: "메뉴 열기",
  originalRequest: "처음 요청하신 내용",
  playAccount:
    "게임은 이 기기에 저장되며 인터넷 연결 없이도 즐기실 수 있습니다.",
  practiceBannerOn: "연습 모드가 켜져 있습니다.",
  practiceBannerRest: "실제 메시지를 보내지 않습니다.",
  practiceMode: "연습 모드",
  reviewOnToday: "오늘 화면에서 검토",
  signOut: "로그아웃",
  skipToMain: "본문으로 건너뛰기",
  turnOffPractice: "연습 모드 끄기",
  yourOfflineRequest: "오프라인에서 요청하신 내용",
};

export { shell };
