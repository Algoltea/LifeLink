import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "Trình đơn tài khoản của ",
  closeMenu: "Đóng trình đơn",
  dismissNotice: "Ẩn thông báo",
  familyMember: "Người thân",
  groupGames: "Trò chơi",
  groupHelpWith: "Trợ giúp",
  groupSetup: "Thiết lập của quý vị",
  mainNavigation: "Chính",
  menu: "Trình đơn",
  nav: {
    ask: "Hỏi LifeLink",
    circle: "Nhóm tin cậy",
    connections: "Kết nối",
    documents: "Tài liệu",
    email: "Email",
    family: "Gia đình",
    groceries: "Thực phẩm",
    mahjong: "Mahjong",
    messages: "Tin nhắn",
    scam: "Kiểm tra lừa đảo",
    settings: "Cài đặt",
    solitaire: "Solitaire",
    today: "Hôm nay",
  },
  needsReview: (label) => `${label} cần quý vị xem lại.`,
  notTriedAgain: "Sẽ không tự động thử lại.",
  offline:
    "Quý vị đang ngoại tuyến. Quý vị vẫn có thể viết; mọi việc quý vị phê duyệt sẽ được kiểm tra lại và gửi khi có mạng trở lại.",
  offlineReview: "Cần xem lại công việc ngoại tuyến",
  offlineWaiting: (count) => ` ${count} đang chờ.`,
  openAsk: "Mở Hỏi LifeLink",
  openMenu: "Mở trình đơn",
  originalRequest: "Yêu cầu ban đầu của quý vị",
  playAccount:
    "Trò chơi được lưu trên thiết bị này và có thể chơi ngoại tuyến.",
  practiceBannerOn: "Chế độ thực hành đang bật.",
  practiceBannerRest: "Không có tin nhắn thật nào được gửi.",
  practiceMode: "Chế độ thực hành",
  reviewOnToday: "Xem lại ở Hôm nay",
  signOut: "Đăng xuất",
  skipToMain: "Chuyển đến nội dung chính",
  turnOffPractice: "Tắt chế độ thực hành",
  yourOfflineRequest: "Yêu cầu ngoại tuyến của quý vị",
};

export { shell };
