import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "Đồng ý và liên kết người này",
  assignedNumber: "Số iMessage được chỉ định: ",
  checkComplete: "Đã kiểm tra xong. Trạng thái hiện tại hiển thị ở trên.",
  checkFailed:
    "Không kiểm tra được tin nhắn đầu tiên của họ. Vui lòng thử lại.",
  checkFirstMessage: "Kiểm tra tin nhắn đầu tiên",
  checking: "Đang kiểm tra tin nhắn đầu tiên của họ…",
  confirmDescription:
    "Xem lại địa chỉ chính xác và cách sử dụng trước khi tiếp tục.",
  confirmInvitation: (contactName, handle) =>
    `Không gửi tin nhắn mời. Quý vị sẽ thấy số được chỉ định để chia sẻ với ${contactName}. Họ phải nhắn đến số đó trước từ ${handle}. Số điện thoại và email Apple ID là hai danh tính khác nhau, kể cả trên cùng điện thoại.`,
  confirmLink: "Liên kết người đã có trong Photon tại ",
  confirmLookup:
    "Tiếp tục sẽ tra cứu đúng địa chỉ này trong Photon, nhà cung cấp iMessage của chúng tôi, và dùng lại người liên hệ đã có. LifeLink không đăng ký người mới hoặc dùng thêm chỗ đăng ký.",
  confirmNoAccount: (contactName) =>
    `${contactName} không cần tài khoản LifeLink hay lời mời vào bảng điều khiển. Việc này không cấp quyền truy cập bất kỳ nội dung nào trong tài khoản quý vị.`,
  confirmTitle: (contactName) => `Liên kết iMessage cho ${contactName}?`,
  confirmTo: " với ",
  copied: (contactName) =>
    `Đã sao chép hướng dẫn. Quý vị hãy tự gửi cho ${contactName}.`,
  copy: "Sao chép hướng dẫn",
  copyFailed:
    "Không sao chép được hướng dẫn. Chọn và sao chép văn bản ở trên hoặc thử Sao chép hướng dẫn lần nữa.",
  exactAddress: "Địa chỉ liên hệ chính xác: ",
  firstMessageConfirmed:
    "Đã xác nhận tin nhắn đầu tiên của họ. LifeLink hiện có thể nhắn đến địa chỉ đã đăng ký này.",
  heading: "Thiết lập iMessage",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName}: Để dùng iMessage với LifeLink, trước tiên hãy gửi iMessage (ví dụ “Xin chào”) đến ${assignedNumber} từ đúng địa chỉ đã đăng ký: ${handle}. Trong ứng dụng Tin nhắn, đảm bảo cuộc trò chuyện bắt đầu từ ${handle}. Số điện thoại và email Apple ID là hai danh tính khác nhau, kể cả trên cùng điện thoại. Tin nhắn từ địa chỉ khác không kích hoạt địa chỉ này. Không cần tài khoản LifeLink hay lời mời vào bảng điều khiển.`,
  link: "Liên kết iMessage",
  linkExplanation:
    "Liên kết người đã đăng ký đúng địa chỉ này trong Photon. Nếu chưa có, thêm họ trong bảng điều khiển Photon trước rồi thử lại. LifeLink không tạo người mới.",
  linkFailed:
    "Không liên kết được người này. Kiểm tra xem đúng địa chỉ này đã được đăng ký trong bảng điều khiển Photon chưa, rồi thử lại.",
  loading: "Đang tải thiết lập iMessage…",
  lookingUp: "Đang tìm người liên hệ đã có trong Photon…",
  mustSendFirst: (contactName) =>
    `${contactName} phải gửi tin nhắn đầu tiên từ địa chỉ của họ ở trên. Tin nhắn của quý vị không kích hoạt được thiết lập của họ.`,
  needsAddress:
    "Cần địa chỉ iMessage. Thêm số điện thoại hoặc email Apple ID ở trên rồi lưu.",
  notConfigured:
    "Cần thiết lập ứng dụng. Người vận hành LifeLink phải kết nối Photon trước khi quý vị thiết lập iMessage cho người này.",
  ownerOnly:
    "Chỉ chủ tài khoản được thiết lập hoặc kiểm tra iMessage cho người liên hệ của mình.",
  practice: (contactName) =>
    `Tin nhắn thực hành ở trong LifeLink nên không cần thiết lập ở đây. Khi chuyển sang iMessage thật, quý vị có thể liên kết ${contactName} tại đây.`,
  retryLink: "Thử liên kết lại iMessage",
  row: {
    failed: "Cần xem lại iMessage",
    not_registered: "Chưa liên kết iMessage",
    registering: "Đang liên kết iMessage",
    waiting: "Đang chờ iMessage đầu tiên của họ",
  },
  status: {
    failed: "Cần xem lại thiết lập",
    not_registered: "Chưa liên kết",
    ready: "Sẵn sàng dùng iMessage",
    registering: "Đang liên kết",
    waiting: "Đang chờ tin nhắn đầu tiên của họ",
  },
};

export { imessageSetup };
