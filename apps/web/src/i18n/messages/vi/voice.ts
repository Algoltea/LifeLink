import type { Messages } from "../en";

const voice: Messages["voice"] = {
  connecting: "Đang kết nối…",
  connectionProblem: "Kết nối giọng nói gặp sự cố.",
  dictationStopped:
    "Nhập bằng giọng nói đã dừng. Thử lại hoặc nhập bằng bàn phím.",
  emptyRequest: "Chưa chuẩn bị gì vì yêu cầu trống.",
  inputLabel: "Quý vị muốn được giúp gì?",
  listening: "Đang nghe…",
  microphoneBusy:
    "Ứng dụng khác đang dùng micrô. Đóng ứng dụng đó rồi thử lại hoặc nhập bằng bàn phím.",
  microphoneDenied:
    "LifeLink chưa được phép dùng micrô. Cho phép trong cài đặt trang này của trình duyệt hoặc nhập bằng bàn phím.",
  microphoneFailed:
    "Micrô không khởi động được. Vui lòng thử lại hoặc nhập bằng bàn phím.",
  microphoneMissing:
    "Không tìm thấy micrô. Kiểm tra xem đã kết nối chưa hoặc nhập bằng bàn phím.",
  offlineFailed:
    "Không lưu được yêu cầu khi ngoại tuyến. Lời của quý vị vẫn ở đây. Vui lòng thử lại khi có mạng.",
  opening: "Đang mở nơi viết tin nhắn",
  placeholder: "Hỏi LifeLink…",
  prepareFailed:
    "Không chuẩn bị được. Vui lòng nhờ họ thử lại hoặc nhập nội dung.",
  prepared:
    "Đã chuẩn bị. Nội dung đang trên màn hình; không có gì diễn ra cho đến khi được phê duyệt tại đó.",
  preparing: "Đang chuẩn bị yêu cầu của bạn…",
  readAloudUnavailable: "Không thể đọc thành tiếng. Vui lòng thử lại.",
  retry: "Lời của quý vị vẫn trong ô. Nhấn Gửi để thử lại.",
  savedOffline: "Đã lưu. LifeLink sẽ xem yêu cầu khi quý vị có mạng trở lại.",
  screeningConnectionProblem: "Kết nối kiểm tra cuộc gọi gặp sự cố.",
  screeningDisconnected: "Đã ngắt kết nối kiểm tra cuộc gọi.",
  screeningLost: "Kiểm tra cuộc gọi mất kết nối.",
  screeningMicrophoneStopped:
    "Micrô đã dừng. Bắt đầu kiểm tra cuộc gọi lại để kết nối.",
  screeningResumeFailed:
    "Không tiếp tục được kiểm tra cuộc gọi sau cảnh báo. Hãy bắt đầu lại.",
  screeningStopped: "Đã dừng kiểm tra cuộc gọi.",
  send: "Gửi",
  sending: "Đang gửi",
  speak: "Nói",
  speakHint:
    "Nhấn Nói để nói thay vì nhập. Chưa gửi gì cho đến khi quý vị phê duyệt.",
  speaking: "LifeLink đang nói…",
  startFailed: (error) =>
    `Không khởi động được giọng nói: ${error} Quý vị có thể nhập bằng bàn phím.`,
  stop: "Dừng",
  unavailable:
    "Hiện không dùng được giọng nói, vui lòng nhập bằng bàn phím. Chưa gửi gì cho đến khi quý vị phê duyệt.",
  voiceStopped: "Đã dừng giọng nói.",
};

export { voice };
