import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "Xin chờ một chút…",
  connectionFailed:
    "Không thể kết nối. Vui lòng kiểm tra kết nối internet và thử lại.",
  createAccount: "Tạo tài khoản",
  createFailed: "Không thể tạo tài khoản. Vui lòng thử lại.",
  createTitle: "Tạo tài khoản của quý vị",
  credentialsMismatch:
    "Email và mật khẩu không khớp. Vui lòng kiểm tra và thử lại.",
  email: "Email",
  friend: "Người bạn",
  fullName: "Họ và tên",
  hide: "Ẩn",
  hidePassword: "Ẩn mật khẩu",
  intro:
    "LifeLink giúp quý vị giữ liên lạc với gia đình và theo dõi công việc trong ngày. Không có gì được gửi nếu quý vị chưa đồng ý.",
  minimumPassword: (count) =>
    `Vui lòng chọn mật khẩu có ít nhất ${count} ký tự.`,
  modeLabel: "Đăng nhập hoặc tạo tài khoản",
  password: "Mật khẩu",
  passwordHint: (count) => `Ít nhất ${count} ký tự.`,
  playGuest: "Chơi Solitaire không cần đăng nhập",
  show: "Hiện",
  showPassword: "Hiện mật khẩu",
  signIn: "Đăng nhập",
  signUp: "Tạo tài khoản",
  takingBreak: "Quý vị muốn nghỉ ngơi một chút?",
  welcome: "Chào mừng quý vị trở lại",
};

export { auth };
