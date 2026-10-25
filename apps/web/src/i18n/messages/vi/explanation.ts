import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Đóng phần giải thích",
  cloud:
    "Phần giải thích bằng AI trên đám mây theo sự cho phép của quý vị. Mọi trích dẫn đã được đối chiếu với tin nhắn.",
  cloudConsent:
    "Dùng trợ lý trên đám mây để giải thích đầy đủ hơn. Văn bản tin nhắn được gửi đến nhà cung cấp AI. Bỏ chọn để giải thích cục bộ.",
  cloudConsentWithNotes:
    "Dùng trợ lý trên đám mây để giải thích đầy đủ hơn. Văn bản tin nhắn và ghi chú về cách quý vị muốn được trợ giúp được gửi đến nhà cung cấp AI. Bỏ chọn để giải thích cục bộ.",
  dateSpoken: (quote, date) =>
    `Ngày được nhắc đến: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Ngày giờ được nhắc đến",
  droppedNote:
    "Một số chi tiết trợ lý đưa ra không có nguyên văn trong tin nhắn, nên được hiển thị là phỏng đoán hoặc đã bỏ qua.",
  explainAgainWithCloud: "Giải thích lại bằng AI trên đám mây",
  explainThis: "Giải thích tin nhắn này",
  explainWithCloud: "Giải thích bằng AI trên đám mây",
  facts: "Nội dung tin nhắn nói",
  guessNote: "Đây là phỏng đoán, không phải điều tin nhắn nói.",
  guessSpoken: (text) => `Phỏng đoán: ${text}`,
  guesses: "Ý nghĩa có thể có",
  inPlainWords: "Giải thích dễ hiểu",
  intro:
    "LifeLink có thể giải thích tin nhắn yêu cầu gì, nhắc đến ngày nào và còn thiếu thông tin gì.",
  loading: "Đang tải phần giải thích",
  local: {
    chosen:
      "Giải thích cục bộ: dựa trên mẫu câu, không phải hiểu đầy đủ. Không gửi gì đến nhà cung cấp AI.",
    failed:
      "Giải thích cục bộ. Quý vị đã yêu cầu giải thích trên đám mây nhưng chưa hoàn tất. Nhà cung cấp có thể đã nhận được tin nhắn này.",
    limit:
      "Giải thích cục bộ. Đã đạt giới hạn giải thích trên đám mây hôm nay, nên không gửi thêm gì.",
    practice:
      "Thực hành: giải thích trong LifeLink. Tin nhắn thực hành không bao giờ được gửi đến nhà cung cấp AI.",
    unavailable:
      "Giải thích cục bộ. Trợ lý trên đám mây chưa được thiết lập nên không gửi gì đến nhà cung cấp AI.",
  },
  localLanguageNotice:
    "Phần giải thích bằng quy tắc cục bộ vẫn bằng tiếng Anh và chưa được dịch. Phần giải thích trên đám mây có thể dùng ngôn ngữ quý vị chọn. Trích dẫn từ tin nhắn gốc được giữ nguyên.",
  missing: "Chưa nói rõ",
  missingSpoken: (detail) => `Chưa nói rõ: ${detail}`,
  onlyYou:
    "Chỉ quý vị được xem. Nội dung này không bao giờ được gửi hay chia sẻ với gia đình.",
  part: "Phần",
  practiceNote:
    "Ở chế độ thực hành, LifeLink giải thích tin nhắn cục bộ. Tin nhắn thực hành không bao giờ được gửi đến nhà cung cấp AI.",
  readAloud: "Đọc phần giải thích thành tiếng",
  readReply: "Đọc câu trả lời này thành tiếng",
  reading: "Đang đọc tin nhắn…",
  replies: "Các câu trả lời gợi ý",
  repliesHint:
    "Chưa gửi gì. Câu trả lời được đưa vào ô tin nhắn để quý vị sửa và xem lại trước khi có bất kỳ việc gì diễn ra.",
  requestSpoken: (text, quote) => `Họ yêu cầu: ${text} Nguyên văn: ${quote}.`,
  requests: "Điều họ đang yêu cầu",
  title: "Trợ giúp hiểu tin nhắn này",
  useReply: "Dùng câu trả lời này",
  useReplyLabel: (label) => `Dùng câu trả lời này: ${label}`,
};

export { explanation };
