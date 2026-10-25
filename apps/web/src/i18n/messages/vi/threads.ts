import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "Thêm người",
  addPhoto: "Thêm ảnh",
  addWayToReach: (firstName) =>
    `Thêm cách liên lạc với ${firstName} trong Nhóm tin cậy.`,
  addingPhoto: "Đang thêm ảnh…",
  backTo: "Quay lại ",
  channels: {
    discord: "Tin nhắn trực tiếp Discord",
    email: "Email",
    imessage: "iMessage",
    in_app: "Tin nhắn LifeLink",
    telegram: "Telegram",
  },
  chooseConversation: "Chọn một người để đọc cuộc trò chuyện và viết trả lời.",
  conversationWith: (name) => `Cuộc trò chuyện với ${name}`,
  conversationWithPrefix: "Cuộc trò chuyện với ",
  conversations: "Cuộc trò chuyện",
  dividerAt: (day, time) => `${day} lúc ${time}`,
  empty: "Thêm người thân hoặc bạn bè vào nhóm tin cậy để bắt đầu viết cho họ.",
  emptyThread: (firstName) => `Chưa có tin nhắn với ${firstName}`,
  emptyThreadHint: (firstName) =>
    `Viết bên dưới để bắt đầu. Quý vị sẽ thấy chính xác nội dung ${firstName} nhận trước khi gửi bất kỳ thứ gì.`,
  helpMeUnderstand: "Giúp tôi hiểu",
  loadingConversation: "Đang tải cuộc trò chuyện",
  loadingConversations: "Đang tải các cuộc trò chuyện",
  maxPhotos: (count) =>
    `Quý vị có thể đính kèm tối đa ${count} ảnh. Xóa một ảnh để thêm ảnh khác.`,
  messageTo: (firstName) => `Tin nhắn gửi ${firstName}`,
  messagesWith: (name) => `Tin nhắn với ${name}`,
  noWayToReach: "Chưa có cách liên lạc",
  noWayToReachName: (firstName) => `Chưa có cách liên lạc với ${firstName}`,
  notSent: "Chưa gửi",
  notSureSent: "Chưa chắc đã gửi",
  nothingSentUntilApproved:
    "Chưa gửi gì cho đến khi quý vị xem lại và phê duyệt.",
  pendingMany: (count, firstName) =>
    `${count} tin nhắn gửi ${firstName} đang chờ quý vị phê duyệt.`,
  pendingOne: (firstName) =>
    `Một tin nhắn gửi ${firstName} đang chờ quý vị phê duyệt.`,
  peopleCount: (count) => `${count} người`,
  photoCount: (count) => `${count} ảnh`,
  photoInvalid: (name) =>
    `${name}: Vui lòng chọn ảnh (JPEG, PNG, WebP hoặc HEIC).`,
  photosToSend: "Ảnh sẽ gửi",
  practiceNothingSent: (firstName) =>
    `Thực hành: không gửi gì đến ${firstName}.`,
  preparing: "Đang chuẩn bị…",
  preparingMessage: "Đang chuẩn bị tin nhắn",
  previewManyPhotos: (count) => `${count} ảnh`,
  previewOnePhoto: "Một ảnh",
  previewYou: (words) => `Quý vị: ${words}`,
  recap: "Tóm tắt",
  recapThis: " cuộc trò chuyện này",
  removePhoto: (name) => `Xóa ${name}`,
  replyAdded:
    "Đã thêm câu trả lời vào tin nhắn. Quý vị có thể sửa trước khi xem lại.",
  review: "Xem lại",
  reviewAndSend: "Xem lại và gửi",
  reviewIt: "Xem lại",
  seeWhatHappened: "Xem điều đã xảy ra",
  srThem: (firstName, when) => `${firstName}, ${when}: `,
  srYou: (when) => `Quý vị, ${when}: `,
  startConversation: "Bắt đầu trò chuyện",
  status: {
    delivered: "Đã giao",
    draft: "Bản nháp, chưa gửi",
    failed: "Chưa gửi",
    read: "Đã đọc",
    received: "Đã nhận",
    sending: "Đang gửi…",
    sent: "Đã gửi",
    unknown: "Chưa chắc đã gửi",
  },
  subline:
    "Viết cho những người trong nhóm tin cậy. Quý vị được xem từng tin nhắn trước khi gửi.",
  title: "Tin nhắn",
  toAddress: (address) => ` đến ${address}`,
  waitingForApproval: (count) =>
    count === 1
      ? "Đang chờ quý vị phê duyệt"
      : `${count} đang chờ quý vị phê duyệt`,
  writeTo: (firstName) => `Viết cho ${firstName}`,
  writeToPlaceholder: (firstName) => `Viết cho ${firstName}…`,
};

export { threads };
