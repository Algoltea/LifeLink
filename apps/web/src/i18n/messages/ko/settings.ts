import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "계정과 권한",
  accountsLink: "LifeLink가 사용할 수 있는 계정",
  aiEmailChecks: "새 이메일을 AI로 확인",
  aiEmailChecksDescription:
    "새 이메일이 도착하면 클라우드 AI 서비스가 사기 위험 신호를 확인합니다. 이전 이메일과 연습용 이메일은 보내지 않습니다.",
  captions: "대화할 때 자막 표시",
  captionsDescription: "LifeLink와 대화할 때 말한 내용을 화면에 표시합니다.",
  characterCount: (count, maximum) => `${maximum}자 중 ${count}자`,
  choicesNotSaved: (error) =>
    `선택하신 내용을 계정에 저장하지 못했습니다. ${error} 아래에서 다시 시도해 주세요.`,
  contrast: "대비",
  contrastDescription:
    "대비를 높이면 글자가 더 진해지고 테두리가 더 뚜렷해집니다.",
  contrastMore: "높은 대비",
  contrastStandard: "기본",
  defaultVoice: "LifeLink 기본 음성",
  demoAllowedHint: "이 스위치는 바꾸면 자동으로 저장됩니다.",
  demoBetweenModes:
    "한 모드에서 준비한 내용을 다른 모드에서 실행하려면 다시 검토해야 합니다.",
  demoDescription:
    "연습 모드에서는 실제로 보내거나, 다른 곳에 저장하거나, 구매하지 않습니다. 실행될 일을 모의로 보여드리며 모두 ‘연습’으로 표시합니다. 안전하게 사용해 보실 수 있도록 예시 사람과 메시지도 추가합니다.",
  demoFailed: (error) =>
    `연습 모드를 변경하지 못했습니다. ${error} 스위치를 다시 눌러 주세요.`,
  demoOff: "연습 모드가 꺼져 있습니다. 이제 승인하신 내용은 실제로 실행됩니다.",
  demoOn: "연습 모드가 켜져 있습니다.",
  demoTitle: "연습 모드",
  demoTurnedOff: "이 앱의 연습 모드가 비활성화되었습니다.",
  demoUse: "연습 모드 사용",
  detailDetailed: "자세히",
  detailShort: "짧게",
  explanations: "설명",
  explanationsDescription:
    "짧게는 요점을 알려드리고, 자세히는 조금 더 풀어서 설명합니다.",
  fullName: "성함",
  groceriesLink: "장보기 목록과 예산",
  hearSample: "예시 음성 듣기",
  helpDescription:
    "LifeLink가 메시지, 사기 확인, 대화 정리 또는 아침 요약을 설명할 때 사용합니다. 본인만 보실 수 있습니다. 아래 선택 사항은 바꾸면 저장되며, 메모는 별도의 메모 저장 버튼으로 저장합니다.",
  helpTitle: "내가 원하는 도움 방식",
  language: "언어",
  languageDescription:
    "LifeLink의 주요 화면과 클라우드 도움말에 사용할 언어를 선택하세요. 열 가지 언어 모두 주요 화면이 번역되어 있으며, 일부 새 화면은 아직 영어로 표시됩니다. 로컬 규칙을 사용하는 사기 확인과 이메일 확인은 영어만 지원하며 다른 언어의 사기를 놓칠 수 있습니다. 인용문과 메시지는 원문을 유지합니다.",
  lessMovement: "화면 움직임 줄이기",
  lessMovementDescription:
    "미끄러지거나 서서히 나타나고 사라지는 효과를 끕니다.",
  loading: "설정을 불러오는 중",
  newsOnToday: "오늘 화면의 뉴스",
  newsOnTodayDescription:
    "오늘 화면에 뉴스 제목 세 개를 표시합니다. 그곳에서 좋은 소식 또는 주요 뉴스를 고르실 수 있습니다.",
  notes: "원하는 도움 방식에 대한 메모",
  notesHint:
    "예를 들어 ‘한 번에 한 단계씩 알려 주세요’라고 적으실 수 있습니다. 이 메모는 LifeLink가 본인께 설명할 때만 사용합니다. 가족에게 보여주거나 메시지에 넣지 않습니다. 클라우드 설명을 허용하시면 이 메모가 메시지와 함께 AI 제공업체에 전달됩니다.",
  notesNotSaved: (error) =>
    `메모를 저장하지 못했습니다. ${error} 적으신 내용은 그대로 있습니다. 다시 시도하시려면 메모 저장을 선택해 주세요.`,
  notesSaveHint: "바꾸신 내용을 보관하시려면 메모 저장을 선택해 주세요.",
  notesSaved: "메모가 저장되었습니다.",
  oneStep: "한 번에 한 단계씩",
  oneStepDescription:
    "설명과 다음 단계를 한 번에 하나씩 보여드리며, 다음 버튼으로 넘어갑니다.",
  permissionsLink: "누가 무엇을 볼 수 있는지",
  postalCode: "우편번호",
  preferredName: "LifeLink가 불러드릴 이름",
  profileNotSaved: (error) =>
    `내 정보를 저장하지 못했습니다. ${error} 입력하신 내용은 그대로 있습니다. 다시 시도하시려면 내 정보 저장을 선택해 주세요.`,
  profileSaveHint:
    "이 부분에서 바꾸신 내용을 보관하시려면 내 정보 저장을 선택해 주세요.",
  profileTitle: "내 정보",
  readAloudAuto: "자동으로 소리 내어 읽기",
  readAloudAutoDescription:
    "LifeLink가 새 하루 요약과 답변을 소리 내어 읽어드립니다.",
  readAloudVoice: "읽어드리는 목소리",
  readAloudVoiceDescription:
    "읽어드릴 목소리를 선택하세요. LifeLink 기본 음성은 기본으로 설정된 목소리를 사용합니다.",
  saveNotes: "메모 저장",
  saveProfile: "내 정보 저장",
  saved: "저장되었습니다.",
  savesAsYouChange: "이 설정은 바꾸시면 자동으로 저장됩니다.",
  seeingAndHearing: "화면과 소리",
  signOff: "메시지 끝에 쓰실 이름",
  signOffPlaceholder: "예: 엄마",
  speakingSpeed: "읽는 속도",
  speakingSpeedDescription: "LifeLink가 소리 내어 읽을 때의 속도입니다.",
  speechQuicker: "빠르게",
  speechSample: "LifeLink가 이렇게 읽어드립니다.",
  speechSlower: "느리게",
  speechUsual: "보통",
  subline: "LifeLink를 편하게 읽고 들을 수 있도록 설정하세요.",
  textSize: "글자 크기",
  textSizeDescription:
    "모든 화면에 적용됩니다. 선택하신 크기는 이 기기에 저장됩니다.",
  textSizeLarge: "크게",
  textSizeLarger: "더 크게",
  textSizeLargest: "가장 크게",
  textSizeStandard: "기본",
  theme: "밝은 화면 또는 어두운 화면",
  themeDark: "어둡게",
  themeLight: "밝게",
  themeSystem: "기기 설정에 맞춤",
  timeZone: "시간대",
  title: "설정",
  trySavingAgain: "다시 저장",
};

export { settings };
