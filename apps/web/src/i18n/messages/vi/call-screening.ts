import type { Messages } from "../en";

const callScreening: Messages["callScreening"] = {
  alertOff: "Âm báo đã tắt",
  alertPlayed: "Đã phát cảnh báo thành tiếng",
  alertPlaying: "Đang phát cảnh báo thành tiếng",
  alertReady: "Cảnh báo sẵn sàng",
  alertUnavailable: "Không phát được âm thanh. Hãy đọc cảnh báo trên màn hình.",
  askTrusted: "Hỏi người quý vị tin tưởng",
  bigger: "Chữ lớn hơn",
  callCaptions: "Nội dung nghe được trong cuộc gọi",
  callTime: "từ đầu cuộc gọi",
  callback:
    "Nếu có điều gì bất thường, hãy gác máy rồi gọi người đó hoặc công ty bằng số quý vị đã tin tưởng.",
  callbackAdvice:
    "Nếu có điều gì bất thường, hãy gác máy rồi gọi lại bằng số quý vị tin tưởng.",
  caller: "Người gọi",
  cannotConfirm: "Không thể xác nhận ai đã gọi.",
  captionSize: "Cỡ phụ đề",
  captionSource: "Tạo từ phụ đề có thể có sai sót.",
  captions: "Phụ đề",
  captionsEmpty: "Lời nói trong cuộc gọi sẽ xuất hiện ở đây.",
  captionsNotSaved: "Hiển thị đến khi quý vị rời trang. Không lưu lại.",
  checkMessage: "Kiểm tra tin nhắn",
  checkingLastPart:
    "Đang kiểm tra phần cuối cuộc gọi để tìm dấu hiệu cảnh báo…",
  checksUnavailable:
    "Hiện không thể kiểm tra dấu hiệu cảnh báo. Lời nói trong cuộc gọi vẫn hiển thị bên dưới.",
  clearTitle: "Không nghe thấy dấu hiệu cảnh báo",
  close: "Đóng",
  codes: "yêu cầu mã, mật khẩu hoặc thông tin cá nhân",
  connectionError:
    "Kết nối nghe đã dừng. Phụ đề vẫn còn ở đây. Nhấn Bắt đầu lại để tiếp tục nghe hoặc Hoàn tất để lưu tóm tắt.",
  consent:
    "Tôi hiểu âm thanh và lời nói trong cuộc gọi sẽ được gửi đến dịch vụ AI trên đám mây khi bật kiểm tra này.",
  credentialsReason: "Yêu cầu chia sẻ mã xác minh hoặc mật khẩu.",
  delete: "Xóa tóm tắt",
  deleteError: "Không xóa được tóm tắt. Vui lòng thử lại.",
  deleteNotice:
    "Xóa tóm tắt này không xóa tin nhắn quý vị đã chuẩn bị hoặc gửi.",
  deleting: "Đang xóa…",
  discard: "Bỏ tóm tắt",
  earlierAria: "Các lần kiểm tra cuộc gọi trước",
  finish: "Hoàn tất",
  finishSave: "Hoàn tất và lưu tóm tắt",
  flagged: "Điều LifeLink cảnh báo",
  flaggedAdvice:
    "Đừng chia sẻ mã hay gửi tiền. Hãy gác máy rồi gọi lại bằng số quý vị đã tin tưởng.",
  flaggedBody: "Người gọi đưa ra những yêu cầu kẻ lừa đảo thường dùng.",
  flaggedTitle: (count) => `Nghe thấy ${count} dấu hiệu cảnh báo`,
  gettingReady: "Đang chuẩn bị…",
  guideCaution:
    "Có thể bỏ sót dấu hiệu cảnh báo. Nếu cuộc gọi có vẻ bất thường, hãy gác máy rồi gọi lại bằng số quý vị đã tin tưởng.",
  guideTitle: "LifeLink có thể cảnh báo thành tiếng về:",
  hangUpFirst: "Quý vị có thể nói “Tôi sẽ gọi lại” rồi gác máy trước.",
  heard: "Điều LifeLink nghe được",
  heardText: (heardWords) =>
    heardWords === undefined
      ? "LifeLink không nghe thấy nội dung nào khớp với yêu cầu kẻ lừa đảo thường dùng."
      : `LifeLink đã nghe ${heardWords === 1 ? "1 từ" : `khoảng ${heardWords} từ`}. Không có nội dung nào khớp với yêu cầu kẻ lừa đảo thường dùng.`,
  help: "Tôi vừa nhận cuộc gọi mà chưa chắc có thật không. Bạn có thể giúp tôi kiểm tra trước khi chia sẻ thông tin hay gửi tiền không?",
  interrupted:
    "Kết nối bị dừng trong lần kiểm tra này. Chỉ những phần LifeLink nghe được mới được kiểm tra.",
  intro:
    "LifeLink hiển thị lời nói trong cuộc gọi, nhờ AI kiểm tra dấu hiệu lừa đảo và cảnh báo thành tiếng nếu phát hiện.",
  languageLimit:
    "Cuộc gọi trực tiếp dùng AI trên đám mây. Kiểm tra văn bản cục bộ vẫn dựa trên mẫu tiếng Anh; dịch giao diện không mở rộng phạm vi phát hiện. Kịch bản thực hành và cảnh báo bằng giọng nói vẫn bằng tiếng Anh. Phụ đề và trích dẫn giữ nguyên ngôn ngữ gốc.",
  listenTitle: "Nghe cuộc gọi",
  listening: "LifeLink đang nghe",
  liveCall: "Cuộc gọi trực tiếp",
  messageReview: "Tin nhắn cần xem lại",
  mixedVoices: "Phụ đề này gồm cả hai giọng nói và có thể có sai sót.",
  money: "yêu cầu tiền hoặc thẻ quà tặng",
  moneyReason: "Yêu cầu gửi tiền hoặc trả bằng thẻ quà tặng.",
  mute: "Tắt âm cảnh báo",
  noWarnings: "Chưa phát hiện dấu hiệu cảnh báo",
  noWarningsYet: " · Chưa phát hiện dấu hiệu cảnh báo nào",
  notConfigured:
    "Chưa thiết lập kiểm tra cuộc gọi trực tiếp. Quý vị có thể thử cuộc gọi thực hành hoặc nhập lời người gọi.",
  notSafe:
    "Điều này không có nghĩa cuộc gọi an toàn. LifeLink có thể bỏ sót dấu hiệu cảnh báo và không thể xác minh ai đã gọi.",
  openStep: "Giữ màn hình này mở khi quý vị nói chuyện.",
  otherDevice:
    "Nếu điện thoại không dùng được micrô khi gọi, hãy mở LifeLink trên thiết bị khác.",
  outcomeLabels: {
    clear: "Chưa phát hiện dấu hiệu cảnh báo",
    flagged: "Đã phát hiện dấu hiệu cảnh báo",
    silent: "Không nghe được gì",
    unchecked: "Chưa kiểm tra đầy đủ",
  },
  partlyChecked:
    "Một phần cuộc gọi không kiểm tra được nên có thể còn dấu hiệu cảnh báo khác.",
  paused:
    "Tạm dừng nghe khi phát cảnh báo để không nghe lại chính cảnh báo đó.",
  permissionDenied:
    "Chưa cho phép dùng micrô. Cho phép micrô trong cài đặt trang của trình duyệt rồi thử lại. Quý vị cũng có thể thử cuộc gọi thực hành.",
  phoneCall: "Cuộc gọi điện thoại",
  potentialScam: "Có thể là lừa đảo.",
  practice: "Thực hành",
  practiceCall: "Cuộc gọi thực hành",
  practiceCaptionSource: "Đây là lời thoại theo kịch bản cuộc gọi thực hành.",
  practiceCaptions: "Nội dung đang được nói",
  practiceExplanation:
    "Đây là cuộc gọi giả lập. Không dùng micrô hoặc AI trên đám mây.",
  practiceFlaggedBody:
    "Người gọi thực hành đưa ra những yêu cầu kẻ lừa đảo thường dùng.",
  practiceHeard: "Lời nói trong cuộc gọi thực hành",
  practiceHelp:
    "Tôi đã thử cuộc gọi lừa đảo thực hành của LifeLink. Mình có thể trao đổi về cách xử lý nếu gặp cuộc gọi như vậy không?",
  practiceMode:
    "Chế độ thực hành đang bật. Thử cuộc gọi giả lập bên dưới mà không cần micrô.",
  practicePlaying: "Đang phát cuộc gọi thực hành",
  practicePrivacy:
    "Không dùng micrô hoặc AI trên đám mây. Tóm tắt ngắn được lưu ở Các lần kiểm tra trước.",
  practiceSaved:
    "Cuộc gọi thực hành không dùng micrô hoặc AI trên đám mây. Tóm tắt ngắn được lưu ở Các lần kiểm tra trước.",
  practiceSilentBody:
    "Cuộc gọi thực hành kết thúc trước khi phát lời nào nên không có gì để kiểm tra.",
  practiceSilentTitle: "Thực hành đã dừng sớm",
  practiceSource: "Tạo từ kịch bản thực hành.",
  practiceSummary: "Tóm tắt cuộc gọi thực hành",
  practiceTime: "đã qua",
  practiceVoices:
    "Giọng nói thực hành có nhãn. Phụ đề cuộc gọi thật gồm cả hai giọng và không có nhãn.",
  privacy:
    "LifeLink không ghi âm cuộc gọi. Âm thanh từ micrô được gửi đến Gemini của Google để tạo phụ đề, rồi phụ đề được gửi đến mô hình AI để kiểm tra dấu hiệu cảnh báo. Khi quý vị dừng, LifeLink lưu tóm tắt ngắn về dấu hiệu cảnh báo, không lưu phụ đề.",
  protect:
    "Đừng chia sẻ mã, mật khẩu hoặc tiền. Hãy hỏi người quý vị tin tưởng.",
  quoteNotice: "Trích dẫn có thể có sai sót. Các dãy số dài được ẩn.",
  readResult: "Đọc kết quả thành tiếng",
  remote: "yêu cầu điều khiển máy tính hoặc điện thoại của quý vị",
  remoteReason: "Yêu cầu cho phép truy cập thiết bị từ xa.",
  retrySave: "Thử lưu lại",
  retrySteps: [
    "Bật loa ngoài cho cuộc gọi.",
    "Giữ điện thoại gần thiết bị này.",
    "Bắt đầu kiểm tra cuộc gọi lại trước khi trả lời.",
  ],
  retryTitle: "Để thử lại",
  review: "Xem lại",
  saveError: "Không lưu được tóm tắt. Giữ trang này mở và thử lại.",
  saving: "Đang lưu tóm tắt…",
  scamWarning: "Nội dung này có vẻ là lừa đảo.",
  screenAnotherCall: "Kiểm tra cuộc gọi khác",
  secrecyReason: "Yêu cầu giữ bí mật trong khi thúc ép quý vị hành động gấp.",
  silentBody:
    "LifeLink không nhận được lời nói nào nên không kiểm tra được dấu hiệu cảnh báo trong cuộc gọi.",
  silentTitle: "LifeLink không nghe được cuộc gọi",
  smaller: "Chữ nhỏ hơn",
  soundUnavailable:
    "Âm thanh không khả dụng. Dấu hiệu cảnh báo vẫn hiển thị trên màn hình.",
  speakerStep: "Bật loa ngoài và đặt điện thoại gần thiết bị này.",
  start: "Bắt đầu nghe",
  startAgain: "Bắt đầu lại",
  startError:
    "LifeLink không bắt đầu nghe được. Thử lại hoặc thử cuộc gọi thực hành.",
  startStep: "Nhấn Bắt đầu nghe và cho phép micrô.",
  stop: "Dừng",
  stopListening: "Dừng nghe",
  stopPractice: "Dừng cuộc gọi thực hành",
  stopped: "Đã dừng nghe",
  summary: "Tóm tắt cuộc gọi",
  summaryNoWarnings: "Không phát hiện dấu hiệu cảnh báo.",
  summarySaved:
    "Đã lưu tóm tắt ngắn ở Các lần kiểm tra trước. Không giữ âm thanh hoặc phụ đề.",
  summaryStorage:
    "Chỉ lưu tóm tắt ngắn ở Các lần kiểm tra trước. Không giữ âm thanh hoặc phụ đề.",
  summaryWarnings: "Cuộc gọi này có dấu hiệu cảnh báo.",
  tellTrusted: "Báo cho người quý vị tin tưởng",
  timeLimit: "Kiểm tra đã dừng sau 30 phút. Đây là tóm tắt đến thời điểm này.",
  times:
    "Thời gian tính bằng phút và giây từ đầu kiểm tra. Các dãy số dài được ẩn.",
  tryPractice: "Thử cuộc gọi thực hành",
  uncheckedBody:
    "Một số lời nói không kiểm tra được dấu hiệu cảnh báo nên bản tóm tắt này có thể bỏ sót.",
  uncheckedTitle: "LifeLink không kiểm tra đầy đủ được cuộc gọi này",
  unmute: "Bật âm cảnh báo",
  urgency: "đe dọa hoặc thúc ép hành động gấp và giữ bí mật",
  warningReasons: {
    codes_or_passwords: "Yêu cầu chia sẻ mã xác minh hoặc mật khẩu.",
    gift_cards: "Yêu cầu trả bằng thẻ quà tặng hoặc chia sẻ mã thẻ.",
    money: "Yêu cầu gửi tiền hoặc chuyển tiền tiết kiệm.",
    personal_details: "Yêu cầu thông tin cá nhân hoặc ngân hàng.",
    remote_access: "Yêu cầu cho phép truy cập thiết bị từ xa.",
    secrecy_or_pressure: "Yêu cầu giữ bí mật hoặc thúc ép hành động ngay.",
    threats: "Đe dọa bắt giữ, phạt tiền hoặc đóng tài khoản.",
  },
  warningSign: "Dấu hiệu cảnh báo",
  warnings: "Đã phát hiện dấu hiệu cảnh báo",
  you: "Quý vị",
};

export { callScreening };
