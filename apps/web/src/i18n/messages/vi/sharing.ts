import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `Được xem: ${labels}`,
  changePermissions: "Đổi quyền truy cập",
  chooseAtLeastOne: "Chọn ít nhất một nội dung chia sẻ để tạo mã.",
  chooseWhatToShare: "Chọn nội dung chia sẻ",
  codeAriaLabel: (spelled) => `Mã mời ${spelled}`,
  codeCopied: "Đã sao chép mã.",
  codeCopyFailed:
    "Không sao chép được mã. Thử Sao chép mã lần nữa hoặc viết lại mã ở trên.",
  codeSpoken: (spelled) => `Mã là ${spelled}`,
  codeSpokenDash: ", dấu gạch ngang, ",
  copyCode: "Sao chép mã",
  createCode: "Tạo mã mời",
  expiry: {
    none: "Không có ngày kết thúc",
    seven: "7 ngày",
    thirty: "30 ngày",
  },
  forHowLong: "Trong bao lâu",
  giveCode: (firstName) =>
    `Đưa mã này cho ${firstName}. Họ tạo tài khoản LifeLink, chọn “Một người thân đã mời tôi” rồi nhập mã. Mã dùng một lần trong 14 ngày. Sao chép ngay; mã chỉ hiển thị một lần ở đây.`,
  invitationWaiting: "Lời mời đang chờ chấp nhận",
  inviteFailed: (error) =>
    `Không tạo được lời mời. ${error} Lựa chọn vẫn còn ở đây. Thử tạo mã lại.`,
  keepSharing: "Tiếp tục chia sẻ",
  loadingPermissions: "Đang tải quyền truy cập",
  loadingPermissionsShort: "Đang tải quyền truy cập…",
  makingCode: "Đang tạo mã…",
  noInformationSelected: "Chưa chọn thông tin nào để chia sẻ.",
  noInformationShared: "Chưa chia sẻ thông tin",
  notSharing: (firstName) =>
    `Quý vị chưa chia sẻ thông tin nào với ${firstName}.`,
  permissionsFor: (name) => `Quyền truy cập của ${name}`,
  readCode: "Đọc mã thành tiếng",
  savePermissions: "Lưu quyền truy cập",
  scopes: {
    "appointments.view": {
      description: "Lịch hẹn sắp tới, gồm giờ và địa điểm.",
      label: "Lịch hẹn",
    },
    "groceries.view": {
      description: "Danh sách thực phẩm đã lưu và ngân sách.",
      label: "Danh sách thực phẩm",
    },
    "photos.view": {
      description: "Ảnh quý vị đã chia sẻ trong trò chuyện gia đình.",
      label: "Ảnh đã chia sẻ",
    },
    "reminders.view": {
      description: "Lời nhắc quý vị đã lưu và chọn chia sẻ.",
      label: "Lời nhắc",
    },
    "rides.view": {
      description:
        "Tiến độ chuyến đi hoặc việc nhờ làm: đã hỏi, trả lời, xác nhận.",
      label: "Sắp xếp đưa đón",
    },
    "scam_alerts.view": {
      description: "Thông báo khi quý vị kiểm tra tin nhắn có vẻ lừa đảo.",
      label: "Cảnh báo lừa đảo",
    },
  },
  sharedInformation: "Thông tin chia sẻ",
  startSharing:
    "Để bắt đầu chia sẻ, chọn nội dung họ được xem và đưa mã mời. Họ nhập mã trong tài khoản LifeLink của mình.",
  state: {
    active: "Được xem thông tin chia sẻ",
    expired: "Chia sẻ đã kết thúc",
    invited: "Lời mời chưa được dùng",
    revoked: "Đã dừng chia sẻ",
  },
  stopDescription: (name) =>
    `${name} sẽ lập tức không còn xem được nội dung quý vị chia sẻ. Quý vị có thể mời lại sau.`,
  stopFailed: (error) =>
    `Không dừng chia sẻ được. ${error} Thử Dừng chia sẻ lần nữa.`,
  stopSharing: "Dừng chia sẻ",
  stopSharingWith: (name) => `Dừng chia sẻ với ${name}`,
  stopTitle: (name) => `Dừng chia sẻ với ${name}?`,
  stopped: (name) => `Đã dừng chia sẻ với ${name}.`,
  stopping: "Đang dừng chia sẻ…",
  them: "họ",
  until: (day) => `Đến ${day}`,
  updateFailed: (error) =>
    `Không cập nhật được chia sẻ. ${error} Lựa chọn vẫn còn ở đây. Chọn Lưu quyền truy cập để thử lại.`,
  updated: "Đã cập nhật chia sẻ. Có hiệu lực ngay.",
  viewOnly:
    "Chọn thông tin chia sẻ trong LifeLink. Họ chỉ có thể xem; không thể gửi tin nhắn, phê duyệt hành động hoặc chi tiêu thay quý vị.",
  whatNameCanSee: (firstName) => `Nội dung ${firstName} được xem`,
  whatTheyCanSee: "Nội dung họ được xem",
};

export { sharing };
