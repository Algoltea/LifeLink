import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "Thêm người tin cậy",
  call: "Cuộc gọi",
  callAria: (name) => `Gọi ${name}`,
  callHelpMessage:
    "Tôi chưa chắc về cuộc gọi vừa nhận. Bạn có thể giúp tôi kiểm tra có thật không trước khi tôi chia sẻ thông tin hay gửi tiền không?",
  callsLoading: "Chưa gọi được cho đến khi tải xong cài đặt tài khoản.",
  callsPractice: "Không gọi được ở chế độ thực hành.",
  contactFallback: "Người liên hệ",
  empty: "Ý kiến thứ hai có thể hữu ích. Thêm người quen vào ",
  emptyRest: " để nhờ kiểm tra. Quý vị sẽ xem lại mọi tin nhắn trước khi gửi.",
  failed: (name, error) =>
    `Không chuẩn bị được tin nhắn cho ${name}. ${error} Chưa gửi gì. Thử Chuẩn bị tin nhắn lần nữa.`,
  introCall:
    "Chuẩn bị tin nhắn nhờ giúp kiểm tra cuộc gọi. Quý vị có thể đọc và sửa trước khi phê duyệt. Chưa gửi gì.",
  introCheck:
    "Chuẩn bị tin nhắn nhờ người giúp với lần kiểm tra này. Quý vị có thể đọc và sửa trước khi phê duyệt. Chưa gửi gì.",
  list: "Người tin cậy",
  loading: "Đang tải người tin cậy",
  noMessageAddress: "Chưa lưu địa chỉ nhắn tin",
  noPhone: "Chưa lưu số điện thoại. ",
  noWayToMessage: "Chưa lưu cách nhắn tin cho họ. ",
  prepare: "Chuẩn bị tin nhắn",
  prepareAria: (name) => `Chuẩn bị tin nhắn cho ${name}`,
  preparing: "Đang chuẩn bị…",
  reachedBy: {
    discord: "Liên lạc qua tin nhắn",
    email: "Liên lạc qua email",
    imessage: "Liên lạc qua tin nhắn",
    in_app: "Liên lạc trong LifeLink",
    telegram: "Liên lạc qua tin nhắn",
  },
  saveDetails: "Lưu thông tin liên hệ của họ trong ",
  trustedCircle: "Nhóm tin cậy",
  unavailable: "Hiện không thể Gọi và Chuẩn bị tin nhắn.",
};

export { trustedPeople };
