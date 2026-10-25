import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "합의한 내용",
  agreedSpoken: (text) => `합의한 내용: ${text}`,
  changedNote:
    "도우미가 제시한 내용 중 일부는 메시지에 그대로 나와 있지 않거나 합의가 아닌 제안이어서 수정하거나 제외했습니다.",
  close: "대화 정리 닫기",
  cloud:
    "허락을 받아 요청한 클라우드 AI 대화 정리입니다. 모든 인용문을 메시지 원문과 대조했습니다.",
  cloudConsent:
    "더 자세한 대화 정리를 위해 클라우드 도우미를 사용합니다. 이 사람과 주고받은 최근 메시지를 AI 제공업체에 보냅니다. 선택하지 않으시면 LifeLink에서 간단히 정리합니다.",
  done: "완료된 일",
  doneFromRecords:
    "메시지 내용이 아니라 LifeLink의 자체 기록을 바탕으로 합니다.",
  inShort: "간단히 정리하면",
  intro: (contactName) =>
    `LifeLink가 ${contactName} 님과 합의하신 내용, 제안만 나온 내용, 아직 정해지지 않은 내용을 정리해 드릴 수 있습니다.`,
  loading: "대화 정리를 불러오는 중",
  local: {
    chosen:
      "LifeLink에서 간단히 정리했습니다. 내용을 완전히 이해한 것이 아니라 정해진 유형을 찾아 정리합니다. AI 제공업체에 보낸 내용은 없습니다.",
    failed:
      "LifeLink에서 간단히 정리했습니다. 클라우드 정리를 요청하셨지만 완료하지 못했습니다. 제공업체가 이미 이 메시지들을 받았을 수 있습니다.",
    limit:
      "LifeLink에서 간단히 정리했습니다. 오늘의 클라우드 대화 정리 이용 한도에 도달하여 추가로 보내지 않았습니다.",
    practice:
      "연습: LifeLink에서 간단히 정리했습니다. 연습 메시지는 AI 제공업체에 보내지 않습니다.",
    unavailable:
      "LifeLink에서 간단히 정리했습니다. 클라우드 도우미가 설정되지 않아 AI 제공업체에 보낸 내용은 없습니다.",
  },
  messageTo: (contactName) => `${contactName}에게 보내는 메시지`,
  nextSteps: "다음에 하실 수 있는 일",
  nextStepsHint:
    "단계를 준비하고, 검토하고, 승인하실 때까지 아무것도 실행되지 않습니다.",
  noFinishedTasks: (contactName) =>
    `이 기간에 ${contactName} 님과 관련해 완료된 작업이 LifeLink에 없습니다. 메시지에 적혀 있다는 것만으로 완료된 일로 보지는 않습니다.`,
  offerNote: "제안은 상대방이 동의해야 합의가 됩니다.",
  offered: "제안되었지만 아직 합의되지 않음",
  offeredSpoken: (text) => `제안되었지만 아직 합의되지 않은 내용: ${text}`,
  onlyYou: "본인만 보실 수 있습니다. 가족에게 보내거나 공유하지 않습니다.",
  part: "부분",
  practiceNote:
    "연습 모드에서는 LifeLink가 직접 대화를 정리합니다. 연습 메시지는 AI 제공업체에 보내지 않습니다.",
  prepare: "검토할 내용 준비",
  prepared: "준비되었습니다. 검토해 주세요",
  readAloud: "대화 정리 소리 내어 읽기",
  reading: "대화를 읽는 중…",
  recapAgain: "다시 정리",
  recapThis: "이 대화 정리",
  recapWithCloud: "클라우드 AI로 정리",
  reminderForYou: "나를 위한 알림",
  stillUnclear: "아직 분명하지 않은 내용",
  title: (contactName) => `${contactName} 님과의 대화 정리`,
  unclearSpoken: (text) => `아직 분명하지 않은 내용: ${text}`,
  you: "나",
};

export { recap };
