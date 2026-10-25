import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "Có điều gì muốn thêm? (không bắt buộc)",
  addNotePlaceholder: "Ví dụ: họ tự nhận là ai",
  ask: "Hỏi người quý vị tin tưởng",
  callCheckTitle: "Kiểm tra cuộc gọi lừa đảo",
  checkSomethingElse: "Kiểm tra nội dung khác",
  checking: "Đang kiểm tra",
  checkingMessage: "Đang kiểm tra tin nhắn…",
  chooseEmail: "Chọn email",
  chooseRecent: "Chọn từ email gần đây",
  cloudNote:
    "Dịch vụ AI đọc nội dung này để kiểm tra. Không đưa vào mật khẩu và số thẻ.",
  didNotFinish: "Chưa hoàn tất",
  earlier: "Các lần kiểm tra trước",
  earlierEmpty:
    "Các lần kiểm tra tin nhắn, ảnh và cuộc gọi sẽ xuất hiện ở đây.",
  emailMissing:
    "Email này không có trong hộp thư gần đây. Chọn email khác hoặc nhập nội dung bên dưới.",
  from: (sender) => `Từ ${sender}`,
  guidance: {
    ai: "Dịch vụ AI hỗ trợ kiểm tra tin nhắn và ảnh. Ảnh được lưu cùng lần kiểm tra cho đến khi quý vị xóa. Kiểm tra thực hành không bao giờ dùng AI.",
    intro:
      "Kiểm tra tìm các dấu hiệu cảnh báo thường gặp. Không thể xác nhận ai gửi tin nhắn hoặc nội dung có thật hay không.",
    next: "Đọc kết quả, làm theo “Việc nên làm bây giờ” hoặc hỏi người tin tưởng để có thêm ý kiến. Quý vị quyết định bước tiếp theo.",
    title: "Kiểm tra lừa đảo cho tôi biết điều gì?",
  },
  howToShow: "Quý vị muốn cung cấp tin nhắn bằng cách nào?",
  loadingEarlier: "Đang tải các lần kiểm tra trước",
  loadingEmail: "Đang tải email này",
  loadingEmails: "Đang tải email của quý vị",
  localNote:
    "Hiện không thể kiểm tra bằng AI. LifeLink dùng các dấu hiệu cảnh báo thường gặp.",
  messageWords: "Nội dung tin nhắn",
  messageWordsPlaceholder: "Dán hoặc nhập nội dung tại đây",
  noLongerAvailable:
    "Lần kiểm tra này không còn khả dụng. Quý vị có thể bắt đầu lần mới.",
  noRecentEmails: "Không có email gần đây để chọn. ",
  noRecentEmailsRest: ", hoặc nhập nội dung tin nhắn.",
  noSubject: "(Không có chủ đề)",
  openEmail: "Mở Email",
  opening: "Đang mở lần kiểm tra",
  photo: {
    availabilityChecking: "Đang kiểm tra tính khả dụng của kiểm tra ảnh…",
    practice:
      "Chế độ thực hành đang bật. Ảnh không được kiểm tra hoặc gửi đến dịch vụ AI.",
    unavailable:
      "Hiện không thể kiểm tra ảnh. Ảnh của quý vị sẽ không được tải lên.",
    unavailableType: "Không thể kiểm tra ảnh. Hãy nhập nội dung.",
  },
  practiceEmailNote:
    "Đây là email thực hành. Email được kiểm tra trên thiết bị này, không dùng AI trên đám mây.",
  practiceNote:
    "Kiểm tra thực hành dùng các dấu hiệu cảnh báo thường gặp. Không gửi gì đến dịch vụ AI.",
  practiceSuffix: " · Thực hành",
  preparing: "Đang chuẩn bị kiểm tra…",
  review: "Xem lại",
  sources: {
    email: "Email",
    screenshot: "Ảnh",
    text: "Văn bản",
  },
  startNew: "Bắt đầu kiểm tra mới",
  subline:
    "Chưa chắc về tin nhắn hoặc cuộc gọi? LifeLink tìm dấu hiệu cảnh báo trước khi quý vị hành động.",
  submit: {
    email: "Kiểm tra email này",
    screenshot: "Kiểm tra ảnh này",
    text: "Kiểm tra tin nhắn này",
  },
  title: "Kiểm tra lừa đảo",
  uploading: "Đang tải ảnh lên…",
  uploadingNote:
    "Đang tải ảnh lên. Hãy để trang này mở; bước tiếp theo là đọc nội dung.",
};

export { scam };
