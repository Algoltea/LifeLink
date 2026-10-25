import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "Thêm người này",
  addWay: "Thêm cách liên lạc khác",
  added: (name) => `Đã thêm ${name}.`,
  anotherWay: "Cách khác",
  askingForHelp: "Nhờ họ giúp đỡ",
  chooseDifferentPicture: "Chọn ảnh khác",
  choosePicture: "Chọn ảnh",
  detailsNotSaved: (error) =>
    `Không lưu được thông tin người này. ${error} Nội dung quý vị nhập vẫn còn ở đây. Hãy lưu lại để thử lại.`,
  howToReach: "Cách liên lạc",
  language: "Ngôn ngữ LifeLink dùng với họ",
  languageHelp:
    "Lời của LifeLink gửi cho họ, như lời giới thiệu quý vị trong iMessage đầu tiên, dùng ngôn ngữ này. Tin nhắn của quý vị luôn được gửi đúng như quý vị phê duyệt.",
  languageSameAsMine: (language) => `Giống tôi (${language})`,
  name: "Tên",
  notSetYet: "Chưa thiết lập",
  picture: "Ảnh",
  pictureFailed: (error) => `${error} Chọn ảnh để thử lại.`,
  pictureHelp:
    "Không bắt buộc. Ảnh được thu nhỏ thành hình vuông trên thiết bị này; thông tin vị trí và máy ảnh được xóa trước khi lưu.",
  pictureNotSaved: (error) =>
    `Thông tin người này đã được lưu, nhưng ảnh chưa được lưu. ${error} Các lựa chọn vẫn còn ở đây. Lưu lại để thử lại hoặc chọn ảnh khác.`,
  pictureUnusable: "Không dùng được ảnh này. Vui lòng thử ảnh khác.",
  preferredWay: "Cách liên lạc ưu tiên",
  relationship: "Mối quan hệ với quý vị",
  relationshipPlaceholder: "Con trai, hàng xóm, bạn",
  removePicture: "Xóa ảnh",
  saveChanges: "Lưu thay đổi",
  saved: "Đã lưu.",
  savingPersonAndPicture: "Đang lưu thông tin và ảnh…",
  trusted: "Trong nhóm tin cậy của tôi. LifeLink có thể gợi ý nhờ họ giúp.",
  ways: {
    discord: {
      help: "ID người dùng Discord của họ là một dãy số dài. Trong Discord: Settings (Cài đặt), Advanced (Nâng cao), Developer Mode (Chế độ nhà phát triển), rồi Copy User ID (Sao chép ID người dùng).",
      label: "Discord",
      valueLabel: "ID người dùng Discord",
    },
    email: {
      help: "Địa chỉ email của họ.",
      label: "Email (Gmail, Outlook và dịch vụ khác)",
      valueLabel: "Địa chỉ email",
    },
    imessageEmail: {
      help: "Email Apple ID họ dùng cho iMessage. Email là danh tính khác với số điện thoại. Để gửi iMessage thật sau này, lưu người này rồi chọn Chỉnh sửa và Liên kết iMessage.",
      label: "iMessage (email Apple ID)",
      valueLabel: "Email Apple ID",
    },
    imessagePhone: {
      help: "Số iPhone của họ. Để gửi iMessage thật sau này, lưu người này rồi chọn Chỉnh sửa và Liên kết iMessage.",
      label: "iMessage (số điện thoại)",
      valueLabel: "Số điện thoại",
    },
    telegram: {
      help: "Tên người dùng Telegram của họ, như @sam_alvarez (trong Telegram: Settings, rồi Username). Sau khi lưu, nhờ họ mở @LifeLinkMessage_Bot trong Telegram và nhấn Start (Bắt đầu). Không có tên người dùng? Để trống và dùng liên kết Telegram bên dưới.",
      label: "Telegram",
      valueLabel: "Tên người dùng Telegram",
    },
    whatsapp: {
      help: "Lưu để quý vị tham khảo. LifeLink chưa thể gửi tin nhắn WhatsApp.",
      label: "WhatsApp (chỉ lưu)",
      valueLabel: "Số WhatsApp",
    },
  },
  whoTheyAre: "Thông tin về họ",
};

export { contactForm };
