import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " 및 ",
  appointment: "일정",
  budget: (amount) => ` 예산: ${amount}.`,
  by: (channel) => `보내는 방법: ${channel}`,
  calendar: "캘린더",
  confirming: "확정하실 내용",
  document: "문서",
  draftSavedIn: (provider) =>
    `${provider}에 초안으로 저장됩니다. 해당 서비스에서 직접 보내실 때까지 전송되지 않습니다.`,
  driveNoteHint:
    "Google Drive에 새 문서로 저장됩니다. 그곳에서 공유하지 않으시면 본인만 보실 수 있습니다.",
  estimate: (amount) => `예상 비용: ${amount}.`,
  event: "일정",
  itemCount: (name, count) => `${name}: 품목 ${count}개`,
  noEstimate: "아직 예상 비용이 없습니다.",
  noJustYou: "아니요, 본인만",
  notGiven: "입력되지 않음",
  notes: "메모",
  onlyGrantees: (names, scope) =>
    `${scope} 항목을 공유하고 계시므로, ${names}만 이 내용을 볼 수 있습니다.`,
  peopleYouAllowed: "허락하신 사람들",
  readEmail: "이메일 소리 내어 읽기",
  readMessage: "메시지 소리 내어 읽기",
  readNote: "메모 소리 내어 읽기",
  readUpdate: "새 소식 소리 내어 읽기",
  reminder: "알림",
  replySentFrom: (provider) =>
    `승인하신 뒤에만 사용하시는 ${provider}에서 같은 대화의 답장으로 보냅니다.`,
  sharedWithCircle: "믿을 수 있는 사람들과 공유",
  shoppingRecord:
    "이전에 요청하신 장보기 기록입니다. LifeLink를 통한 구매는 더 이상 제공되지 않습니다.",
  spoken: {
    appointment: (title: string, when: string, location: string | null) =>
      `일정: ${title}. ${when}${location ? `, 장소: ${location}` : ""}.`,
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, 장소: ${location}` : ""}.`,
    confirm: (summary) => `확정하실 내용: ${summary}`,
    driveNote: (title, body) =>
      `Google Drive의 메모 제목은 ${title}입니다. 내용: ${body}`,
    email: (to, subject, body) =>
      `받는 분: ${to}. 이메일 제목: ${subject}. 내용: ${body}`,
    emailAloud: (subject, body) => `제목: ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `받는 분: ${name}, 보내는 방법: ${channel}${route}. 메시지 내용: ${body}`,
    reminder: (title, when, shared) =>
      `알림: ${title}. ${when}. ${shared ? "믿을 수 있는 사람들과 공유됩니다." : "본인만 보실 수 있습니다."}`,
    reply: (to, subject, body) =>
      `답장 받는 분: ${to}. 제목: ${subject}. 내용: ${body}`,
    update: (text) => `새 소식의 내용: ${text}`,
  },
  starts: "시작",
  subject: "제목",
  thisScope: "이 항목",
  to: "받는 분",
  toAddress: (address) => `, 받는 주소: ${address}`,
  toName: (name) => `받는 분: ${name}`,
  when: "일시",
  where: "장소",
  withPhotos: (count) => `사진 ${count}장이 포함됩니다.`,
  yesShared: "예",
};

export { actionDetails };
