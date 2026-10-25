import type { Messages } from "../en";

const voice: Messages["voice"] = {
  captions: "자막",
  connectionProblem: "음성 연결에 문제가 생겼습니다.",
  dictationStopped:
    "음성 입력이 중단되었습니다. 다시 시도하시거나 글로 입력해 주세요.",
  emptyRequest: "요청 내용이 없어 준비하지 않았습니다.",
  inputLabel: "어떤 도움을 원하시나요?",
  lifeLinkSaid: "LifeLink의 말: ",
  microphoneBusy:
    "다른 앱이 마이크를 사용하고 있습니다. 해당 앱을 닫고 다시 시도하시거나 글로 입력해 주세요.",
  microphoneDenied:
    "LifeLink의 마이크 사용이 허용되지 않았습니다. 브라우저의 이 사이트 설정에서 허용하시거나 글로 입력해 주세요.",
  microphoneFailed:
    "마이크를 켜지 못했습니다. 다시 시도하시거나 글로 입력해 주세요.",
  microphoneMissing:
    "마이크를 찾지 못했습니다. 연결되어 있는지 확인하시거나 글로 입력해 주세요.",
  offlineFailed:
    "이 요청을 오프라인으로 저장하지 못했습니다. 입력하신 내용은 그대로 있습니다. 인터넷 연결 후 다시 시도해 주세요.",
  opening: "메시지를 작성할 곳을 여는 중",
  placeholder: "LifeLink에 물어보세요…",
  prepareFailed:
    "준비하지 못했습니다. 말씀하신 분께 다시 시도하거나 글로 입력해 달라고 요청해 주세요.",
  prepared:
    "준비되었습니다. 화면에서 확인하실 수 있으며, 그곳에서 승인하실 때까지 실행되지 않습니다.",
  readAloudUnavailable:
    "소리 내어 읽기를 사용할 수 없습니다. 다시 시도해 주세요.",
  retry:
    "입력하신 내용은 그대로 있습니다. 다시 시도하시려면 보내기를 눌러 주세요.",
  savedOffline:
    "저장되었습니다. 인터넷에 다시 연결되면 LifeLink가 이 요청을 살펴봅니다.",
  screeningConnectionProblem: "통화 확인 연결에 문제가 생겼습니다.",
  screeningDisconnected: "통화 확인 연결이 끊겼습니다.",
  screeningLost: "통화 확인 연결이 끊어졌습니다.",
  screeningMicrophoneStopped:
    "마이크가 중단되었습니다. 다시 연결하시려면 통화 확인을 다시 시작해 주세요.",
  screeningResumeFailed:
    "경고 후 통화 확인을 재개하지 못했습니다. 다시 시작해 주세요.",
  screeningStopped: "통화 확인이 중단되었습니다.",
  send: "보내기",
  sending: "보내는 중",
  speak: "말하기",
  speakHint:
    "글 대신 말씀하시려면 말하기를 눌러 주세요. 승인하실 때까지 아무것도 보내지 않습니다.",
  speaking: "LifeLink가 말하는 중…",
  startFailed: (error) =>
    `음성을 시작하지 못했습니다: ${error} 글로 입력하셔도 됩니다.`,
  stop: "중지",
  talking:
    "LifeLink와 대화 중입니다. 준비한 내용은 승인하실 수 있도록 화면에 표시됩니다.",
  unavailable:
    "지금은 음성을 사용할 수 없으니 글로 입력해 주세요. 승인하실 때까지 아무것도 보내지 않습니다.",
  voiceStopped: "음성이 중단되었습니다.",
  youSaid: "내가 한 말: ",
};

export { voice };
