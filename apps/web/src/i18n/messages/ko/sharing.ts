import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `볼 수 있는 내용: ${labels}`,
  changePermissions: "권한 변경",
  chooseAtLeastOne: "코드를 만들려면 공유할 항목을 하나 이상 선택해 주세요.",
  chooseWhatToShare: "공유할 내용 선택",
  codeAriaLabel: (spelled) => `초대 코드 ${spelled}`,
  codeCopied: "코드를 복사했습니다.",
  codeCopyFailed:
    "코드를 복사하지 못했습니다. 코드 복사를 다시 누르시거나 위에 표시된 코드를 적어 두세요.",
  codeSpoken: (spelled) => `코드는 ${spelled}입니다`,
  codeSpokenDash: ", 붙임표, ",
  copyCode: "코드 복사",
  createCode: "초대 코드 만들기",
  expiry: { none: "종료일 없음", seven: "7일", thirty: "30일" },
  forHowLong: "공유 기간",
  giveCode: (firstName) =>
    `${firstName}에게 이 코드를 알려 주세요. 상대방이 LifeLink 계정을 만들고 ‘가족에게 초대받았어요’를 선택한 뒤 코드를 입력하면 됩니다. 14일 동안 한 번만 사용할 수 있습니다. 여기서 한 번만 표시되니 지금 복사해 주세요.`,
  invitationWaiting: "상대방의 초대 수락을 기다리는 중",
  inviteFailed: (error) =>
    `초대를 만들지 못했습니다. ${error} 선택하신 내용은 그대로 있습니다. 코드 만들기를 다시 시도해 주세요.`,
  keepSharing: "계속 공유",
  loadingPermissions: "권한을 불러오는 중",
  loadingPermissionsShort: "권한을 불러오는 중…",
  makingCode: "코드를 만드는 중…",
  noInformationSelected: "공유할 정보가 선택되지 않았습니다.",
  noInformationShared: "공유된 정보 없음",
  notSharing: (firstName) => `${firstName}에게 공유하는 정보가 없습니다.`,
  permissionsFor: (name) => `${name}의 권한`,
  readCode: "코드 소리 내어 읽기",
  savePermissions: "권한 저장",
  scopes: {
    "appointments.view": {
      description: "시간과 장소가 포함된 다가오는 약속입니다.",
      label: "약속",
    },
    "groceries.view": {
      description: "저장하신 장보기 목록과 예산입니다.",
      label: "장보기 목록",
    },
    "photos.view": {
      description: "가족과의 대화에서 공유하신 사진입니다.",
      label: "공유한 사진",
    },
    "reminders.view": {
      description: "저장하시고 공유하기로 정하신 알림입니다.",
      label: "알림",
    },
    "rides.view": {
      description: "차편이나 심부름의 진행 상황: 요청, 답변, 확정입니다.",
      label: "차편 계획",
    },
    "scam_alerts.view": {
      description: "사기로 의심되는 메시지를 확인하셨을 때의 안내입니다.",
      label: "사기 알림",
    },
  },
  sharedInformation: "공유 정보",
  startSharing:
    "공유를 시작하시려면 상대방이 볼 수 있는 내용을 선택하고 초대 코드를 알려 주세요. 상대방이 자신의 LifeLink 계정에서 입력하면 됩니다.",
  state: {
    active: "공유 정보 보기 가능",
    expired: "공유 기간 종료",
    invited: "아직 초대를 사용하지 않음",
    revoked: "공유 중단됨",
  },
  stopDescription: (name) =>
    `${name}에게 보이던 모든 공유 내용이 즉시 숨겨집니다. 나중에 다시 초대하실 수 있습니다.`,
  stopFailed: (error) =>
    `공유를 중단하지 못했습니다. ${error} 공유 중단을 다시 눌러 주세요.`,
  stopSharing: "공유 중단",
  stopSharingWith: (name) => `${name}에게 공유 중단`,
  stopTitle: (name) => `${name}에게 공유를 중단하시겠어요?`,
  stopped: (name) => `${name}에게 공유를 중단했습니다.`,
  stopping: "공유를 중단하는 중…",
  them: "상대방",
  until: (day) => `${day}까지`,
  updateFailed: (error) =>
    `공유 내용을 변경하지 못했습니다. ${error} 선택하신 내용은 그대로 있습니다. 다시 시도하시려면 권한 저장을 선택해 주세요.`,
  updated: "공유 내용을 변경했습니다. 즉시 적용됩니다.",
  viewOnly:
    "LifeLink에서 공유할 정보를 선택하세요. 상대방은 보기만 할 수 있으며, 나를 대신해 메시지를 보내거나, 작업을 승인하거나, 돈을 쓸 수는 없습니다.",
  whatNameCanSee: (firstName) => `${firstName}에게 공개할 내용`,
  whatTheyCanSee: "상대방이 볼 수 있는 내용",
};

export { sharing };
