import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "Quay lại tệp của quý vị",
  changed: "Đã thay đổi ",
  changedAt: (when) => `Đã thay đổi ${when}`,
  changedSr: ", đã thay đổi ",
  changedSuffix: (when) => ` · Đã thay đổi ${when}`,
  checkingConnection: "Đang kiểm tra kết nối Google Drive",
  chooseFile: "Chọn tệp để xem trước tại đây.",
  connect: "Kết nối Google Drive",
  connectHint: "Kết nối Google Drive để xem tệp tại đây.",
  connectPracticeHint: "Kết nối Google Drive thực hành để thử với tệp mẫu.",
  connected: (account) =>
    `Đã kết nối: Google Drive${account ? ` (${account})` : ""}. Mở tệp trong Google Drive để sửa hoặc chia sẻ.`,
  embedHint:
    "Google trực tiếp hiển thị bản xem trước này. Nếu được yêu cầu đăng nhập, hãy dùng cùng tài khoản Google đã kết nối hoặc mở tệp trong Google Drive.",
  empty: "Google Drive của quý vị chưa có tệp.",
  fileCountAll: (count) => `Đó là tất cả ${count} tệp.`,
  filesFound: "Tệp tìm thấy",
  find: "Tìm tệp theo tên",
  folderNoPreview:
    "Không thể xem trước thư mục tại đây. Mở trong Google Drive để xem bên trong.",
  kinds: {
    Document: "Tài liệu",
    File: "Tệp",
    Folder: "Thư mục",
    PDF: "PDF",
    Picture: "Ảnh",
    Slides: "Trang trình chiếu",
    Spreadsheet: "Bảng tính",
  },
  loadingFiles: "Đang tải tệp Drive",
  loadingMore: "Đang tải thêm tệp",
  moreFailed: "Không tải được các tệp tiếp theo.",
  noLink:
    "Google Drive không cung cấp liên kết cho tệp này. Mở Google Drive và tìm theo tên.",
  noMatch: (search) => `Không có tên tệp nào chứa “${search}”.`,
  openInDrive: "Mở trong Google Drive",
  opened: (name) => `Đã mở: ${name}`,
  opensNewTab: "(mở trong thẻ mới)",
  practiceConnected:
    "Drive thực hành có tệp mẫu và ghi chú quý vị lưu ở chế độ thực hành. Không có nội dung nào ở đây đến từ tài khoản Google thật.",
  practiceNoLink:
    "Tệp thực hành chỉ có trong LifeLink nên không mở được trong Google Drive. Khi Drive thật được kết nối, nút này sẽ mở tệp ở đó.",
  previewOf: (name) => `Xem trước ${name} từ Google Drive`,
  previewPrefix: "Xem trước: ",
  reconnect: "Kết nối lại Google Drive",
  searching: "Đang tìm…",
  sort: "Sắp xếp",
  sorts: {
    folders_first: "Thư mục trước",
    name_asc: "Tên, A đến Z",
    name_desc: "Tên, Z đến A",
    oldest: "Cũ nhất trước",
    recent: "Mới thay đổi",
  },
  title: "Tài liệu",
  whatItSays: (name) => `Nội dung của ${name}`,
  yourDrive: "Google Drive của quý vị",
  yourDriveFiles: "Tệp Drive của quý vị",
  yourFiles: "Tệp của quý vị",
};

export { documents };
