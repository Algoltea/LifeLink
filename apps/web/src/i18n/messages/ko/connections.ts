import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label) => `계정: ${label}`,
  allowProvider: (label) => `${label}의 화면에서 허용을 선택해 주세요.`,
  appAccount: "앱 자체 계정으로 작동하므로 별도로 로그인하실 필요가 없습니다.",
  callback: {
    back: "연결 화면으로 돌아가기",
    checking: (label) => `${label} 연결을 확인하는 중`,
    connected: (label) => `${label} 연결이 완료되었습니다.`,
    connectedTitle: (label) => `${label} 연결됨`,
    declined: (label) =>
      `${label} 연결을 마치지 못했습니다. 변경된 내용은 없습니다. 다시 시도하셔도 됩니다.`,
    missing:
      "마무리할 연결 없이 이 화면이 열렸습니다. 연결 화면에서 다시 시작해 주세요.",
    practice:
      "연습 모드가 켜져 있습니다. 실제 연결을 마치려면 먼저 설정에서 연습 모드를 꺼 주세요.",
    service: "서비스",
    subline: "서비스를 살펴보거나 다시 시작하시려면 연결 화면으로 돌아가세요.",
    title: "연결 상태",
    unavailable:
      "이 서비스는 LifeLink에서 연결할 수 없습니다. 연결 화면으로 돌아가 제한 사항을 확인해 주세요.",
  },
  canDo: "가능한 일",
  cancel: "취소",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "닫기",
  comingLater: "추후 제공 예정",
  connect: "연결",
  connectProvider: (label) => `${label} 연결`,
  connectionState: (status) => `연결 상태: ${status}.`,
  connectionStates: {
    active: "활성",
    deleted: "삭제됨",
    expired: "만료됨",
    failed: "실패함",
    inactive: "비활성",
    initiated: "시작됨",
    pending: "대기 중",
    revoked: "철회됨",
  },
  detailLabel: (label, summary) => `${label}. ${summary} 자세히 보기.`,
  details: "자세히 보기",
  developerSetupAfter: (label) => ` 실행 후 ${label} 항목을 선택해 주세요.`,
  developerSetupBefore: "LifeLink 운영자에게: 실행할 명령어 ",
  disconnect: (label) => `${label} 연결 해제`,
  disconnectPractice: "연습 계정 연결 해제",
  disconnectTip: (label) =>
    `참고: 상대방이 이 창에서 언제든 ${label} 연결을 해제할 수 있습니다.`,
  disconnected: (label) =>
    `${label} 연결을 해제했습니다. 앞으로 사용하지 않습니다.`,
  discordSetup: (practice) =>
    `${practice ? "실제 Discord를 사용하실 때는 " : ""}믿을 수 있는 사람들에 각 사람의 Discord 사용자 ID를 추가해 주세요.`,
  empty: "표시할 서비스가 없습니다.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "이 앱의 연결 기능은 아직 설정되지 않았습니다. bun run dev:setup 명령을 실행해 주세요.",
    "Please sign in again.": "다시 로그인해 주세요.",
    "Practice connections are only available in practice mode.":
      "연습 연결은 연습 모드에서만 사용할 수 있습니다.",
    "That account could not be found.": "해당 계정을 찾지 못했습니다.",
    "That connection could not be found.": "해당 연결을 찾지 못했습니다.",
    "The connection did not finish. You can try again.":
      "연결을 완료하지 못했습니다. 다시 시도하셔도 됩니다.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "요청을 처리하는 동안 연결이 바뀌었습니다. 연결 화면으로 돌아가 상태를 확인해 주세요.",
    "This connection was not started from your account. Please try connecting again.":
      "본인 계정에서 시작한 연결이 아닙니다. 다시 연결해 주세요.",
    "This service does not use a personal sign-in.":
      "이 서비스는 개인 계정 로그인을 사용하지 않습니다.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "실제 계정을 연결하거나 변경하시려면 먼저 설정에서 연습 모드를 꺼 주세요.",
    "We could not confirm the connection.": "연결을 확인하지 못했습니다.",
  },
  groups: {
    appointments: "약속 관리",
    email: "이메일 읽기와 쓰기",
    messages: "가족과 친구에게 메시지 보내기",
  },
  helperTitle: "다른 분을 위해 설정하고 계신가요?",
  imessageIntro:
    "믿을 수 있는 사람들에서 각 사람을 기존 Photon 연락처에 연결해 주세요. LifeLink는 새 연락처를 등록하지 않습니다.",
  imessageSteps: [
    "상대방이 iMessage를 보낼 때 사용하는 정확한 전화번호 또는 Apple ID 이메일 주소를 저장해 주세요. 같은 사람의 것이라도 전화번호와 이메일은 서로 다른 사용자 주소입니다.",
    "Photon 대시보드에 이 주소가 정확히 등록되어 있는지 확인해 주세요. 없다면 먼저 그곳에 연락처를 추가해 주세요. 그런 다음 믿을 수 있는 사람들에서 iMessage 연결을 선택하고 해당 연락처에 표시된 배정 번호를 사용해 주세요.",
    "상대방에게 저장된 정확한 주소에서 배정 번호로 첫 iMessage를 보내 달라고 요청해 주세요. 첫 메시지가 도착하면 LifeLink가 상대방에게 메시지를 보낼 수 있습니다.",
  ],
  intro: (label) =>
    `LifeLink가 ${label}로 할 수 있는 일입니다. 승인하실 때까지 아무것도 보내지 않습니다.`,
  limitTags: { not_offered: "제공되지 않음", not_wired: "추후 제공 예정" },
  limitsCount: (count) => `LifeLink가 아직 할 수 없는 일 (${count})`,
  limitsTitle: "LifeLink가 아직 할 수 없는 일",
  loading: "연결 정보를 불러오는 중",
  manage: "관리",
  notSetUp:
    "아직 켜져 있지 않습니다. LifeLink를 설정한 분께 켜 달라고 요청해 주세요.",
  openCircle: "믿을 수 있는 사람들 열기",
  permissions: {
    add: "추가",
    calendar: "날짜 찾기",
    draft: "초안",
    message: "메시지",
    money: "금전",
    notice: "알림",
    post: "게시",
    read: "읽기",
    replies: "답장",
    send: "보내기",
    unavailable: "아직 없음",
  },
  practiceAccount: "연습 계정 사용",
  practiceBlocked: (label) =>
    `실제 ${label} 연결이 저장되어 있습니다. 연습 계정으로 대체할 수 없습니다. 관리하시려면 설정에서 연습 모드를 꺼 주세요.`,
  practiceConnected: (label) =>
    `연습용 ${label} 계정이 연결되었습니다. 실제 서비스에 연결하지 않습니다.`,
  practiceDisconnected: (label) =>
    `연습용 ${label} 계정의 연결을 해제했습니다.`,
  practiceMessages: (imessage) =>
    imessage
      ? "연습용 iMessage는 모의로 보여드립니다. 연락처에 있는 분들에게 메시지가 전달되지 않습니다."
      : "연습용 Discord 메시지는 모의로 보여드립니다. 연락처에 있는 분들에게 메시지가 전달되지 않습니다.",
  practiceNeverConnects: "이 연습 계정은 실제 서비스에 연결하지 않습니다.",
  pressConnect: (label) => `아래의 ${label} 버튼을 눌러 주세요.`,
  providers: {
    discord: {
      accountRequirement:
        "가족이 앱 봇과 같은 서버에 있거나, 먼저 봇에 메시지를 보낸 적이 있어야 합니다.",
      capabilities: {
        "discord.receive": {
          label: "답장 받기",
          note: "LifeLink의 Discord 봇이 온라인일 때 답장이 도착합니다.",
        },
        "discord.send": { label: "승인 후 개인 메시지 보내기" },
      },
      summary: "Discord에서 가족과 개인 메시지를 주고받습니다.",
    },
    ebay: {
      accountRequirement: "여기서는 개인 eBay 계정을 연결할 수 없습니다.",
      capabilities: {
        "ebay.search": { label: "eBay 상품 검색" },
        "ebay.selling": { label: "내 판매 상품, 주문 또는 구매" },
      },
      summary:
        "검색은 추후 제공 예정입니다. LifeLink는 구매하거나 판매하지 않습니다.",
    },
    facebook: {
      accountRequirement:
        "Facebook 페이지 기능만 지원합니다. 개인 프로필은 지원하지 않습니다.",
      capabilities: {
        "facebook.page_inbox": { label: "페이지 메시지 읽기와 답장" },
        "facebook.page_post": { label: "승인 후 페이지에 게시" },
        "facebook.personal": {
          label: "개인 타임라인과 친구의 메시지",
          note: "Facebook은 앱이 개인 Messenger 대화를 읽거나 보내는 것을 허용하지 않습니다.",
        },
      },
      summary: "비즈니스 페이지만 해당합니다. 추후 제공 예정입니다.",
    },
    gmail: {
      accountRequirement: "Google 계정이 필요합니다.",
      capabilities: {
        "email.appointments": { label: "이메일에서 약속 찾기" },
        "email.draft": { label: "검토하실 초안 작성" },
        "email.new_message_event": { label: "새 메일 감지 (약 1분마다 확인)" },
        "email.read_selected": { label: "요약할 이메일을 선택하면 읽기" },
        "email.send": { label: "승인 후 이메일 보내기" },
      },
      summary: "이메일을 읽고, 쓰고, 보냅니다. 메일에서 약속을 찾습니다.",
    },
    google_calendar: {
      accountRequirement: "Google 계정이 필요합니다.",
      capabilities: {
        "calendar.create": { label: "승인한 약속 추가" },
        "calendar.read": { label: "다가오는 일정 보기" },
      },
      summary: "승인하신 약속을 캘린더에 추가합니다.",
    },
    google_drive: {
      accountRequirement: "Google 계정이 필요합니다.",
      capabilities: {
        "drive.create": { label: "승인 후 약속 메모를 문서로 저장" },
        "drive.read": {
          label: "Drive에 보관 중인 파일 찾기",
          note: "LifeLink는 파일 이름과 링크만 보며 파일 내부 내용은 보지 않습니다.",
        },
      },
      summary: "파일을 찾고 약속 메모를 저장합니다.",
    },
    imessage: {
      accountRequirement:
        "상대방에게 초대, LifeLink 계정 또는 Photon 대시보드 접근 권한은 필요하지 않습니다.",
      capabilities: {
        "imessage.delivery": {
          label: "전달 상태 안내",
          note: "LifeLink는 메시지를 보낸 것은 알지만 도착했거나 읽었는지는 알 수 없습니다.",
        },
        "imessage.first_contact": {
          label: "새로운 사람과 대화 시작",
          note: "각 사람이 먼저 메시지를 보내야 합니다.",
        },
        "imessage.receive": { label: "답장 받기" },
        "imessage.send": {
          label: "승인 후 문자나 사진 보내기",
          note: "상대방이 첫 메시지를 보낸 뒤에 사용할 수 있습니다.",
        },
      },
      summary:
        "가족과 친구에게 문자를 보냅니다. 각 사람이 첫 메시지를 먼저 보내야 합니다.",
    },
    instacart: {
      accountRequirement: "LifeLink를 통한 구매는 더 이상 제공되지 않습니다.",
      capabilities: {},
      summary: "LifeLink를 통한 구매는 더 이상 제공되지 않습니다.",
    },
    instagram: {
      accountRequirement:
        "Instagram 비즈니스 또는 크리에이터 계정이 필요합니다.",
      capabilities: {
        "instagram.messages": { label: "개인 메시지에 답장" },
        "instagram.personal": { label: "개인 계정" },
        "instagram.post": { label: "승인 후 사진 게시물 공유" },
      },
      summary: "비즈니스와 크리에이터 계정만 해당합니다. 추후 제공 예정입니다.",
    },
    outlook: {
      accountRequirement:
        "Microsoft 계정이 필요합니다. 일부 회사 계정은 관리자 동의가 필요합니다.",
      capabilities: {
        "calendar.create": { label: "승인한 약속을 Outlook 캘린더에 추가" },
        "email.draft": { label: "검토하실 초안 작성" },
        "email.new_message_event": { label: "새 메일이 오면 감지" },
        "email.read_selected": { label: "요약할 이메일을 선택하면 읽기" },
        "email.send": { label: "승인 후 이메일 보내기" },
      },
      summary: "한 번 연결하여 Outlook 메일과 캘린더를 사용합니다.",
    },
    paypal: {
      accountRequirement: "여기서는 개인 PayPal 계정을 연결할 수 없습니다.",
      capabilities: {
        "paypal.invoices": { label: "청구서 조회" },
        "paypal.send_money": {
          label: "다른 사람에게 송금",
          note: "LifeLink는 돈을 보내지 않습니다.",
        },
      },
      summary:
        "청구서 조회는 추후 제공 예정입니다. LifeLink는 돈을 보내지 않습니다.",
    },
    telegram: {
      accountRequirement:
        "가족이 LifeLink에서 만든 전용 링크를 열고 Telegram에서 시작을 눌러야 합니다.",
      capabilities: {
        "telegram.first_contact": {
          label: "새로운 사람과 대화 시작",
          note: "각 사람이 먼저 봇에서 시작을 눌러야 합니다.",
        },
        "telegram.receive": { label: "답장 받기" },
        "telegram.send": { label: "승인 후 메시지나 사진 보내기" },
      },
      summary: "Telegram에서 가족과 메시지를 주고받습니다.",
    },
  },
  realImessage: "실제 iMessage를 사용하실 때는 다음 단계를 따라 주세요.",
  requirements: "필요한 것",
  retry: "다시 연결",
  returnConnected: "이곳으로 돌아오면 연결됨이라고 표시됩니다.",
  setup: "설정",
  signInProvider: (label) =>
    `${label}의 자체 화면에서 로그인합니다. LifeLink는 비밀번호를 보지 않습니다.`,
  signInTheirAccount:
    "대신 설정해 드리는 분의 계정으로 로그인해 주세요. 본인 계정으로 로그인하지 마세요.",
  status: {
    connected: "연결됨",
    disconnected: "연결되지 않음",
    error: "연결 실패",
    notOn: "켜지지 않음",
    pending: "완료되지 않음",
    practice: "연습",
    practiceAccount: "연습 계정",
    ready: "준비됨",
    realSaved: "실제 계정 저장됨",
  },
  subline:
    "이미 사용하시는 서비스를 연결하세요. 각 항목을 열면 LifeLink가 할 수 있는 일을 보실 수 있습니다.",
  telegramSetup: (practice) =>
    `${practice ? "실제 Telegram을 사용하실 때는 " : ""}믿을 수 있는 사람들에서 각 사람을 열고 Telegram 연결을 선택한 뒤 전용 링크를 보내 주세요. 상대방이 시작을 한 번 누르면 됩니다.`,
  title: "연결",
  unavailableFeatures: (label) =>
    `${label}에서 LifeLink가 사용할 수 있는 기능은 아직 없습니다. 계정을 연결하실 필요가 없습니다.`,
  unavailableIntro: (label) =>
    `LifeLink는 아직 ${label}에서 할 수 있는 일이 없습니다.`,
};

export { connections };
