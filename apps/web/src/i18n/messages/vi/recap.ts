import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "Đã thống nhất",
  agreedSpoken: (text) => `Đã thống nhất: ${text}`,
  changedNote:
    "Một số chi tiết trợ lý đưa ra không có nguyên văn trong tin nhắn, hoặc chỉ là lời đề nghị chứ chưa phải thỏa thuận, nên đã được sửa hoặc bỏ qua.",
  close: "Đóng bản tóm tắt",
  cloud:
    "Bản tóm tắt bằng AI trên đám mây theo sự cho phép của quý vị. Mọi trích dẫn đã được đối chiếu với các tin nhắn.",
  cloudConsent:
    "Dùng trợ lý trên đám mây để tóm tắt đầy đủ hơn. Tin nhắn gần đây của quý vị với người này được gửi đến nhà cung cấp AI. Bỏ chọn để tạo bản tóm tắt nhanh trong LifeLink.",
  done: "Xong",
  doneFromRecords:
    "Từ bản ghi của LifeLink, không phải từ lời nói trong tin nhắn.",
  inShort: "Tóm lược",
  intro: (contactName) =>
    `LifeLink có thể tóm tắt những gì quý vị và ${contactName} đã thống nhất, những gì mới chỉ đề nghị và điều còn chưa rõ.`,
  loading: "Đang tải bản tóm tắt",
  local: {
    chosen:
      "Tóm tắt nhanh trong LifeLink: dựa trên mẫu câu, không phải hiểu đầy đủ. Không gửi gì đến nhà cung cấp AI.",
    failed:
      "Tóm tắt nhanh trong LifeLink. Quý vị đã yêu cầu tóm tắt trên đám mây nhưng chưa hoàn tất. Nhà cung cấp có thể đã nhận được các tin nhắn này.",
    limit:
      "Tóm tắt nhanh trong LifeLink. Đã đạt giới hạn tóm tắt trên đám mây hôm nay, nên không gửi thêm gì.",
    practice:
      "Thực hành: tóm tắt nhanh trong LifeLink. Tin nhắn thực hành không bao giờ được gửi đến nhà cung cấp AI.",
    unavailable:
      "Tóm tắt nhanh trong LifeLink. Trợ lý trên đám mây chưa được thiết lập nên không gửi gì đến nhà cung cấp AI.",
  },
  messageTo: (contactName) => `Tin nhắn gửi ${contactName}`,
  nextSteps: "Các bước tiếp theo có thể làm",
  nextStepsHint:
    "Không có gì diễn ra cho đến khi quý vị chuẩn bị một bước, xem lại và phê duyệt.",
  noFinishedTasks: (contactName) =>
    `LifeLink không có công việc hoàn tất nào với ${contactName} trong thời gian này. Lời nói trong tin nhắn không được tính là đã làm xong.`,
  offerNote:
    "Lời đề nghị chưa phải là thỏa thuận cho đến khi người kia đồng ý.",
  offered: "Đã đề nghị, chưa thống nhất",
  offeredSpoken: (text) => `Đã đề nghị, chưa thống nhất: ${text}`,
  onlyYou:
    "Chỉ quý vị được xem. Nội dung này không bao giờ được gửi hay chia sẻ với gia đình.",
  part: "Phần",
  practiceNote:
    "Ở chế độ thực hành, LifeLink tự tạo bản tóm tắt. Tin nhắn thực hành không bao giờ được gửi đến nhà cung cấp AI.",
  prepare: "Chuẩn bị để xem lại",
  prepared: "Đã chuẩn bị. Xem lại",
  readAloud: "Đọc bản tóm tắt thành tiếng",
  reading: "Đang đọc cuộc trò chuyện…",
  recapAgain: "Tóm tắt lại",
  recapThis: "Tóm tắt cuộc trò chuyện này",
  recapWithCloud: "Tóm tắt bằng AI trên đám mây",
  reminderForYou: "Lời nhắc dành cho quý vị",
  stillUnclear: "Vẫn chưa rõ",
  title: (contactName) => `Tóm tắt với ${contactName}`,
  unclearSpoken: (text) => `Vẫn chưa rõ: ${text}`,
  you: "Quý vị",
};

export { recap };
