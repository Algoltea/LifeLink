import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "믿을 수 있는 사람 추가",
  call: "전화",
  callAria: (name) => `${name}에게 전화`,
  callHelpMessage:
    "받은 전화가 진짜인지 확신이 서지 않아요. 정보를 알려주거나 돈을 보내기 전에 확인하는 것을 도와주시겠어요?",
  callsLoading: "계정 설정을 불러올 때까지 전화를 사용할 수 없습니다.",
  callsPractice: "연습 모드에서는 전화를 사용할 수 없습니다.",
  contactFallback: "연락처",
  empty: "다른 사람의 의견이 도움이 될 수 있습니다. ",
  emptyRest:
    "에 아는 사람을 추가하고 함께 확인해 달라고 요청해 보세요. 모든 메시지는 보내기 전에 검토하실 수 있습니다.",
  failed: (name, error) =>
    `${name}에게 보낼 메시지를 준비하지 못했습니다. ${error} 보낸 내용은 없습니다. 메시지 준비를 다시 눌러 주세요.`,
  introCall:
    "통화 확인을 도와달라는 메시지를 준비합니다. 승인하시기 전에 읽고 수정하실 수 있습니다. 아직 보내지 않습니다.",
  introCheck:
    "함께 확인해 달라는 메시지를 준비합니다. 승인하시기 전에 읽고 수정하실 수 있습니다. 아직 보내지 않습니다.",
  list: "믿을 수 있는 사람들",
  loading: "믿을 수 있는 사람들을 불러오는 중",
  noMessageAddress: "저장된 메시지 주소가 없습니다",
  noPhone: "저장된 전화번호가 없습니다. ",
  noWayToMessage: "저장된 메시지 연락 방법이 없습니다. ",
  prepare: "메시지 준비",
  prepareAria: (name) => `${name}에게 보낼 메시지 준비`,
  preparing: "준비 중…",
  reachedBy: {
    discord: "메시지로 연락",
    email: "이메일로 연락",
    imessage: "메시지로 연락",
    in_app: "LifeLink에서 연락",
    telegram: "메시지로 연락",
  },
  saveDetails: "연락처 정보를 저장할 곳: ",
  trustedCircle: "믿을 수 있는 사람들",
  unavailable: "지금은 전화와 메시지 준비 기능을 사용할 수 없습니다.",
};

export { trustedPeople };
