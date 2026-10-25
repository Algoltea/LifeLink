import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "Về kiểm tra lừa đảo",
  appointmentAdded: "Đã thêm vào Tuần của quý vị ở trang Hôm nay.",
  appointmentFound: "Tìm thấy lịch hẹn",
  backToInbox: "Quay lại hộp thư đến",
  checkAnother: "Kiểm tra tin nhắn khác",
  checkCouldNotFinish: (error) => `Kiểm tra lừa đảo chưa hoàn tất. ${error}`,
  checkFirst: "Kiểm tra các dấu hiệu cảnh báo thường gặp trước khi hành động.",
  checkForNew: "Kiểm tra email mới",
  checkManually: " Quý vị có thể tự kiểm tra bên dưới.",
  checkThis: "Kiểm tra email này",
  checked: (when) => `Đã kiểm tra ${when}`,
  checkedAt: (when) => ` Đã kiểm tra ${when}.`,
  checking: "Đang kiểm tra…",
  checksAutomatic:
    "Khi bật kiểm tra email bằng AI trong Cài đặt, email thật mới có thể được gửi đến nhà cung cấp AI trên đám mây. Email thực hành vẫn ở trong LifeLink. Quy tắc cục bộ chỉ dành cho tiếng Anh được dùng khi AI trên đám mây tắt, không khả dụng hoặc chưa hoàn tất. Dù yêu cầu trên đám mây thất bại, email vẫn có thể đã được gửi đến nhà cung cấp. Cả hai cách đều không xác minh được người gửi hoặc chứng minh email an toàn.",
  checksIntro:
    "Email mới được kiểm tra trong LifeLink để tìm dấu hiệu lừa đảo thường gặp. Chọn tin nhắn để đọc và xem những điểm đáng chú ý.",
  checksTitle: "Cách kiểm tra email hoạt động",
  chooseEmail: "Chọn email để đọc và xem kết quả kiểm tra lừa đảo.",
  cloudCheckNotice:
    "AI trên đám mây đã hỗ trợ kiểm tra email này. AI có thể sai và không thể xác minh người gửi. Không có dấu hiệu cảnh báo không có nghĩa email an toàn.",
  cloudConsent:
    "Gửi email này đến dịch vụ AI trên đám mây để tóm tắt và tìm lịch hẹn trong email. Bỏ chọn để tạo bản xem trước ngắn trong LifeLink.",
  concern:
    "Email này có điểm đáng lo. Hãy kiểm tra yêu cầu trước khi hành động.",
  connectMailbox: "Kết nối Gmail hoặc Outlook",
  connected: (list) => `Đã kết nối: ${list}.`,
  countEmails: (count) => `${count} email`,
  empty:
    "Chưa có email ở đây. Kết nối hộp thư rồi chọn “Kiểm tra email mới” để nhập các thư gần đây.",
  from: "Từ ",
  helpMeUnderstand: "Giúp tôi hiểu",
  inbox: "Hộp thư đến",
  linksNotOpened:
    "LifeLink không mở liên kết trong email. Nếu email yêu cầu tiền hoặc thông tin riêng tư, hãy kiểm tra trước.",
  loadingEmail: "Đang tải email",
  loadingEmails: "Đang tải các email",
  localLanguageNotice:
    "Kiểm tra email này dùng quy tắc cục bộ chỉ dành cho tiếng Anh. Chúng có thể bỏ sót lừa đảo bằng tiếng Tây Ban Nha và ngôn ngữ khác. Không có dấu hiệu cảnh báo không có nghĩa email an toàn.",
  lowerPriority: "Ít ưu tiên hơn",
  mailboxes: "Hộp thư của quý vị",
  mayNeedReply: "Có thể cần trả lời",
  needsAttention: (label, error) =>
    `${label} cần được xem lại${error ? `: ${error}` : "."}`,
  newEmails: (count) =>
    count === 0 ? "Không có email mới." : `Có ${count} email mới.`,
  noMailbox: "Chưa kết nối hộp thư.",
  noSigns: "Không tìm thấy dấu hiệu cảnh báo. Chưa xác minh người gửi.",
  noSubject: "(Không có chủ đề)",
  noSubjectSpoken: "Không có chủ đề",
  noText: "Email này không có văn bản.",
  notChecked: "Chưa kiểm tra",
  notCheckedEmail: "Email này chưa được kiểm tra.",
  notCheckedNote: "Chưa kiểm tra",
  nowTheEmail: "Bây giờ là nội dung email.",
  openManualCheck: "Mở kiểm tra lừa đảo thủ công",
  opened: (subject) => `Đã mở: ${subject}`,
  paging: {
    loadOlder: "Tải email cũ hơn",
    loading: "Đang tải…",
    newer: "Mới hơn",
    noMoreImported:
      "Không nhập thêm email nào. Thử nhóm tiếp theo nếu vẫn còn email cũ hơn.",
    noOlder: "Không còn email cũ hơn.",
    older: "Email cũ hơn",
    page: (page) => `Trang ${page} · Tối đa 15 email mỗi lần`,
  },
  preview: "Hiện bản xem trước ngắn",
  readSummary: "Đọc bản tóm tắt thành tiếng",
  readingNow: "Đang đọc…",
  readyToRead: "Sẵn sàng để đọc",
  reconnect: "Kết nối lại",
  reply: "Trả lời",
  replyAdded:
    "Đã thêm câu trả lời vào bản nháp. Quý vị có thể sửa trước khi xem lại.",
  replyComposer: {
    nothingSent: (provider) =>
      `Chưa gửi gì. Quý vị sẽ xem lại trước, rồi nội dung được lưu thành bản nháp trong ${provider} của quý vị.`,
    placeholder: "Viết câu trả lời…",
    replyTo: (to) => `Trả lời ${to}`,
    review: "Xem lại bản nháp",
    speak: "Nói",
    stopListening: "Dừng nghe",
  },
  ride: {
    asked: "Quý vị đã nhờ người đưa đón.",
    confirmed: "Chuyến đi của quý vị đã được xác nhận.",
    declined: "Yêu cầu đưa đón đã bị từ chối.",
  },
  sampleEmails: " Đây là email mẫu để quý vị thực hành an toàn.",
  scamCheck: "Kiểm tra lừa đảo",
  scamCheckNotDone: "Chưa kiểm tra lừa đảo",
  scamSigns:
    "Nội dung này có dấu hiệu lừa đảo. Vui lòng kiểm tra trước khi làm theo bất kỳ yêu cầu nào.",
  spokenFrom: (subject, from, body) => `${subject}. Từ ${from}. ${body}`,
  summarizeCloud: "Tóm tắt bằng AI trên đám mây",
  summary: "Tóm tắt",
  summaryNote:
    "Tạo bản xem trước ngắn trong LifeLink hoặc chọn AI trên đám mây",
  summarySpoken: "Tóm tắt email.",
  theEmail: "Email này",
  title: "Email",
  unknownCheckNotice:
    "Bản kiểm tra đã lưu này không ghi rõ đã dùng AI trên đám mây hay quy tắc cục bộ. Quy tắc cục bộ chỉ hỗ trợ tiếng Anh và có thể bỏ sót lừa đảo bằng ngôn ngữ khác. Không có dấu hiệu cảnh báo không có nghĩa email an toàn.",
  warning: {
    concern:
      "Email này có điểm đáng lo. Hãy kiểm tra yêu cầu trước khi hành động.",
    intro: (reason) =>
      `Có thể là lừa đảo. ${reason} Nếu chưa chắc, hãy hỏi người quý vị tin tưởng trước khi trả lời, mở liên kết, gửi tiền hoặc chia sẻ thông tin cá nhân.`,
    signs: (signs) => `Dấu hiệu cảnh báo: ${signs}.`,
  },
  warningSigns: "Dấu hiệu cảnh báo",
  warningSignsFound: "Tìm thấy dấu hiệu cảnh báo",
  whatShouldIDo: "Tôi nên làm gì?",
};

export { email };
