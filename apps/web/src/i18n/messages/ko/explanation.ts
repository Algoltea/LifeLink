import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "설명 닫기",
  cloud:
    "클라우드 AI가 설명했습니다. 모든 인용문을 메시지 원문과 대조했습니다.",
  dateSpoken: (quote, date) =>
    `언급된 날짜: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "언급된 날짜와 시간",
  droppedNote:
    "도우미가 제시한 내용 중 일부는 메시지에 그대로 나와 있지 않아 추측으로 표시하거나 제외했습니다.",
  facts: "메시지에 적힌 내용",
  guessNote: "메시지에 적힌 내용이 아니라 추측입니다.",
  guessSpoken: (text) => `추측: ${text}`,
  guesses: "이런 뜻일 수 있습니다",
  local: {
    chosen:
      "로컬 설명: 내용을 완전히 이해한 것이 아니라 정해진 유형을 찾아 설명합니다. AI 제공업체에 보낸 내용은 없습니다.",
    failed:
      "로컬 설명입니다. 클라우드 설명을 요청하셨지만 완료하지 못했습니다. 제공업체가 이미 이 메시지를 받았을 수 있습니다.",
    limit:
      "로컬 설명입니다. 오늘의 클라우드 설명 이용 한도에 도달하여 추가로 보내지 않았습니다.",
    practice:
      "연습: LifeLink 안에서 설명했습니다. 연습 메시지는 AI 제공업체에 보내지 않습니다.",
    unavailable:
      "로컬 설명입니다. 클라우드 도우미가 설정되지 않아 AI 제공업체에 보낸 내용은 없습니다.",
  },
  localLanguageNotice:
    "로컬 규칙으로 만든 설명은 영어이며 아직 번역되지 않았습니다. 클라우드 설명은 선택하신 언어로 작성할 수 있습니다. 원본 메시지의 인용문은 그대로 유지됩니다.",
  missing: "아직 언급되지 않은 내용",
  missingSpoken: (detail) => `아직 언급되지 않은 내용: ${detail}`,
  moreDetail: "자세히 보기",
  onlyYou: "본인만 보실 수 있습니다.",
  reading: "메시지를 읽는 중…",
  replies: "답장 제안",
  repliesHint:
    "아직 보내지 않습니다. 답장을 메시지 입력란에 넣어드리며, 실행 전에 수정하고 검토하실 수 있습니다.",
  replyLabelFor: (label) => `이 답장 사용: ${label}`,
  requestSpoken: (text, quote) =>
    `요청한 내용: ${text} 상대방의 표현: ${quote}.`,
  requests: "요청한 내용",
  title: "메시지 이해하기",
};

export { explanation };
