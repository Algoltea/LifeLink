import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "글자 크기", value: "크게" },
      { label: "답장 소리 내어 읽기", value: "켜짐 · 느리게" },
      { label: "움직임 줄이기", value: "켜짐" },
      { label: "대비", value: "강하게" },
      { label: "통화 자막", value: "켜짐" },
    ],
    intro:
      "가족에게 보내는 메시지, 약속, 알림까지 모두 큰 글씨와 소리 내어 읽기로 도와드립니다. 보내질 내용은 언제나 회원님의 결정을 기다립니다.",
    messages: {
      description:
        "iMessage, 이메일, Discord, Telegram으로 가족에게 연락하세요. ‘내용 이해하기’는 받은 메시지를 설명하고 고를 수 있는 답장을 제안합니다.",
      imageAlt:
        "메리 커셋, 〈편지〉: 파란 무늬 드레스를 입은 여인이 책상에서 편지를 봉하고 있습니다.",
      imageCaption: "메리 커셋, 〈편지〉, 1890–91년.",
      title: "가족에게 보내는 메시지",
    },
    read: {
      description:
        "더 큰 글씨, 더 강한 대비, 자막, 더 느린 읽기 목소리. 원할 때는 언제든 입력 대신 말로 하세요. 설정은 모든 화면에 그대로 적용됩니다.",
      imageAlt:
        "에두아르 마네, 〈책 읽는 여인〉: 어두운 코트와 모자 차림의 여인이 야외에서 화보 잡지를 읽고 있습니다.",
      imageCaption: "에두아르 마네, 〈책 읽는 여인〉, 1880–82년.",
      title: "읽고, 듣고, 말하기",
    },
    reminder: {
      approve: "알림 승인",
      changeTime: "시간 변경",
      title: "새 알림",
      version: "버전 1",
      what: "Ana에게 전화하기",
      when: "11월 1일 일요일 · 오전 11:00",
      youSaid: "회원님 말씀: “일요일에 Ana에게 전화하라고 알려 줘.”",
    },
    reminders: {
      description:
        "‘오늘’은 먼저 처리할 일을 보여 주고, 이어서 약속과 알림을 보여 줍니다. 기억할 일을 말하면 LifeLink가 적어 두고 승인을 기다립니다.",
      title: "약속과 알림",
    },
    tab: "일상 도움",
    thread: {
      helpMeUnderstand: "내용 이해하기",
      reply: "물론이죠! 9시 45분에 댁으로 갈까요? Max도 데려갈지 몰라요.",
      sent: "오전 9:05 보냄 · 버전 2",
      sentMessage:
        "Sam, 10월 27일 화요일에 Patel 선생님께 태워다 줄 수 있을까요?",
    },
    title: "LifeLink가 도와드리는 일",
    today: {
      comingUp: "다가오는 일정",
      confirmPickup: "Sam의 9시 45분 픽업 확인",
      greeting: "안녕하세요, Ruth 님",
      review: "검토",
      rows: [
        { detail: "알림 · 오늘", time: "오후 8:00", title: "저녁 약" },
        {
          detail: "아직 확인 안 됨",
          time: "오전 9:45",
          title: "Sam이 모시러 옴",
        },
        {
          detail: "10월 27일 화요일",
          time: "오전 10:30",
          title: "Patel 선생님",
        },
      ],
      waiting: "회원님을 기다리는 일",
    },
  },
  features: {
    hint: "예시입니다. 스크롤하거나 줄을 가리키면 LifeLink의 해당 기능이 여기에 보입니다.",
    items: {
      circle: {
        name: "믿을 수 있는 사람들",
        summary:
          "코드로 초대하고, 무엇을 얼마 동안 볼 수 있는지 정하고, 언제든 공유를 멈출 수 있습니다.",
      },
      connections: {
        name: "연결",
        summary:
          "계정마다 되는 것, 아직 준비되지 않은 것, 제공하지 않는 것을 분명히 알려 줍니다.",
      },
      documents: {
        name: "문서",
        summary: "Google Drive 파일을 각각 미리 보기와 함께 보여 줍니다.",
      },
      email: {
        name: "이메일",
        summary:
          "사기처럼 보이는 이메일을 표시하고, 저절로 보내지지 않는 답장 초안을 씁니다.",
      },
      family: {
        name: "가족 화면",
        summary:
          "가족이 보는 페이지입니다. 회원님이 공유한 것만, 사진과 답장 칸과 함께 보입니다.",
      },
      groceries: {
        name: "장보기",
        summary:
          "예산과 예상 비용이 담긴 목록을 복사하거나 인쇄해 장을 보러 갈 수 있습니다.",
      },
      help: {
        name: "원하는 도움 방식",
        summary:
          "짧거나 자세한 답변을, 한 번에 한 단계씩, 원하는 언어로 받으세요.",
      },
      recap: {
        name: "대화 요약",
        summary: "합의된 것과 제안만 된 것을 구분하고, 다음 단계를 제안합니다.",
      },
      today: {
        name: "오늘",
        summary:
          "먼저 처리할 일, 이어서 약속, 날씨, 회원님이 고른 뉴스 세 가지를 보여 줍니다.",
      },
    },
    titleLine1: "그 밖에",
    titleLine2: "할 수 있는 일",
  },
  footer: {
    credits: {
      afterLicense:
        ", Wikimedia Commons. 화면 예시는 샘플 데이터를 사용합니다.",
      byAuthor: "제작 RedKnight7,",
      morse:
        ". 모스 전신 키와 기록기, 1876년: 퍼블릭 도메인, Wikimedia Commons.",
      paintings:
        "메리 커셋, 〈편지〉; 에두아르 마네, 〈책 읽는 여인〉; 클로드 모네, 〈푸르빌의 절벽 산책〉과 〈수련 연못〉; 장자크 드 부아시외, 〈소년과 함께 책 읽는 노인〉: 퍼블릭 도메인(CC0),",
      telegram: "1959년 웨스턴 유니언 전보",
    },
    getStarted: "시작하기",
    label: "바닥글",
    links: {
      everydayHelp: "일상 도움",
      howItWorks: "이용 방법",
      language: "언어",
      ourPromise: "우리의 약속",
      questions: "자주 묻는 질문",
      scamCheck: "사기 확인",
    },
    pictures: "그림",
    signIn: "로그인",
    solitaire: "솔리테어",
    tagline:
      "일상 메시지를 도와드립니다. 회원님이 허락하기 전에는 아무것도 보내지 않습니다.",
  },
  hero: {
    getStarted: "시작하기",
    imageAlt:
      "클로드 모네, 〈푸르빌의 절벽 산책〉: 꽃이 핀 절벽 위 두 사람과, 돛단배가 떠 있는 밝은 바다.",
    imageCaption: "클로드 모네, 〈푸르빌의 절벽 산책〉, 1882년.",
    intro:
      "LifeLink는 가족에게 연락하고, 약속을 챙기고, 수상해 보이는 문자나 편지를 확인하도록 도와드립니다. 모든 메시지는 승인하기 전에 처음부터 끝까지 직접 읽어 보실 수 있습니다.",
    seeHowItWorks: "이용 방법 보기",
    titleLine1: "허락하기 전에는",
    titleLine2: "아무것도 보내지 않습니다.",
  },
  howItWorks: {
    done: "완료",
    exampleTimes: "예시 시간",
    imageAlt:
      "모스 전신 키, 계전기, 기록기를 새긴 판화. 표시기, 계전기, 키, 회선 전지라고 적혀 있습니다.",
    imageCaption:
      "모스 전신 키와 기록기, Popular Science Monthly 판화, 1876년.",
    intro:
      "차편 요청 하나를 처음부터 끝까지 보여 드립니다. 단계마다 쉬운 말로 이름이 붙어 있어, 무엇이 일어났고 무엇이 아직인지 늘 알 수 있습니다.",
    result: "두 번 승인하셨습니다. 그 밖에는 아무것도 보내지 않았습니다.",
    slipTitle: "Patel 선생님께 가는 차편",
    timeline: [
      {
        heading: "월요일 오전",
        steps: [
          { label: "차편을 부탁함", time: "오전 9:02" },
          { label: "LifeLink가 메시지를 작성함", time: "오전 9:02" },
          {
            decision: true,
            label: "단어 하나를 고치고 버전 2를 승인함",
            time: "오전 9:05",
          },
          { label: "iMessage로 Sam에게 보냄", time: "오전 9:05" },
        ],
      },
      {
        heading: "월요일 오후",
        steps: [
          { label: "Sam의 답장: “물론이죠, 9시 45분?”", time: "오후 1:40" },
          { decision: true, label: "픽업 시간을 확인함", time: "오후 1:52" },
        ],
      },
      {
        heading: "10월 27일 화요일",
        steps: [
          { label: "알림: Sam이 9시 45분에 도착", time: "오전 9:15" },
          { label: "Patel 선생님 진료 예약", time: "오전 10:30" },
        ],
      },
    ],
    titleLine1: "요청한 뒤에",
    titleLine2: "일어나는 일",
  },
  language: {
    intro:
      "이 페이지의 언어를 고르세요. 계정을 만들면 LifeLink가 이 선택을 그대로 유지합니다. 이미 계정이 있다면 로그인할 때 계정에서 고른 언어가 사용됩니다.",
    title: "언어",
  },
  messageSlip: {
    approve: "승인하고 보내기",
    message:
      "Sam, 10월 27일 화요일에 Patel 선생님께 태워다 줄 수 있을까요? 오전 10시 30분까지 가야 해요. 고마워요! Ruth",
    notSent: "아직 보내지 않음",
    sent: "오전 9:05에 보냈습니다. 그 밖에는 아무것도 보내지 않았습니다.",
    showAgain: "다시 보기",
    to: "받는 사람: Sam Rivera · iMessage",
    version: "버전 2",
  },
  nav: {
    howItWorks: "이용 방법",
    language: "언어",
    questions: "자주 묻는 질문",
    scamCheck: "사기 확인",
    signIn: "로그인",
  },
  previews: {
    approveAndSend: "승인하고 보내기",
    circle: {
      appointments: "약속",
      code: "일회용 초대 코드",
      notShared: "공유 안 함",
      note: "12월 31일까지",
      rides: "차편",
      scamAlerts: "사기 경고",
      shared: "공유함",
      stop: "지금 공유 중지",
      title: "Sam Rivera와 공유 중",
    },
    connections: {
      add: "승인된 약속 추가",
      footnote: "각 연결은 실제로 할 수 있는 일만 보여 줍니다.",
      notReady: "아직 준비 안 됨",
      note: "연결됨",
      see: "다가오는 일정 보기",
      works: "작동함",
    },
    documents: {
      files: [
        { date: "10월 12일", name: "Medicare 요약.pdf" },
        { date: "9월 30일", name: "Ana의 수프 레시피" },
        { date: "9월 14일", name: "정원 사진" },
      ],
      footnote:
        "파일을 고르면 미리 볼 수 있습니다. 수정이나 공유는 Google Drive에서 하세요.",
      title: "문서",
    },
    email: {
      anaSubject: "일요일에 점심 어때요? 사진 앨범 가져와요!",
      draftBody:
        "일요일 좋아요. 앨범 가져갈게요. 12시 30분 괜찮아요? 사랑을 담아, Ruth",
      draftTitle: "Ana에게 답장 · 초안, 보내지 않음",
      note: "새 메일 3통",
      parcelSender: "택배 배송 서비스",
      parcelSubject: "조치 필요: 택배가 보류되었습니다",
      scamWarning: "사기로 보입니다. 링크로 결제를 요구합니다.",
      title: "이메일",
    },
    family: {
      footnote:
        "Sam은 읽고 답장할 수 있습니다. Sam은 Ruth 대신 보내거나, 승인하거나, 돈을 쓸 수 없습니다.",
      nextAppointment: "다음 약속",
      note: "Sam에게 보이는 화면",
      photos: "정원에서 찍은 새 사진 2장",
      replyLabel: "Ruth에게 답장",
      replyText: "화요일 9시 45분에 봬요!",
      title: "Ruth의 소식",
      when: "Patel 선생님, 화요일 오전 10:30",
    },
    groceries: {
      copy: "목록 복사",
      items: [
        { label: "귀리 우유, 2개", value: "$7.98" },
        { label: "통곡물 빵", value: "$4.49" },
        { label: "사과, 6개", value: "$5.20" },
        { label: "Ana 방문용 수프 재료", value: "$18.40" },
      ],
      note: "예산 $80 중 $62",
      print: "인쇄",
      title: "이번 주 장보기",
    },
    help: {
      answers: "답변",
      language: "도움 언어",
      noteLabel: "비공개 메모",
      noteText: "전화로는 잘 안 들려요. 먼저 문자를 제안해 주세요.",
      on: "켜짐",
      oneStep: "한 번에 한 단계씩",
      short: "짧게",
      title: "원하는 도움 방식",
    },
    recap: {
      agreed: "합의함",
      agreedText: "Sam이 화요일에 9시 45분에 모시러 와서 태워 드립니다.",
      nextStep: "제안된 다음 단계",
      nextStepText: "월요일 저녁에 알려 주기.",
      offered: "제안만 함",
      offeredText: "Sam이 Max를 데려올 수도 있습니다.",
      review: "알림 검토",
      title: "요약",
    },
    today: {
      goodNews: "회원님이 고른 좋은 소식",
      headlines: [
        "도서관, 일요일 개관 시간 연장",
        "자원봉사자들이 마을 장미 정원 복원",
        "여름 맞아 여객선 운항 재개",
      ],
      note: "월요일",
      pickup: "Sam의 9시 45분 픽업 확인",
      title: "좋은 아침이에요, Ruth 님",
      waiting: "회원님을 기다리는 일",
      weather: "날씨",
      weatherValue: "58°F, 약한 비",
    },
  },
  promise: {
    howSharingWorks: "공유 방식 알아보기",
    leftImageAlt:
      "작은 탁자 옆에서 어린 소년을 무릎에 앉히고 책을 읽는 노인의 에칭.",
    leftImageCaption:
      "장자크 드 부아시외, 〈소년과 함께 책 읽는 노인〉, 1770년.",
    promises: [
      "회원님이 읽고 승인하지 않은 것은 절대 보내지 않습니다. 승인한 뒤 메시지가 바뀌면 다시 여쭙니다.",
      "가족은 가까이 있되 대신 결정하지 않습니다. 믿을 수 있는 사람이 약속이나 차편처럼 무엇을, 얼마 동안 볼 수 있는지 회원님이 정합니다. 그 사람은 회원님 대신 보내거나, 승인하거나, 돈을 쓸 수 없습니다.",
      "연습일 뿐일 때는 그렇다고 말씀드립니다. 문제가 생기면 무슨 일이 있었는지, 잃어버린 것은 없는지, 다음에 무엇을 하면 되는지 알려 드립니다.",
      "그리고 어떤 메시지도 안전하다고 말하지 않습니다. 경고 신호를 보여 드리고 결정은 회원님께 맡깁니다.",
    ],
    rightImageAlt:
      "1959년 웨스턴 유니언 전보. 대문자로 타자되어 있고 도장과 손글씨 메모가 있습니다.",
    rightImageCaption:
      "웨스턴 유니언 전보, 1959년. 한 단어 한 단어가 소중했고, 누군가 서명하고 받았습니다.",
    sharing:
      "‘믿을 수 있는 사람들’에서 언제든 공유를 바꾸거나 멈출 수 있습니다.",
    signature: "일상 도움. 결정은 회원님이.",
    tab: "우리의 약속",
    title: "LifeLink가 절대 하지 않는 일",
  },
  questions: {
    imageAlt:
      "클로드 모네, 〈수련 연못〉: 수련으로 덮인 연못 위로 초록색 다리가 걸려 있습니다.",
    imageCaption: "클로드 모네, 〈수련 연못〉, 1900년.",
    intro: "가장 많이 묻는 질문의 답을 이 페이지에 모두 모았습니다.",
    items: [
      {
        answer:
          "샘플 가족, 이메일, 약속으로 모든 기능을 직접 써 볼 수 있습니다. 실제로는 아무것도 보내지 않으며, 모든 결과에 ‘연습’ 표시가 붙습니다.",
        question: "연습 모드란 무엇인가요?",
      },
      {
        answer:
          "네. 필요한 것을 말씀하시면, LifeLink가 원하는 속도로 답장을 읽어 드릴 수 있습니다.",
        question: "입력 대신 말로 해도 되나요?",
      },
      {
        answer:
          "아니요. 회원님이 공유한 것만 볼 수 있고, 회원님 대신 보내거나, 승인하거나, 돈을 쓸 수 없습니다.",
        question: "가족이 저 대신 처리할 수 있나요?",
      },
      {
        answer:
          "Gmail, Outlook, Google 캘린더, 그리고 iMessage, Discord, Telegram입니다. 각각 되는 것과 아직 안 되는 것을 분명히 보여 줍니다.",
        question: "어떤 계정을 연결할 수 있나요?",
      },
      {
        answer:
          "아니요. 목록을 보관하고 비용과 예산을 추정한 다음, 목록을 복사하거나 인쇄해 직접 장을 보실 수 있게 합니다.",
        question: "LifeLink가 장보기를 주문하나요?",
      },
      {
        answer:
          "새 버전이 되며, LifeLink는 무엇이든 보내기 전에 그 버전을 승인해 달라고 요청합니다.",
        question: "메시지를 고치면 어떻게 되나요?",
      },
      {
        answer:
          "아니요. 보냄, 답장 받음, 확인됨은 서로 다른 단계이며, LifeLink가 지금 어느 단계인지 말로 알려 드립니다.",
        question: "‘보냄’은 ‘합의함’과 같은가요?",
      },
      {
        answer:
          "경고 신호와 더 안전한 다음 단계를 알려 드립니다. 메시지가 안전하다고 약속하지는 않습니다.",
        question: "메시지가 안전하다고 알려 줄 수 있나요?",
      },
      {
        answer:
          "솔리테어는 되며, 게임은 이 기기에 저장됩니다. 메시지는 인터넷 연결이 필요합니다.",
        question: "인터넷 없이도 되나요?",
      },
      {
        answer:
          "무슨 일이 있었는지, 잃어버린 것은 없는지, 다음에 무엇을 하면 되는지 보여 드립니다.",
        question: "문제가 생기면 어떻게 되나요?",
      },
    ],
    tab: "자주 묻는 질문",
    title: "자주 묻는 질문",
  },
  scamCheck: {
    beCareful: "이 메시지를 조심하세요.",
    checkMessage: "메시지 확인하기",
    example: "예시",
    examples: {
      call: {
        label: "전화",
        nextStep:
          "전화를 끊고, 이미 알고 계신 번호로 손주에게 직접 전화하세요.",
        received:
          "전화한 사람이 손주가 곤란한 상황이라 오늘 당장 돈을 보내야 한다고 말합니다.",
        signs: [
          "급하게 돈을 요구합니다.",
          "통화 내용을 비밀로 하라고 합니다.",
          "기프트 카드나 송금으로 결제하라고 합니다.",
        ],
      },
      email: {
        label: "이메일",
        nextStep:
          "카드에 적힌 번호로 은행에 전화하세요. 이 이메일에 답장하지 마세요.",
        received:
          "은행 계좌가 잠겼습니다. 해지를 막으려면 오늘 정보를 확인하세요.",
        signs: [
          "계좌를 해지하겠다고 위협합니다.",
          "개인 정보를 확인하라고 합니다.",
          "보낸 사람 주소가 은행과 맞지 않습니다.",
        ],
      },
      letter: {
        label: "편지",
        nextStep: "돈을 내거나 무엇을 보내기 전에 상금 회사를 직접 찾아보세요.",
        received:
          "$5,000에 당첨되셨습니다. 상금을 받으려면 수수료 $40를 보내세요.",
        signs: [
          "받기 전에 먼저 돈을 내야 합니다.",
          "응모한 적이 없습니다.",
          "누가 보냈는지 확인할 방법이 없습니다.",
        ],
      },
      text: {
        label: "문자",
        nextStep:
          "택배 회사 앱이나 웹사이트를 직접 여세요. 이 링크는 쓰지 마세요.",
        received:
          "택배가 대기 중입니다. 30분 안에 재배송비 $1.99를 결제하세요: parcel-redeliver.co/pay",
        signs: [
          "서두르게 합니다: 30분 안에 결제.",
          "링크로 결제를 요구합니다.",
          "링크가 택배 회사의 공식 사이트가 아닙니다.",
        ],
      },
    },
    intro:
      "문자를 붙여 넣거나, 이메일을 고르거나, 편지를 찍거나, 스피커폰으로 통화를 확인하세요. LifeLink가 경고 신호를 짚어 주고 안전한 다음 단계를 제안합니다. 메시지가 안전하다고 말하지는 않습니다.",
    kinds: "확인할 메시지 종류",
    panelTitle: "사기 확인",
    saferStep: "더 안전한 다음 단계",
    tab: "사기 확인",
    title: "진짜 메시지인지 확실하지 않으신가요?",
    whatItLooksFor: "무엇을 살피나요",
  },
  solitaire: {
    boardDescription:
      "진행 중인 클론다이크 솔리테어 게임. 스페이드 8이 하트 9 위로 옮겨집니다.",
    controls: ["되돌리기", "힌트", "새 게임"],
    intro:
      "크고 또렷한 카드로 즐기는 클론다이크. 카드를 눌러 옮기거나 키보드로 플레이하세요. 되돌리기와 힌트는 언제나 한 번만 누르면 되고, 게임은 인터넷이 없어도 이 기기에 저장됩니다.",
    noAccount: "계정이 필요 없습니다.",
    play: "솔리테어 하기",
    saved: "이 기기에 게임 저장됨",
    titleLine1: "조용히 즐기는",
    titleLine2: "솔리테어 한 판",
  },
  start: {
    alreadyHaveOne: "계정을 만들게 됩니다. 이미 계정이 있으신가요?",
    defaultRequest: "Sam이 화요일 진료 예약에 태워다 줄 수 있을까요?",
    intro:
      "LifeLink에 필요한 것을 말씀하시고, 무엇이든 보내기 전에 메시지 전체를 읽어 보세요. 먼저 둘러보고 싶으신가요? 샘플 메시지로 써 볼 수 있습니다.",
    myFamily: "우리 가족",
    request: "요청 내용",
    sampleFamily: "샘플 가족",
    seeDraft: "초안 보기",
    signIn: "로그인",
    titleLine1: "요청 하나로",
    titleLine2: "시작하세요",
    tryWith: "다음으로 써 보기",
    whatHelp: "어떤 도움이 필요하신가요?",
  },
};

export { landing };
