import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "사람 추가",
  addPhoto: "사진 추가",
  addWayToReach: (firstName) =>
    `믿을 수 있는 사람들에서 ${firstName}에게 연락할 방법을 추가해 주세요.`,
  addingPhoto: "사진을 추가하는 중…",
  backTo: "돌아갈 곳: ",
  channels: {
    discord: "Discord 개인 메시지",
    email: "이메일",
    imessage: "iMessage",
    in_app: "LifeLink 메시지",
    telegram: "Telegram",
  },
  chooseConversation:
    "상대방을 선택하시면 대화를 읽고 답장을 쓰실 수 있습니다.",
  conversationWith: (name) => `${name} 님과의 대화`,
  conversationWithPrefix: "대화 상대: ",
  conversations: "대화",
  dividerAt: (day, time) => `${day} ${time}`,
  empty: "가족이나 친구를 믿을 수 있는 사람들에 추가하고 메시지를 보내 보세요.",
  emptyThread: (firstName) =>
    `아직 ${firstName} 님과 주고받은 메시지가 없습니다`,
  emptyThreadHint: (firstName) =>
    `아래에 글을 써서 시작하세요. 보내기 전에 ${firstName}에게 전달될 내용을 정확히 확인하실 수 있습니다.`,
  helpMeUnderstand: "내용 이해하기",
  loadingConversation: "대화를 불러오는 중",
  loadingConversations: "대화를 불러오는 중",
  maxPhotos: (count) =>
    `사진은 최대 ${count}장까지 첨부하실 수 있습니다. 다른 사진을 추가하시려면 한 장을 삭제해 주세요.`,
  messageTo: (firstName) => `${firstName}에게 보내는 메시지`,
  messagesWith: (name) => `${name} 님과의 메시지`,
  noWayToReach: "아직 연락 방법이 없습니다",
  noWayToReachName: (firstName) =>
    `아직 ${firstName}에게 연락할 방법이 없습니다`,
  notSent: "보내지 않음",
  notSureSent: "보냈는지 확인되지 않음",
  nothingSentUntilApproved:
    "검토하고 승인하실 때까지 아무것도 보내지 않습니다.",
  pendingMany: (count, firstName) =>
    `${firstName}에게 보낼 메시지 ${count}개가 승인을 기다리고 있습니다.`,
  pendingOne: (firstName) =>
    `${firstName}에게 보낼 메시지가 승인을 기다리고 있습니다.`,
  peopleCount: (count) => `${count}명`,
  photoCount: (count) => `사진 ${count}장`,
  photoInvalid: (name) =>
    `${name}: 사진을 선택해 주세요 (JPEG, PNG, WebP 또는 HEIC).`,
  photosToSend: "보낼 사진",
  practiceNothingSent: (firstName) =>
    `연습: ${firstName}에게 아무것도 보내지 않습니다.`,
  preparing: "준비 중…",
  preparingMessage: "메시지를 준비하는 중",
  previewManyPhotos: (count) => `사진 ${count}장`,
  previewOnePhoto: "사진 한 장",
  previewYou: (words) => `나: ${words}`,
  recap: "정리",
  recapThis: " — 이 대화",
  removePhoto: (name) => `${name} 삭제`,
  replyAdded: "답장을 메시지에 추가했습니다. 검토 전에 수정하실 수 있습니다.",
  reviewAndSend: "검토하고 보내기",
  reviewIt: "검토하기",
  seeWhatHappened: "결과 보기",
  srThem: (firstName, when) => `${firstName}, ${when}: `,
  srYou: (when) => `나, ${when}: `,
  startConversation: "대화 시작",
  status: {
    delivered: "전달됨",
    draft: "초안, 보내지 않음",
    failed: "보내지 않음",
    read: "읽음",
    received: "받음",
    sending: "보내는 중…",
    sent: "보냄",
    unknown: "보냈는지 확인되지 않음",
  },
  subline:
    "믿을 수 있는 사람들에게 글을 보내세요. 모든 메시지는 보내기 전에 확인하실 수 있습니다.",
  title: "메시지",
  toAddress: (address) => `, 받는 주소: ${address}`,
  waitingForApproval: (count) =>
    count === 1
      ? "승인을 기다리고 있습니다"
      : `${count}건이 승인을 기다리고 있습니다`,
  writeTo: (firstName) => `${firstName}에게 글쓰기`,
  writeToPlaceholder: (firstName) => `${firstName}에게 글을 써 주세요…`,
};

export { threads };
