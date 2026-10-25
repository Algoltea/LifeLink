import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "사람 추가",
  contactFallback: "연락처",
  edit: "수정",
  editPerson: (name) => `${name} 정보 수정`,
  empty:
    "믿을 수 있는 사람을 추가해 보세요. 메시지를 보내고, LifeLink에서 그 사람이 볼 수 있는 내용을 정하실 수 있습니다. 사람을 추가하는 것만으로는 아무것도 공유되지 않습니다.",
  keep: "유지",
  loadingPeople: "사람들을 불러오는 중",
  message: "메시지",
  people: "사람들",
  peopleCount: (count) => `${count}명`,
  permissions: "권한",
  permissionsFor: (name) => `: ${name}`,
  practiceContact: "연습용 연락처",
  reachNone: "아직 연락 방법이 없습니다",
  reachTelegramWaiting: "Telegram: 상대방이 시작을 누르기를 기다리는 중",
  reachWhatsappSaved:
    "WhatsApp 정보가 저장되었습니다. 아직 메시지를 보낼 수 없습니다",
  reachedBy: {
    discord: "Discord로 연락",
    email: "이메일로 연락",
    imessage: "iMessage로 연락",
    in_app: "LifeLink에서 연락",
    telegram: "Telegram으로 연락",
  },
  removeConfirm: (firstName) => `${firstName} 삭제`,
  removeDescription: (name) =>
    `${name} 연락처가 삭제되고, 이 사람과의 모든 공유가 즉시 중단됩니다.`,
  removeFailed: (error) =>
    `연락처를 삭제하지 못했습니다. ${error} 삭제를 다시 눌러 주세요.`,
  removeFallback: "삭제",
  removeNamed: (firstName) => `${firstName} 삭제…`,
  removePerson: "이 사람 삭제…",
  removeStopsSharing: (firstName) =>
    `${firstName} 연락처를 삭제하시면 이 사람과의 모든 공유도 중단됩니다.`,
  removeTitle: (name) => `${name} 연락처를 삭제하시겠어요?`,
  removed: (name) => `${name} 연락처가 삭제되었습니다.`,
  removing: "삭제 중…",
  subline:
    "믿을 수 있는 사람들과 연락 방법, 각 사람이 볼 수 있는 내용을 확인하세요.",
  title: "믿을 수 있는 사람들",
  trusted: "믿을 수 있는 사람",
};

export { circle };
