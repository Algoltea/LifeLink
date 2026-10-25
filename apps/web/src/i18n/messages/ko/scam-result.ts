import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "이 확인에 대해",
  adviceNote:
    "이 조언은 메시지 자체에 담긴 내용이므로 위험 신호로 세지 않습니다",
  adviceTitle: "메시지에 담긴 조언",
  allWords: "LifeLink가 읽은 전체 내용",
  cannotProve:
    "이 결과만으로 메시지가 진짜임을 증명할 수는 없습니다. 예상하지 못한 요청은 이미 알고 계신 연락처를 통해 확인해 주세요.",
  checkDidNotFinish: "확인을 마치지 못했습니다",
  checkingMessage: "메시지를 확인하는 중…",
  compareWithPhoto: "사진과 비교해 주세요",
  confidence: {
    high: "여러 세부 내용이 이 판단을 뒷받침합니다. 그래도 보낸 사람의 신원을 확인할 수는 없습니다.",
    low: "확신하기에는 정보가 부족합니다. 다른 사람의 의견이 도움이 될 수 있습니다.",
    medium:
      "일부 세부 내용이 이 판단을 뒷받침합니다. 별도의 방법으로 요청을 확인해 주세요.",
  },
  couldNotRead: "LifeLink가 이 사진을 또렷하게 읽지 못했습니다",
  delete: "이 확인 기록 삭제",
  deleteConfirm:
    "이 확인 기록을 삭제하시겠어요? 이전 확인 기록에서 사라집니다.",
  deleting: "삭제 중…",
  howChecked: "확인 방법",
  imageUnverified:
    "사진에서 읽은 글이므로 틀리거나 빠진 부분이 있을 수 있습니다. LifeLink가 원본 텍스트와 대조하지 못했습니다. 사진과 비교해 주세요.",
  keep: "이 확인 기록 유지",
  kinds: { email: "이메일", screenshot: "사진 또는 화면 캡처", text: "메시지" },
  localLanguageNotice:
    "이 로컬 확인은 영어 전용입니다. 스페인어 등 다른 언어의 사기를 놓칠 수 있습니다. 위험 신호가 없다고 해서 안전한 메시지라는 뜻은 아닙니다.",
  method: {
    cloud: "허락을 받아 클라우드 AI 서비스가 이 확인을 도왔습니다.",
    cloudOld:
      "클라우드 AI 서비스가 이 이전 확인을 도왔습니다. 허락 여부에 관한 세부 사항은 이 기록에 저장되지 않았습니다.",
    rules:
      "LifeLink가 흔한 위험 신호 규칙을 사용했습니다. 이번 확인을 위해 클라우드 AI 서비스에 메시지를 보내지 않았습니다.",
    rulesFallback:
      "클라우드 AI를 사용할 수 없거나 확인이 완료되지 않아 LifeLink가 흔한 위험 신호 규칙을 사용했습니다. 서비스가 이미 이 내용을 받았을 수 있습니다.",
    rulesOld:
      "LifeLink가 흔한 위험 신호 규칙을 사용했습니다. 이 이전 기록에는 클라우드 AI 서비스에도 메시지를 보냈는지 나와 있지 않습니다.",
  },
  newPhoto: "새 사진 찍기",
  noFullWording:
    "이 확인 기록에는 전체 원문이 저장되지 않았습니다. 위 인용문은 전체 내용을 옮긴 것이 아닙니다. 사진과 비교하시거나 글을 입력해 다시 확인해 주세요.",
  noSigns:
    "뚜렷한 위험 신호를 찾지 못했습니다. 그렇다고 이 메시지가 진짜임을 증명하는 것은 아닙니다.",
  noStepsHint:
    "예상하지 못한 요청에 응하시기 전에 저장된 연락처로 아는 사람에게 확인해 주세요.",
  originalEmail: "이메일 원문",
  originalMessage: "메시지 원문",
  photo: {
    alt: "이번 확인에 사용한 사진",
    larger: "사진 크게 보기",
    noPreview: "이 확인 기록의 사진 미리보기를 사용할 수 없습니다. ",
    readSaved: "저장된 결과는 계속 읽으실 수 있습니다.",
    reopen: "확인 기록을 다시 열어 보세요.",
    see: "사진 보기",
    smaller: "사진 작게 보기",
    smallerAria: "사진 작게 보기",
  },
  photoRetention: {
    old: "이 이전 확인 기록에는 사진 미리보기가 저장되어 있지 않습니다. 기록을 삭제하면 결과는 지워지지만, 이전 사진은 저장 공간에 남을 수 있습니다.",
    owned:
      "사진은 이 확인 기록과 함께 보관됩니다. 기록을 삭제하면 사진도 삭제됩니다. 다만 다른 저장된 확인 기록이나 사진에서 아직 사용 중이면 남아 있습니다.",
  },
  readAloud: "결과 소리 내어 읽기",
  readingPhoto: "사진의 글을 읽는 중…",
  recoveryMessage:
    "이 메시지는 신중하게 살펴봐 주세요. 다시 확인하시거나 믿을 수 있는 사람에게 물어보셔도 됩니다.",
  recoveryPhoto:
    "밝은 곳에서 글자가 모두 보이도록 더 선명한 사진을 찍으시거나 글을 직접 입력해 주세요. 이번 확인으로는 메시지가 진짜인지 알려드릴 수 없습니다.",
  removedQuotes:
    "도우미가 가리킨 일부 표현을 메시지에서 찾지 못해 표시하지 않았습니다.",
  savedWording: "이 확인 기록에 저장된 원문",
  signCount: (count) => `위험 신호 ${count}개`,
  signsNoteMessage: "이 메시지에서 눈에 띈 내용",
  signsNotePhoto: "LifeLink가 사진에서 읽은 글과 함께 표시합니다",
  step: "단계",
  titles: {
    email: "이메일 확인 결과",
    screenshot: "사진 확인 결과",
    text: "메시지 확인 결과",
  },
  typeWords: "대신 글 입력",
  verdicts: {
    likely_safe: "뚜렷한 위험 신호 없음",
    likely_scam: "사기일 가능성이 높음",
    suspicious: "위험 신호를 찾음",
    unsure: "확인되지 않음",
  },
  waitHint:
    "보통 몇 초 정도 걸립니다. 이 화면을 열어 두세요. 그동안 메시지의 링크나 전화번호를 이용하거나 돈을 보내지 마세요.",
  whatNow: "지금 할 일",
};

export { scamResult };
