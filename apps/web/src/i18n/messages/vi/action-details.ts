import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " và ",
  appointment: "Cuộc hẹn",
  budget: (amount) => ` Ngân sách: ${amount}.`,
  by: (channel) => `Qua ${channel}`,
  calendar: "Lịch",
  confirming: "Quý vị đang xác nhận",
  document: "Tài liệu",
  draftSavedIn: (provider) =>
    `Được lưu thành bản nháp trong ${provider} của quý vị. Chưa được gửi cho đến khi quý vị gửi tại đó.`,
  driveNoteHint:
    "Được lưu thành tài liệu mới trong Google Drive của quý vị. Chỉ quý vị được xem trừ khi chia sẻ tại đó.",
  estimate: (amount) => `Ước tính của quý vị: ${amount}.`,
  event: "Sự kiện",
  itemCount: (name, count) => `${name}: ${count} món`,
  noEstimate: "Chưa có ước tính.",
  noJustYou: "Không, chỉ quý vị",
  notGiven: "Chưa cung cấp",
  notes: "Ghi chú",
  onlyGrantees: (names, scope) =>
    `Chỉ ${names} được xem nội dung này, vì quý vị chia sẻ ${scope} với họ.`,
  peopleYouAllowed: "những người quý vị cho phép",
  readEmail: "Đọc email thành tiếng",
  readMessage: "Đọc tin nhắn thành tiếng",
  readNote: "Đọc ghi chú thành tiếng",
  readUpdate: "Đọc cập nhật thành tiếng",
  reminder: "Lời nhắc",
  replySentFrom: (provider) =>
    `Chỉ sau khi quý vị phê duyệt, câu trả lời mới được gửi từ ${provider} của quý vị trong cùng cuộc trò chuyện.`,
  sharedWithCircle: "Chia sẻ với nhóm tin cậy",
  shoppingRecord:
    "Đây là bản ghi yêu cầu mua sắm trước đây. Hiện không còn có thể mua sắm qua LifeLink.",
  spoken: {
    appointment: (title: string, when: string, location: string | null) =>
      `Cuộc hẹn: ${title}. ${when}${location ? `, tại ${location}` : ""}.`,
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, tại ${location}` : ""}.`,
    confirm: (summary) => `Quý vị đang xác nhận: ${summary}`,
    driveNote: (title, body) =>
      `Ghi chú trong Google Drive của quý vị có tên ${title}. Nội dung: ${body}`,
    email: (to, subject, body) =>
      `Email gửi đến ${to}. Chủ đề: ${subject}. Nội dung: ${body}`,
    emailAloud: (subject, body) => `Chủ đề: ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `Gửi đến ${name}, qua ${channel}${route}. Nội dung tin nhắn: ${body}`,
    reminder: (title, when, shared) =>
      `Lời nhắc: ${title}. ${when}. ${shared ? "Chia sẻ với nhóm tin cậy." : "Chỉ dành cho quý vị."}`,
    reply: (to, subject, body) =>
      `Trả lời ${to}. Chủ đề: ${subject}. Nội dung: ${body}`,
    update: (text) => `Nội dung cập nhật: ${text}`,
  },
  starts: "Bắt đầu",
  subject: "Chủ đề",
  thisScope: "nội dung này",
  to: "Gửi đến",
  toAddress: (address) => ` đến ${address}`,
  toName: (name) => `Gửi đến ${name}`,
  when: "Thời gian",
  where: "Địa điểm",
  withPhotos: (count) => `Kèm ${count} ảnh.`,
  yesShared: "Có",
};

export { actionDetails };
