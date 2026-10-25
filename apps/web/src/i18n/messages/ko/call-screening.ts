import type { Messages } from "../en";

const callScreening: Messages["callScreening"] = {
  alertOff: "경고 소리 꺼짐",
  alertPlayed: "경고를 소리로 알려드렸습니다",
  alertPlaying: "경고를 소리로 알려드리는 중",
  alertReady: "경고 준비됨",
  alertUnavailable: "소리를 재생하지 못했습니다. 화면의 경고를 읽어 주세요.",
  askTrusted: "믿을 수 있는 사람에게 물어보기",
  bigger: "글자 크게",
  callCaptions: "통화에서 들은 내용",
  callTime: "통화 시작 후",
  callback:
    "조금이라도 이상하게 느껴지셨다면 전화를 끊고, 이미 믿고 사용하시는 번호로 그 사람이나 회사에 전화해 보세요.",
  callbackAdvice:
    "이상하게 느껴지셨다면 전화를 끊고 믿을 수 있는 번호로 다시 전화해 보세요.",
  caller: "전화한 사람",
  cannotConfirm: "누가 전화했는지는 확인할 수 없습니다.",
  captionSize: "자막 크기",
  captionSource: "틀릴 수 있는 자막을 바탕으로 만들었습니다.",
  captions: "자막",
  captionsEmpty: "통화 내용이 여기에 나타납니다.",
  captionsNotSaved: "이 화면을 떠나실 때까지만 표시하며 저장하지 않습니다.",
  checkMessage: "메시지 확인",
  checkingLastPart: "통화의 마지막 부분에서 위험 신호를 확인하는 중…",
  checksUnavailable:
    "지금은 위험 신호를 확인할 수 없습니다. 통화 내용은 아래에 계속 표시됩니다.",
  clearTitle: "위험 신호를 듣지 못했습니다",
  close: "닫기",
  codes: "인증 코드, 비밀번호 또는 개인정보 요구",
  connectionError:
    "듣기 연결이 끊겼습니다. 자막은 그대로 있습니다. 계속 들으시려면 다시 시작을, 요약을 저장하시려면 완료를 눌러 주세요.",
  consent:
    "확인 기능이 켜져 있는 동안 통화 소리와 내용이 클라우드 AI 서비스에 전송됨을 이해합니다.",
  credentialsReason: "인증 코드나 비밀번호를 알려 달라는 요청입니다.",
  delete: "요약 삭제",
  deleteError: "요약을 삭제하지 못했습니다. 다시 시도해 주세요.",
  deleteNotice:
    "이 요약을 삭제해도 준비하거나 보낸 메시지는 삭제되지 않습니다.",
  deleting: "삭제 중…",
  discard: "요약 버리기",
  earlierAria: "이전 통화 확인 기록",
  finish: "완료",
  finishSave: "마치고 요약 저장",
  flagged: "LifeLink가 주의할 내용으로 표시한 부분",
  flaggedAdvice:
    "인증 코드를 알려주거나 돈을 보내지 마세요. 전화를 끊고 이미 믿고 사용하시는 번호로 다시 전화해 보세요.",
  flaggedBody: "전화한 사람이 사기범이 흔히 요구하는 내용을 요청했습니다.",
  flaggedTitle: (count) => `위험 신호 ${count}개를 들었습니다`,
  gettingReady: "준비 중…",
  guideCaution:
    "위험 신호를 놓칠 수 있습니다. 통화가 이상하게 느껴지시면 전화를 끊고 이미 믿고 사용하시는 번호로 다시 전화해 보세요.",
  guideTitle: "LifeLink가 다음 내용을 소리로 경고해 드릴 수 있습니다:",
  hangUpFirst: "‘제가 다시 전화할게요’라고 말하고 먼저 끊으셔도 괜찮습니다.",
  heard: "LifeLink가 들은 내용",
  heardText: (heardWords) => {
    if (heardWords === undefined) {
      return "LifeLink가 들은 내용 중 사기범의 흔한 요구에 해당하는 것은 없었습니다.";
    }

    const words = heardWords === 1 ? "1단어" : `약 ${heardWords}단어`;

    return `LifeLink가 ${words}를 들었습니다. 사기범의 흔한 요구에 해당하는 내용은 없었습니다.`;
  },
  help: "방금 받은 전화가 진짜인지 확신이 서지 않아요. 정보를 알려주거나 돈을 보내기 전에 함께 확인해 주시겠어요?",
  interrupted:
    "확인 도중 연결이 끊겼습니다. LifeLink가 들은 부분만 확인했습니다.",
  intro:
    "LifeLink가 통화 내용을 화면에 표시하고 AI로 사기 위험 신호를 확인합니다. 신호를 찾으면 소리로 알려드립니다.",
  languageLimit:
    "실시간 통화에는 클라우드 AI를 사용합니다. 로컬 글 확인은 여전히 영어 패턴에 의존하며, 화면을 번역해도 감지할 수 있는 언어가 늘어나지는 않습니다. 연습 대본과 음성 경고는 영어입니다. 자막과 인용한 말은 원래 언어를 유지합니다.",
  listenTitle: "통화 듣기",
  listening: "LifeLink가 듣고 있습니다",
  liveCall: "실제 통화",
  messageReview: "검토할 메시지",
  mixedVoices:
    "이 자막에는 양쪽의 말이 섞여 있으며 틀린 부분이 있을 수 있습니다.",
  money: "돈이나 기프트카드 요구",
  moneyReason: "돈을 보내거나 기프트카드로 지불하라는 요청입니다.",
  mute: "경고 소리 끄기",
  noWarnings: "감지된 위험 신호 없음",
  noWarningsYet: " · 아직 감지된 위험 신호가 없습니다",
  notConfigured:
    "실제 통화 확인은 아직 설정되지 않았습니다. 연습 통화를 해 보시거나 상대방의 말을 입력하실 수 있습니다.",
  notSafe:
    "통화가 안전했다는 뜻은 아닙니다. LifeLink는 위험 신호를 놓칠 수 있으며 누가 전화했는지 확인할 수 없습니다.",
  openStep: "통화하는 동안 이 화면을 열어 두세요.",
  otherDevice:
    "통화 중에 전화기의 마이크를 사용할 수 없다면 다른 기기에서 LifeLink를 열어 주세요.",
  outcomeLabels: {
    clear: "감지된 위험 신호 없음",
    flagged: "위험 신호 감지됨",
    silent: "들은 내용 없음",
    unchecked: "완전히 확인하지 못함",
  },
  partlyChecked:
    "통화의 일부를 확인하지 못했으므로 위험 신호가 더 있을 수 있습니다.",
  paused:
    "경고 소리를 통화 내용으로 듣지 않도록 경고가 재생되는 동안 듣기를 잠시 멈춥니다.",
  permissionDenied:
    "마이크 사용이 허용되지 않았습니다. 브라우저의 사이트 설정에서 마이크를 허용한 뒤 다시 시도해 주세요. 연습 통화를 해 보셔도 됩니다.",
  phoneCall: "전화 통화",
  potentialScam: "사기일 수 있습니다.",
  practice: "연습",
  practiceCall: "연습 통화",
  practiceCaptionSource: "연습 통화 대본의 내용입니다.",
  practiceCaptions: "말하고 있는 내용",
  practiceExplanation:
    "실제가 아닌 연습용 통화입니다. 마이크나 클라우드 AI를 사용하지 않습니다.",
  practiceFlaggedBody:
    "연습 통화 속 사람이 사기범이 흔히 요구하는 내용을 요청했습니다.",
  practiceHeard: "연습 통화에서 한 말",
  practiceHelp:
    "LifeLink의 사기 예방 연습 통화를 해 봤어요. 이런 전화가 오면 어떻게 하면 좋을지 함께 이야기해 볼 수 있을까요?",
  practiceMode:
    "연습 모드가 켜져 있습니다. 마이크 없이 아래의 연습용 통화를 해 보세요.",
  practicePlaying: "연습 통화 재생 중",
  practicePrivacy:
    "마이크나 클라우드 AI를 사용하지 않습니다. 짧은 요약이 이전 확인 기록에 저장됩니다.",
  practiceSaved:
    "연습 통화는 마이크나 클라우드 AI를 사용하지 않습니다. 짧은 요약은 이전 확인 기록에 저장됩니다.",
  practiceSilentBody:
    "말이 재생되기 전에 연습 통화가 끝나 확인할 내용이 없었습니다.",
  practiceSilentTitle: "연습이 일찍 중단되었습니다",
  practiceSource: "연습 대본을 바탕으로 만들었습니다.",
  practiceSummary: "연습 통화 요약",
  practiceTime: "시작 후",
  practiceVoices:
    "연습에서는 누구의 목소리인지 표시합니다. 실제 통화 자막에는 양쪽의 말이 섞여 있으며 말하는 사람을 구분해 표시하지 않습니다.",
  privacy:
    "LifeLink는 통화를 녹음하지 않습니다. 마이크 소리는 자막을 만들기 위해 Google의 Gemini로 전송되며, 자막은 위험 신호를 확인하는 AI 모델로 전송됩니다. 중지하시면 LifeLink는 자막 대신 위험 신호의 짧은 요약을 저장합니다.",
  protect:
    "인증 코드, 비밀번호 또는 돈을 건네지 마세요. 믿을 수 있는 사람에게 물어봐 주세요.",
  quoteNotice: "인용문에 오류가 있을 수 있습니다. 긴 숫자는 숨깁니다.",
  readResult: "결과 소리 내어 읽기",
  remote: "컴퓨터나 전화기를 제어하게 해 달라는 요구",
  remoteReason: "기기에 대한 원격 접속을 허용해 달라는 요청입니다.",
  retrySave: "다시 저장",
  retrySteps: [
    "통화를 스피커폰으로 전환해 주세요.",
    "전화기를 이 기기 가까이에 두세요.",
    "응답하시기 전에 통화 확인을 다시 시작해 주세요.",
  ],
  retryTitle: "다시 시도하는 방법",
  review: "검토",
  saveError:
    "요약을 저장하지 못했습니다. 이 화면을 열어 두고 다시 시도해 주세요.",
  saving: "요약을 저장하는 중…",
  scamWarning: "사기로 의심되는 내용입니다.",
  screenAnotherCall: "다른 통화 확인",
  secrecyReason: "급히 행동하도록 압박하면서 비밀로 하라는 요청입니다.",
  silentBody:
    "LifeLink에 말소리가 전달되지 않아 이 통화의 위험 신호를 확인할 수 없었습니다.",
  silentTitle: "LifeLink가 통화를 듣지 못했습니다",
  smaller: "글자 작게",
  soundUnavailable:
    "소리를 사용할 수 없습니다. 위험 신호는 화면에 계속 표시됩니다.",
  speakerStep: "이 기기 가까이에서 통화를 스피커폰으로 전환해 주세요.",
  start: "듣기 시작",
  startAgain: "다시 시작",
  startError:
    "LifeLink가 듣기를 시작하지 못했습니다. 다시 시도하시거나 연습 통화를 해 보세요.",
  startStep: "듣기 시작을 누르고 마이크 사용을 허용해 주세요.",
  stop: "중지",
  stopListening: "듣기 중지",
  stopPractice: "연습 통화 중지",
  stopped: "듣기가 중지되었습니다",
  summary: "통화 요약",
  summaryNoWarnings: "위험 신호가 감지되지 않았습니다.",
  summarySaved:
    "이전 확인 기록에 짧은 요약으로 저장했습니다. 음성이나 자막은 보관하지 않습니다.",
  summaryStorage:
    "이전 확인 기록에는 짧은 요약만 저장합니다. 음성이나 자막은 보관하지 않습니다.",
  summaryWarnings: "이 통화에는 위험 신호가 있었습니다.",
  tellTrusted: "믿을 수 있는 사람에게 알리기",
  timeLimit: "30분이 지나 확인을 멈췄습니다. 지금까지의 요약입니다.",
  times: "시간은 확인을 시작한 뒤 지난 분과 초입니다. 긴 숫자는 숨깁니다.",
  tryPractice: "연습 통화 해 보기",
  uncheckedBody:
    "대화의 일부에서 위험 신호를 확인할 수 없어 이 요약에서 빠진 신호가 있을 수 있습니다.",
  uncheckedTitle: "LifeLink가 이 통화를 완전히 확인하지 못했습니다",
  unmute: "경고 소리 켜기",
  urgency: "위협 또는 서두르고 비밀로 하라는 압박",
  warningReasons: {
    codes_or_passwords: "인증 코드나 비밀번호를 알려 달라는 요청입니다.",
    gift_cards: "기프트카드로 지불하거나 카드 코드를 알려 달라는 요청입니다.",
    money: "돈을 보내거나 저축한 돈을 옮기라는 요청입니다.",
    personal_details: "개인정보나 은행 정보를 알려 달라는 요청입니다.",
    remote_access: "기기에 대한 원격 접속을 허용해 달라는 요청입니다.",
    secrecy_or_pressure: "비밀로 하라는 요구 또는 즉시 행동하라는 압박입니다.",
    threats: "체포, 벌금 또는 계정 폐쇄에 대한 위협입니다.",
  },
  warningSign: "위험 신호",
  warnings: "감지된 위험 신호",
  you: "나",
};

export { callScreening };
