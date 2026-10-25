import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label) => `Tài khoản: ${label}`,
  allowProvider: (label) => `Chọn Cho phép trên trang ${label}.`,
  appAccount:
    "Tính năng này dùng tài khoản riêng của ứng dụng nên quý vị không cần đăng nhập.",
  callback: {
    back: "Quay lại Kết nối",
    checking: (label) => `Đang kiểm tra kết nối ${label}`,
    connected: (label) => `Đã kết nối ${label}.`,
    connectedTitle: (label) => `Đã kết nối ${label}`,
    declined: (label) =>
      `${label} chưa kết nối xong. Không có gì thay đổi. Quý vị có thể thử lại.`,
    missing:
      "Trang này được mở mà không có kết nối cần hoàn tất. Vui lòng bắt đầu lại từ Kết nối.",
    practice:
      "Chế độ thực hành đang bật. Tắt trong Cài đặt trước khi hoàn tất kết nối thật.",
    service: "Dịch vụ",
    subline: "Quay lại Kết nối để xem lại dịch vụ hoặc bắt đầu lại.",
    title: "Trạng thái kết nối",
    unavailable:
      "Dịch vụ này chưa có kết nối trong LifeLink. Quay lại Kết nối để xem giới hạn.",
  },
  canDo: "Có thể làm",
  cancel: "Hủy",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Đóng",
  comingLater: "Sẽ có sau",
  connect: "Kết nối",
  connectProvider: (label) => `Kết nối ${label}`,
  connectionState: (status) => `Kết nối đang ${status}.`,
  connectionStates: {
    active: "hoạt động",
    deleted: "đã xóa",
    expired: "hết hạn",
    failed: "thất bại",
    inactive: "không hoạt động",
    initiated: "đã bắt đầu",
    pending: "đang chờ",
    revoked: "đã thu hồi",
  },
  detailLabel: (label, summary) => `${label}. ${summary} Chi tiết.`,
  details: "Chi tiết",
  developerSetupAfter: (label) => ` và chọn ${label}.`,
  developerSetupBefore: "Dành cho người vận hành LifeLink: chạy ",
  disconnect: (label) => `Ngắt kết nối ${label}`,
  disconnectPractice: "Ngắt tài khoản thực hành",
  disconnectTip: (label) =>
    `Gợi ý: họ có thể ngắt kết nối ${label} từ cửa sổ này bất cứ lúc nào.`,
  disconnected: (label) =>
    `Đã ngắt kết nối ${label}. Từ giờ sẽ không dùng kết nối này nữa.`,
  discordSetup: (practice) =>
    `${practice ? "Khi dùng Discord thật, thêm" : "Thêm"} ID người dùng Discord của mỗi người trong Nhóm tin cậy.`,
  empty: "Chưa có dịch vụ nào.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "Chưa thiết lập kết nối cho ứng dụng này. Chạy bun run dev:setup.",
    "Please sign in again.": "Vui lòng đăng nhập lại.",
    "Practice connections are only available in practice mode.":
      "Kết nối thực hành chỉ có trong chế độ thực hành.",
    "That account could not be found.": "Không tìm thấy tài khoản đó.",
    "That connection could not be found.": "Không tìm thấy kết nối đó.",
    "The connection did not finish. You can try again.":
      "Kết nối chưa hoàn tất. Quý vị có thể thử lại.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "Kết nối đã thay đổi khi xử lý yêu cầu. Quay lại Kết nối để xem trạng thái.",
    "This connection was not started from your account. Please try connecting again.":
      "Kết nối này không bắt đầu từ tài khoản của quý vị. Vui lòng thử kết nối lại.",
    "This service does not use a personal sign-in.":
      "Dịch vụ này không dùng đăng nhập cá nhân.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "Tắt chế độ thực hành trong Cài đặt trước khi kết nối hoặc thay đổi tài khoản thật.",
    "We could not confirm the connection.": "Không xác nhận được kết nối.",
  },
  groups: {
    appointments: "Quản lý lịch hẹn",
    email: "Đọc và viết email",
    messages: "Nhắn tin với gia đình và bạn bè",
  },
  helperTitle: "Quý vị đang thiết lập giúp người khác?",
  imessageIntro:
    "Liên kết mỗi người trong Nhóm tin cậy với người liên hệ đã có trong Photon. LifeLink không đăng ký người mới.",
  imessageSteps: [
    "Lưu đúng số điện thoại hoặc email Apple ID họ dùng để gửi iMessage. Số điện thoại và email là hai danh tính riêng, kể cả của cùng một người.",
    "Đảm bảo đúng địa chỉ này đã đăng ký trong bảng điều khiển Photon. Nếu chưa có, thêm người liên hệ tại đó trước. Sau đó chọn Liên kết iMessage trong Nhóm tin cậy và dùng số được chỉ định cho họ.",
    "Nhờ họ gửi iMessage đầu tiên đến số được chỉ định từ đúng địa chỉ đã lưu. LifeLink có thể nhắn cho họ sau khi nhận tin nhắn đầu tiên.",
  ],
  intro: (label) =>
    `LifeLink có thể làm những việc này với ${label}. Chưa gửi gì cho đến khi quý vị phê duyệt.`,
  limitTags: {
    not_offered: "Không thể thực hiện",
    not_wired: "Sẽ có sau",
  },
  limitsCount: (count) => `Những việc LifeLink chưa làm được (${count})`,
  limitsTitle: "Những việc LifeLink chưa làm được",
  loading: "Đang tải kết nối",
  manage: "Quản lý",
  notSetUp: "Tính năng này chưa bật. Nhờ người đã thiết lập LifeLink bật lên.",
  openCircle: "Mở Nhóm tin cậy",
  permissions: {
    add: "Thêm",
    calendar: "Tìm ngày",
    draft: "Soạn nháp",
    message: "Nhắn tin",
    money: "Tiền",
    notice: "Thông báo",
    post: "Đăng",
    read: "Đọc",
    replies: "Phản hồi",
    send: "Gửi",
    unavailable: "Chưa có",
  },
  practiceAccount: "Dùng tài khoản thực hành",
  practiceBlocked: (label) =>
    `Kết nối ${label} thật đã được lưu. Tài khoản thực hành không thể thay thế nó. Tắt chế độ thực hành trong Cài đặt để quản lý.`,
  practiceConnected: (label) =>
    `Đã kết nối tài khoản ${label} thực hành. Tài khoản này không bao giờ liên lạc với dịch vụ thật.`,
  practiceDisconnected: (label) => `Đã ngắt tài khoản ${label} thực hành.`,
  practiceMessages: (imessage) =>
    `${imessage ? "iMessage" : "Tin nhắn Discord"} thực hành được mô phỏng. Không có tin nhắn đến người liên hệ của quý vị.`,
  practiceNeverConnects:
    "Tài khoản thực hành này không bao giờ kết nối với dịch vụ thật.",
  pressConnect: (label) => `Nhấn ${label} bên dưới.`,
  providers: {
    discord: {
      accountRequirement:
        "Người thân cùng máy chủ với bot của ứng dụng hoặc đã nhắn cho bot trước.",
      capabilities: {
        "discord.receive": {
          label: "Nhận phản hồi",
          note: "Phản hồi đến khi bot Discord của LifeLink trực tuyến.",
        },
        "discord.send": {
          label: "Gửi tin nhắn trực tiếp sau khi quý vị phê duyệt",
        },
      },
      summary: "Tin nhắn trực tiếp với người thân trên Discord.",
    },
    ebay: {
      accountRequirement: "Không thể kết nối tài khoản eBay cá nhân ở đây.",
      capabilities: {
        "ebay.search": {
          label: "Tìm mặt hàng trên eBay",
        },
        "ebay.selling": {
          label: "Mặt hàng đăng bán, đơn hàng hoặc giao dịch mua của quý vị",
        },
      },
      summary: "Tìm kiếm sẽ có sau. LifeLink không bao giờ mua hoặc bán.",
    },
    facebook: {
      accountRequirement:
        "Chỉ tính năng Trang Facebook. Không hỗ trợ hồ sơ cá nhân.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Đọc và trả lời tin nhắn của Trang",
        },
        "facebook.page_post": {
          label: "Đăng lên Trang sau khi quý vị phê duyệt",
        },
        "facebook.personal": {
          label: "Dòng thời gian cá nhân và tin nhắn bạn bè",
          note: "Facebook không cho ứng dụng đọc hoặc gửi trò chuyện Messenger cá nhân.",
        },
      },
      summary: "Chỉ Trang doanh nghiệp. Sẽ có sau.",
    },
    gmail: {
      accountRequirement: "Tài khoản Google.",
      capabilities: {
        "email.appointments": {
          label: "Tìm lịch hẹn trong email",
        },
        "email.draft": {
          label: "Viết bản nháp để quý vị xem lại",
        },
        "email.new_message_event": {
          label: "Báo thư mới (kiểm tra khoảng mỗi phút)",
        },
        "email.read_selected": {
          label: "Đọc email quý vị chọn để tóm tắt",
        },
        "email.send": {
          label: "Gửi email sau khi quý vị phê duyệt",
        },
      },
      summary: "Đọc, viết và gửi email. Tìm lịch hẹn trong thư.",
    },
    google_calendar: {
      accountRequirement: "Tài khoản Google.",
      capabilities: {
        "calendar.create": {
          label: "Thêm lịch hẹn đã phê duyệt",
        },
        "calendar.read": {
          label: "Xem sự kiện sắp tới",
        },
      },
      summary: "Thêm lịch hẹn vào lịch sau khi quý vị phê duyệt.",
    },
    google_drive: {
      accountRequirement: "Tài khoản Google.",
      capabilities: {
        "drive.create": {
          label: "Lưu ghi chú lịch hẹn thành tài liệu sau khi quý vị phê duyệt",
        },
        "drive.read": {
          label: "Tìm tệp quý vị đã lưu trong Drive",
          note: "LifeLink thấy tên tệp và liên kết, không thấy nội dung bên trong.",
        },
      },
      summary: "Tìm tệp và lưu ghi chú lịch hẹn.",
    },
    imessage: {
      accountRequirement:
        "Người liên hệ không cần lời mời, tài khoản LifeLink hay quyền vào bảng điều khiển Photon.",
      capabilities: {
        "imessage.delivery": {
          label: "Cập nhật giao tin",
          note: "LifeLink biết tin nhắn đã gửi nhưng không biết đã đến hoặc được đọc chưa.",
        },
        "imessage.first_contact": {
          label: "Bắt đầu trò chuyện với người mới",
          note: "Mỗi người phải gửi tin nhắn đầu tiên.",
        },
        "imessage.receive": {
          label: "Nhận phản hồi",
        },
        "imessage.send": {
          label: "Gửi tin nhắn hoặc ảnh sau khi quý vị phê duyệt",
          note: "Dùng được sau khi họ gửi tin nhắn đầu tiên.",
        },
      },
      summary:
        "Nhắn tin với gia đình và bạn bè. Mỗi người gửi tin nhắn đầu tiên.",
    },
    instacart: {
      accountRequirement: "Không còn mua sắm qua LifeLink.",
      capabilities: {},
      summary: "Không còn mua sắm qua LifeLink.",
    },
    instagram: {
      accountRequirement: "Tài khoản Instagram Business hoặc Creator.",
      capabilities: {
        "instagram.messages": {
          label: "Trả lời tin nhắn trực tiếp",
        },
        "instagram.personal": {
          label: "Tài khoản cá nhân",
        },
        "instagram.post": {
          label: "Chia sẻ bài đăng ảnh sau khi quý vị phê duyệt",
        },
      },
      summary: "Chỉ tài khoản Business và Creator. Sẽ có sau.",
    },
    outlook: {
      accountRequirement:
        "Tài khoản Microsoft. Một số tài khoản công việc cần quản trị viên đồng ý.",
      capabilities: {
        "calendar.create": {
          label: "Thêm lịch hẹn đã phê duyệt vào lịch Outlook",
        },
        "email.draft": {
          label: "Viết bản nháp để quý vị xem lại",
        },
        "email.new_message_event": {
          label: "Báo email mới khi đến",
        },
        "email.read_selected": {
          label: "Đọc email quý vị chọn để tóm tắt",
        },
        "email.send": {
          label: "Gửi email sau khi quý vị phê duyệt",
        },
      },
      summary: "Thư và lịch Outlook trong một kết nối.",
    },
    paypal: {
      accountRequirement: "Không thể kết nối tài khoản PayPal cá nhân ở đây.",
      capabilities: {
        "paypal.invoices": {
          label: "Tra cứu hóa đơn",
        },
        "paypal.send_money": {
          label: "Gửi tiền cho một người",
          note: "LifeLink không bao giờ gửi tiền.",
        },
      },
      summary: "Tra cứu hóa đơn sẽ có sau. LifeLink không bao giờ gửi tiền.",
    },
    telegram: {
      accountRequirement:
        "Người thân mở liên kết LifeLink tạo cho họ rồi nhấn Start (Bắt đầu) trong Telegram.",
      capabilities: {
        "telegram.first_contact": {
          label: "Bắt đầu trò chuyện với người mới",
          note: "Mỗi người phải nhấn Start (Bắt đầu) trong bot trước.",
        },
        "telegram.receive": {
          label: "Nhận phản hồi",
        },
        "telegram.send": {
          label: "Gửi tin nhắn hoặc ảnh sau khi quý vị phê duyệt",
        },
      },
      summary: "Tin nhắn với người thân trên Telegram.",
    },
  },
  realImessage: "Khi dùng iMessage thật, hãy làm theo các bước này.",
  requirements: "Những gì quý vị cần",
  retry: "Thử kết nối lại",
  returnConnected: "Quý vị quay lại đây và thấy Đã kết nối.",
  setup: "Thiết lập",
  signInProvider: (label) =>
    `Quý vị sẽ đăng nhập trên trang riêng của ${label}. LifeLink không bao giờ thấy mật khẩu.`,
  signInTheirAccount: "Đăng nhập bằng tài khoản của họ, không phải của quý vị.",
  status: {
    connected: "Đã kết nối",
    disconnected: "Chưa kết nối",
    error: "Kết nối chưa thành công",
    notOn: "Chưa bật",
    pending: "Chưa hoàn tất",
    practice: "Thực hành",
    practiceAccount: "Tài khoản thực hành",
    ready: "Sẵn sàng",
    realSaved: "Đã lưu tài khoản thật",
  },
  subline:
    "Kết nối các dịch vụ quý vị đang dùng. Mở từng dịch vụ để xem LifeLink có thể làm gì.",
  telegramSetup: (practice) =>
    `${practice ? "Khi dùng Telegram thật, mở" : "Mở"} từng người trong Nhóm tin cậy, chọn Liên kết Telegram rồi gửi liên kết cho họ. Họ nhấn Start (Bắt đầu) một lần.`,
  title: "Kết nối",
  unavailableFeatures: (label) =>
    `${label} chưa có tính năng khả dụng trong LifeLink. Quý vị không cần kết nối tài khoản.`,
  unavailableIntro: (label) => `LifeLink chưa làm được gì với ${label}.`,
};

export { connections };
