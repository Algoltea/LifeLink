import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "동의하고 연락처 연결",
  assignedNumber: "배정된 iMessage 번호: ",
  checkComplete: "확인했습니다. 현재 상태는 위에 표시되어 있습니다.",
  checkFailed: "첫 메시지를 확인하지 못했습니다. 다시 시도해 주세요.",
  checkFirstMessage: "첫 메시지 확인",
  checking: "첫 메시지를 확인하는 중…",
  confirmDescription:
    "계속하시기 전에 정확한 주소와 사용 방법을 확인해 주세요.",
  confirmInvitation: (contactName, handle) =>
    `초대 메시지는 보내지 않습니다. ${contactName}에게 직접 알려주실 배정 번호가 표시됩니다. 상대방이 먼저 ${handle} 주소에서 그 번호로 메시지를 보내야 합니다. 같은 전화기에서도 전화번호와 Apple ID 이메일은 서로 다른 사용자 주소입니다.`,
  confirmLink: "기존 Photon 연락처 연결 — 주소: ",
  confirmLookup:
    "계속하시면 iMessage 제공업체인 Photon에서 이 정확한 주소를 찾아 기존 연락처를 사용합니다. LifeLink는 새 사람을 등록하거나 추가 이용 인원을 사용하지 않습니다.",
  confirmNoAccount: (contactName) =>
    `${contactName}에게는 LifeLink 계정이나 대시보드 초대가 필요하지 않습니다. 이 연결로 내 계정의 어떠한 내용에도 접근 권한이 부여되지 않습니다.`,
  confirmTitle: (contactName) => `${contactName}의 iMessage를 연결하시겠어요?`,
  confirmTo: " 연결 대상: ",
  copied: (contactName) =>
    `안내를 복사했습니다. ${contactName}에게 직접 보내 주세요.`,
  copy: "안내 복사",
  copyFailed:
    "안내를 복사하지 못했습니다. 위 글을 선택해 복사하시거나 안내 복사를 다시 눌러 주세요.",
  exactAddress: "정확한 연락처 주소: ",
  firstMessageConfirmed:
    "상대방의 첫 메시지가 확인되었습니다. 이제 LifeLink에서 이 등록 주소로 메시지를 보낼 수 있습니다.",
  heading: "iMessage 설정",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName}: LifeLink에서 iMessage를 사용하시려면 먼저 정확히 등록된 주소인 ${handle}에서 ${assignedNumber} 번호로 iMessage (예: “안녕하세요”)를 보내 주세요. 메시지 앱에서 대화를 시작하는 주소가 ${handle}인지 확인해 주세요. 같은 전화기에서도 전화번호와 Apple ID 이메일은 서로 다른 사용자 주소입니다. 다른 주소에서 보낸 메시지로는 이 주소가 활성화되지 않습니다. LifeLink 계정이나 대시보드 초대는 필요하지 않습니다.`,
  link: "iMessage 연결",
  linkExplanation:
    "Photon에 이 정확한 주소로 이미 등록된 사람을 연결합니다. 아직 등록되어 있지 않으면 먼저 Photon 대시보드에 추가한 뒤 다시 시도해 주세요. LifeLink는 새 사람을 등록하지 않습니다.",
  linkFailed:
    "연락처를 연결하지 못했습니다. Photon 대시보드에 이 주소가 정확히 등록되어 있는지 확인한 뒤 다시 시도해 주세요.",
  loading: "iMessage 설정을 불러오는 중…",
  lookingUp: "Photon에서 기존 연락처를 찾는 중…",
  mustSendFirst: (contactName) =>
    `${contactName} 본인이 위에 표시된 자신의 주소에서 첫 메시지를 보내야 합니다. 내가 대신 메시지를 보내도 상대방의 설정이 활성화되지 않습니다.`,
  needsAddress:
    "iMessage 주소가 필요합니다. 위에 상대방의 전화번호 또는 Apple ID 이메일을 입력한 뒤 저장해 주세요.",
  notConfigured:
    "앱 설정이 필요합니다. 이 연락처에 iMessage를 설정하려면 LifeLink 운영자가 먼저 Photon을 연결해야 합니다.",
  ownerOnly:
    "계정 소유자만 자신의 연락처에 iMessage를 설정하거나 확인할 수 있습니다.",
  practice: (contactName) =>
    `연습 메시지는 LifeLink 안에만 있으므로 여기서 설정하실 것은 없습니다. 실제 iMessage로 전환하시면 여기서 ${contactName} 연락처를 연결하실 수 있습니다.`,
  retryLink: "iMessage 연결 다시 시도",
  row: {
    failed: "iMessage 확인 필요",
    not_registered: "iMessage 아직 연결되지 않음",
    registering: "iMessage 연결 중",
    waiting: "상대방의 첫 iMessage를 기다리는 중",
  },
  status: {
    failed: "설정 확인 필요",
    not_registered: "연결되지 않음",
    ready: "iMessage 사용 준비 완료",
    registering: "연결 중",
    waiting: "상대방의 첫 메시지를 기다리는 중",
  },
};

export { imessageSetup };
