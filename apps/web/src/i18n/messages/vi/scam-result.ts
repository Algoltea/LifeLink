import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "Về lần kiểm tra này",
  adviceNote:
    "Lời khuyên này đến từ chính tin nhắn nên không được tính là dấu hiệu cảnh báo",
  adviceTitle: "Lời khuyên trong chính tin nhắn",
  allWords: "Toàn bộ nội dung LifeLink đã đọc",
  cannotProve:
    "Kết quả này không thể chứng minh tin nhắn là thật. Xác nhận những yêu cầu bất ngờ qua người liên hệ quý vị đã biết.",
  checkDidNotFinish: "Kiểm tra chưa hoàn tất",
  checkingMessage: "Đang kiểm tra tin nhắn của quý vị…",
  compareWithPhoto: "Đối chiếu với ảnh của quý vị",
  confidence: {
    high: "Có nhiều chi tiết hỗ trợ nhận định này. Vẫn chưa thể xác minh người gửi.",
    low: "Chưa đủ thông tin để chắc chắn. Ý kiến thứ hai có thể hữu ích.",
    medium:
      "Có một số chi tiết hỗ trợ nhận định này. Hãy tự xác minh yêu cầu qua nguồn khác.",
  },
  couldNotRead: "LifeLink không đọc rõ được ảnh này",
  delete: "Xóa lần kiểm tra này",
  deleteConfirm:
    "Xóa lần kiểm tra này? Nội dung sẽ bị xóa khỏi Các lần kiểm tra trước.",
  deleting: "Đang xóa…",
  howChecked: "Cách kiểm tra",
  imageUnverified:
    "Những chữ này được đọc từ ảnh và có thể sai hoặc thiếu. LifeLink không thể đối chiếu với văn bản gốc. Hãy kiểm tra với ảnh của quý vị.",
  keep: "Giữ lần kiểm tra này",
  kinds: {
    email: "Email",
    screenshot: "Ảnh hoặc ảnh chụp màn hình",
    text: "Tin nhắn",
  },
  localLanguageNotice:
    "Kiểm tra cục bộ này chỉ dành cho tiếng Anh. Có thể bỏ sót lừa đảo bằng tiếng Tây Ban Nha và ngôn ngữ khác. Không có dấu hiệu cảnh báo không có nghĩa tin nhắn an toàn.",
  method: {
    cloud:
      "Dịch vụ AI trên đám mây hỗ trợ lần kiểm tra này với sự cho phép của quý vị.",
    cloudOld:
      "Dịch vụ AI trên đám mây hỗ trợ lần kiểm tra trước này. Thông tin về sự cho phép không được lưu trong bản ghi.",
    rules:
      "LifeLink dùng các quy tắc cảnh báo thông thường. Tin nhắn không được gửi đến dịch vụ AI trên đám mây cho lần kiểm tra này.",
    rulesFallback:
      "LifeLink dùng các quy tắc cảnh báo thông thường vì AI trên đám mây không khả dụng hoặc chưa hoàn tất. Dịch vụ có thể đã nhận được nội dung này.",
    rulesOld:
      "LifeLink dùng các quy tắc cảnh báo thông thường. Bản ghi cũ này không cho biết dịch vụ AI trên đám mây có nhận được tin nhắn hay không.",
  },
  newPhoto: "Chụp ảnh mới",
  noFullWording:
    "Toàn bộ nội dung không được lưu cùng lần kiểm tra này. Những trích dẫn ở trên không phải bản chép đầy đủ. Đối chiếu với ảnh hoặc nhập nội dung để kiểm tra lại.",
  noSigns:
    "Không tìm thấy dấu hiệu cảnh báo rõ ràng. Điều đó không chứng minh tin nhắn này là thật.",
  noStepsHint:
    "Trước khi làm theo yêu cầu bất ngờ, hãy hỏi người quý vị quen qua thông tin liên hệ đã lưu.",
  originalEmail: "Email gốc",
  originalMessage: "Tin nhắn gốc",
  photo: {
    alt: "Ảnh dùng cho lần kiểm tra này",
    larger: "Xem ảnh lớn hơn",
    noPreview: "Không có bản xem trước ảnh cho lần kiểm tra này. ",
    readSaved: "Quý vị vẫn có thể đọc kết quả đã lưu.",
    reopen: "Thử mở lại lần kiểm tra.",
    see: "Xem ảnh",
    smaller: "Thu nhỏ ảnh",
    smallerAria: "Thu nhỏ ảnh",
  },
  photoRetention: {
    old: "Lần kiểm tra cũ này không có bản xem trước ảnh đã lưu. Xóa lần kiểm tra sẽ xóa kết quả; ảnh cũ có thể vẫn còn trong bộ nhớ lưu trữ.",
    owned:
      "Ảnh được lưu cùng lần kiểm tra này. Xóa lần kiểm tra cũng xóa ảnh, trừ khi ảnh vẫn được dùng bởi lần kiểm tra hoặc ảnh đã lưu khác.",
  },
  readAloud: "Đọc kết quả thành tiếng",
  readingPhoto: "Đang đọc nội dung trong ảnh…",
  recoveryMessage:
    "Hãy thận trọng với tin nhắn này. Quý vị có thể kiểm tra lại hoặc hỏi người tin tưởng.",
  recoveryPhoto:
    "Thử ảnh rõ hơn, đủ sáng và thấy đầy đủ chữ, hoặc nhập nội dung. Lần kiểm tra này không thể cho biết tin nhắn có thật hay không.",
  removedQuotes:
    "Một số từ trợ lý chỉ ra không có trong tin nhắn, nên không được hiển thị.",
  savedWording: "Nội dung được lưu cùng lần kiểm tra này",
  signCount: (count) => `${count} dấu hiệu cảnh báo`,
  signsNoteMessage: "Điểm đáng chú ý trong tin nhắn",
  signsNotePhoto: "Kèm nội dung LifeLink đọc từ ảnh",
  step: "Bước",
  titles: {
    email: "Kết quả kiểm tra email",
    screenshot: "Kết quả kiểm tra ảnh",
    text: "Kết quả kiểm tra tin nhắn",
  },
  typeWords: "Nhập nội dung thay thế",
  verdicts: {
    likely_safe: "Không có dấu hiệu cảnh báo rõ ràng",
    likely_scam: "Có thể là lừa đảo",
    suspicious: "Tìm thấy dấu hiệu cảnh báo",
    unsure: "Chưa xác minh",
  },
  waitHint:
    "Thường chỉ mất vài giây. Hãy để trang này mở. Trong lúc chờ, đừng dùng liên kết hoặc số điện thoại trong tin nhắn, cũng đừng trả tiền cho ai.",
  whatNow: "Việc nên làm bây giờ",
};

export { scamResult };
