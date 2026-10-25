import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "Thêm người",
  contactFallback: "Người liên hệ",
  edit: "Chỉnh sửa",
  editPerson: (name) => `Chỉnh sửa ${name}`,
  empty:
    "Thêm người quý vị tin tưởng. Quý vị có thể nhắn tin và chọn những gì họ được xem trong LifeLink. Việc thêm một người không tự chia sẻ nội dung nào.",
  keep: "Giữ lại",
  loadingPeople: "Đang tải danh sách người",
  message: "Nhắn tin",
  people: "Mọi người",
  peopleCount: (count) => `${count} người`,
  permissions: "Quyền truy cập",
  permissionsFor: (name) => ` cho ${name}`,
  practiceContact: "Người liên hệ thực hành",
  reachNone: "Chưa có cách liên lạc",
  reachTelegramWaiting: "Telegram: đang chờ họ nhấn Bắt đầu",
  reachWhatsappSaved: "Đã lưu WhatsApp. Chưa thể nhắn tin",
  reachedBy: {
    discord: "Liên lạc qua Discord",
    email: "Liên lạc qua email",
    imessage: "Liên lạc qua iMessage",
    in_app: "Liên lạc trong LifeLink",
    telegram: "Liên lạc qua Telegram",
  },
  removeConfirm: (firstName) => `Xóa ${firstName}`,
  removeDescription: (name) =>
    `${name} sẽ bị xóa và mọi nội dung quý vị chia sẻ với họ sẽ dừng ngay.`,
  removeFailed: (error) =>
    `Không xóa được người này. ${error} Vui lòng chọn Xóa lần nữa.`,
  removeFallback: "Xóa",
  removeNamed: (firstName) => `Xóa ${firstName}…`,
  removePerson: "Xóa người này…",
  removeStopsSharing: (firstName) =>
    `Xóa ${firstName} cũng sẽ dừng mọi nội dung quý vị chia sẻ với họ.`,
  removeTitle: (name) => `Xóa ${name}?`,
  removed: (name) => `Đã xóa ${name}.`,
  removing: "Đang xóa…",
  subline:
    "Những người quý vị tin tưởng, cách liên lạc và chính xác những gì mỗi người được xem.",
  title: "Nhóm tin cậy",
  trusted: "Tin cậy",
};

export { circle };
