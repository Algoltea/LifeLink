import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "Tài khoản và quyền truy cập",
  accountsLink: "Tài khoản LifeLink có thể sử dụng",
  aiEmailChecks: "Kiểm tra email mới bằng AI",
  aiEmailChecksDescription:
    "Khi email mới đến, dịch vụ AI trên đám mây sẽ kiểm tra dấu hiệu lừa đảo. Email cũ và email thực hành không bao giờ được gửi đi.",
  captions: "Phụ đề khi nói",
  captionsDescription: "Hiển thị lời nói khi quý vị trò chuyện với LifeLink.",
  characterCount: (count, maximum) => `${count} trên ${maximum} ký tự`,
  choicesNotSaved: (error) =>
    `Các lựa chọn chưa được lưu vào tài khoản. ${error} Vui lòng thử lại bên dưới.`,
  contrast: "Độ tương phản",
  contrastDescription:
    "Tăng độ tương phản giúp chữ đậm hơn và đường viền rõ hơn.",
  contrastMore: "Tương phản cao hơn",
  contrastStandard: "Tiêu chuẩn",
  defaultVoice: "Mặc định của LifeLink",
  demoAllowedHint: "Nút bật/tắt này tự động lưu.",
  demoBetweenModes:
    "Bất cứ việc gì chuẩn bị ở một chế độ đều phải được xem lại trước khi thực hiện ở chế độ kia.",
  demoDescription:
    "Ở chế độ thực hành, không có gì thực sự được gửi, lưu nơi khác hoặc mua. Mọi việc đều được mô phỏng và ghi nhãn “Thực hành”. Người và tin nhắn mẫu được thêm vào để quý vị thử một cách an toàn.",
  demoFailed: (error) =>
    `Không đổi được chế độ thực hành. ${error} Vui lòng thử nút bật/tắt lần nữa.`,
  demoOff:
    "Chế độ thực hành đang tắt. Mọi việc quý vị phê duyệt bây giờ sẽ thực sự diễn ra.",
  demoOn: "Chế độ thực hành đang bật.",
  demoTitle: "Chế độ thực hành",
  demoTurnedOff: "Chế độ thực hành đã bị tắt cho ứng dụng này.",
  demoUse: "Dùng chế độ thực hành",
  detailDetailed: "Chi tiết",
  detailShort: "Ngắn gọn",
  explanations: "Giải thích",
  explanationsDescription:
    "Ngắn gọn nêu những ý chính. Chi tiết giải thích thêm một chút.",
  fullName: "Họ và tên",
  groceriesLink: "Danh sách thực phẩm và ngân sách",
  hearSample: "Nghe thử",
  helpDescription:
    "Dùng khi LifeLink giải thích tin nhắn, kết quả kiểm tra lừa đảo, tóm tắt cuộc trò chuyện hoặc bản tin buổi sáng. Chỉ quý vị thấy những nội dung này. Các lựa chọn bên dưới được lưu khi thay đổi; ghi chú có nút Lưu ghi chú riêng.",
  helpTitle: "Cách tôi muốn được trợ giúp",
  language: "Ngôn ngữ",
  languageDescription:
    "Chọn ngôn ngữ cho màn hình LifeLink và trợ giúp trên đám mây. Các màn hình chính có sẵn bằng cả mười ngôn ngữ; một vài trang mới vẫn dùng tiếng Anh. Kiểm tra lừa đảo và email bằng quy tắc cục bộ chỉ hỗ trợ tiếng Anh và có thể bỏ sót lừa đảo bằng ngôn ngữ khác. Trích dẫn và tin nhắn giữ nguyên lời gốc.",
  lessMovement: "Giảm chuyển động",
  lessMovementDescription: "Tắt hiệu ứng trượt và mờ dần.",
  loading: "Đang tải cài đặt",
  newsOnToday: "Tin tức ở Hôm nay",
  newsOnTodayDescription:
    "Hiển thị ba tiêu đề tin ở Hôm nay. Quý vị chọn tin tốt hoặc tin nổi bật tại đó.",
  notes: "Ghi chú về cách tôi muốn được trợ giúp",
  notesHint:
    "Ví dụ: “Hướng dẫn tôi từng bước một.” Chỉ các phần giải thích của LifeLink dành cho quý vị mới dùng những ghi chú này. Chúng không bao giờ được cho gia đình xem hoặc đưa vào tin nhắn. Nếu quý vị cho phép giải thích trên đám mây, những ghi chú này được gửi cùng tin nhắn đến nhà cung cấp AI.",
  notesNotSaved: (error) =>
    `Ghi chú chưa được lưu. ${error} Nội dung vẫn còn ở đây. Chọn Lưu ghi chú để thử lại.`,
  notesSaveHint: "Chọn Lưu ghi chú để giữ thay đổi trong phần này.",
  notesSaved: "Ghi chú đã được lưu.",
  oneStep: "Từng bước một",
  oneStepDescription:
    "Hiển thị từng phần giải thích và bước tiếp theo, cùng nút Tiếp theo.",
  permissionsLink: "Ai được xem nội dung nào",
  postalCode: "Mã bưu chính",
  preferredName: "Tên LifeLink gọi quý vị",
  profileNotSaved: (error) =>
    `Hồ sơ chưa được lưu. ${error} Thông tin quý vị nhập vẫn còn ở đây. Chọn Lưu hồ sơ để thử lại.`,
  profileSaveHint: "Chọn Lưu hồ sơ để giữ thay đổi trong phần này.",
  profileTitle: "Thông tin về quý vị",
  readAloudAuto: "Tự động đọc thành tiếng",
  readAloudAutoDescription:
    "LifeLink đọc thành tiếng các bản tin và phản hồi mới.",
  readAloudVoice: "Giọng đọc",
  readAloudVoiceDescription:
    "Chọn giọng đọc cho quý vị. Mặc định của LifeLink dùng giọng tiêu chuẩn.",
  saveNotes: "Lưu ghi chú",
  saveProfile: "Lưu hồ sơ",
  saved: "Đã lưu.",
  savesAsYouChange: "Các tùy chọn này được lưu khi quý vị thay đổi.",
  seeingAndHearing: "Nhìn và nghe",
  signOff: "Cách quý vị ký tên trong tin nhắn",
  signOffPlaceholder: "Ví dụ: Mẹ",
  speakingSpeed: "Tốc độ đọc",
  speakingSpeedDescription: "Tốc độ LifeLink đọc thành tiếng.",
  speechQuicker: "Nhanh hơn",
  speechSample: "Đây là giọng LifeLink khi đọc cho quý vị nghe.",
  speechSlower: "Chậm hơn",
  speechUsual: "Bình thường",
  subline: "Điều chỉnh LifeLink để đọc và nghe thoải mái hơn.",
  textSize: "Cỡ chữ",
  textSizeDescription:
    "Áp dụng cho mọi trang. Thiết bị này sẽ nhớ lựa chọn của quý vị.",
  textSizeLarge: "Lớn",
  textSizeLarger: "Lớn hơn",
  textSizeLargest: "Lớn nhất",
  textSizeStandard: "Tiêu chuẩn",
  theme: "Sáng hoặc tối",
  themeDark: "Tối",
  themeLight: "Sáng",
  themeSystem: "Theo thiết bị của tôi",
  timeZone: "Múi giờ",
  title: "Cài đặt",
  trySavingAgain: "Thử lưu lại",
};

export { settings };
