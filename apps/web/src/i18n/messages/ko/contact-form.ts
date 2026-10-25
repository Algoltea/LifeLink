import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "이 사람 추가",
  addWay: "다른 연락 방법 추가",
  added: (name) => `${name} 연락처가 추가되었습니다.`,
  anotherWay: "다른 방법",
  askingForHelp: "도움 요청",
  chooseDifferentPicture: "다른 사진 선택",
  choosePicture: "사진 선택",
  detailsNotSaved: (error) =>
    `연락처 정보를 저장하지 못했습니다. ${error} 입력하신 내용은 그대로 있습니다. 저장을 다시 눌러 주세요.`,
  howToReach: "연락 방법",
  language: "LifeLink가 이 사람에게 사용할 언어",
  languageHelp:
    "첫 iMessage의 소개 문구처럼 LifeLink가 직접 작성하는 안내에는 이 언어를 사용합니다. 본인이 보내시는 메시지는 언제나 승인하신 그대로 전송됩니다.",
  languageSameAsMine: (language) => `내 언어와 같음 (${language})`,
  name: "이름",
  notSetYet: "아직 설정되지 않음",
  picture: "사진",
  pictureFailed: (error) => `${error} 다시 시도하시려면 사진을 선택해 주세요.`,
  pictureHelp:
    "선택 사항입니다. 이 기기에서 사진을 작은 정사각형으로 만들고, 저장하기 전에 위치와 카메라 정보를 제거합니다.",
  pictureNotSaved: (error) =>
    `연락처 정보는 저장했지만 사진은 저장하지 못했습니다. ${error} 선택하신 내용은 그대로 있습니다. 저장을 다시 누르시거나 다른 사진을 선택해 주세요.`,
  pictureUnusable: "이 사진을 사용할 수 없습니다. 다른 사진으로 시도해 주세요.",
  preferredWay: "선호하는 연락 방법",
  relationship: "나와의 관계",
  relationshipPlaceholder: "아들, 이웃, 친구",
  removePicture: "사진 삭제",
  saveChanges: "변경 사항 저장",
  saved: "저장되었습니다.",
  savingPersonAndPicture: "연락처와 사진을 저장하는 중…",
  trusted:
    "내가 믿을 수 있는 사람입니다. LifeLink가 이 사람에게 도움을 요청하도록 제안할 수 있습니다.",
  ways: {
    discord: {
      help: "Discord 사용자 ID는 긴 숫자입니다. Discord의 설정, 고급, 개발자 모드 순서로 선택한 뒤 사용자 ID 복사를 선택하세요.",
      label: "Discord",
      valueLabel: "Discord 사용자 ID",
    },
    email: {
      help: "상대방의 이메일 주소입니다.",
      label: "이메일 (Gmail, Outlook 등)",
      valueLabel: "이메일 주소",
    },
    imessageEmail: {
      help: "상대방이 iMessage에서 사용하는 Apple ID 이메일입니다. 전화번호와는 서로 다른 사용자 주소입니다. 나중에 실제 iMessage를 보내시려면 이 사람을 저장한 뒤 수정, iMessage 연결 순서로 선택해 주세요.",
      label: "iMessage (Apple ID 이메일)",
      valueLabel: "Apple ID 이메일",
    },
    imessagePhone: {
      help: "상대방의 iPhone 전화번호입니다. 나중에 실제 iMessage를 보내시려면 이 사람을 저장한 뒤 수정, iMessage 연결 순서로 선택해 주세요.",
      label: "iMessage (전화번호)",
      valueLabel: "전화번호",
    },
    telegram: {
      help: "@sam_alvarez와 같은 상대방의 Telegram 사용자 이름입니다 (Telegram의 설정, 사용자 이름에서 확인). 저장한 뒤 상대방에게 Telegram에서 @LifeLinkMessage_Bot을 열고 시작을 눌러 달라고 요청해 주세요. 사용자 이름이 없다면 비워 두시고 아래 Telegram 링크를 이용해 주세요.",
      label: "Telegram",
      valueLabel: "Telegram 사용자 이름",
    },
    whatsapp: {
      help: "참고하실 수 있도록 저장만 합니다. LifeLink는 아직 WhatsApp 메시지를 보낼 수 없습니다.",
      label: "WhatsApp (저장만 가능)",
      valueLabel: "WhatsApp 번호",
    },
  },
  whoTheyAre: "상대방 정보",
};

export { contactForm };
