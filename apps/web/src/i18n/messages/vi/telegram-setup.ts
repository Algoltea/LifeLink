import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `Đã sao chép lời mời. Quý vị hãy tự gửi cho ${contactName}.`,
  copiedLink: (contactName) =>
    `Đã sao chép liên kết. Quý vị hãy tự gửi cho ${contactName}.`,
  copyInvitation: "Sao chép lời mời",
  copyInvitationFailed:
    "Không sao chép được lời mời. Hãy sao chép địa chỉ ở trên.",
  copyLink: "Sao chép liên kết",
  copyLinkFailed: "Không sao chép được liên kết. Chọn và sao chép ở trên.",
  expires: (day) => ` Chỉ dùng một lần và hết hiệu lực vào ${day}.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `Chào ${contactName}! Mở ${botUrl} trong Telegram rồi nhấn Start (Bắt đầu) để mình có thể nhắn tin qua LifeLink.`,
  link: "Liên kết Telegram",
  linked: (account, contactName) =>
    `Đã liên kết với ${account}. Tin nhắn quý vị phê duyệt cho ${contactName} có thể gửi qua Telegram và phản hồi sẽ đến trong Tin nhắn.`,
  loading: "Đang tải thiết lập Telegram…",
  newLink: "Tạo liên kết mới",
  notConfigured:
    "Cần thiết lập ứng dụng. Người vận hành LifeLink phải kết nối Telegram trước khi quý vị liên kết cho người này.",
  ownerOnly:
    "Chỉ chủ tài khoản được liên kết Telegram cho người liên hệ của mình.",
  sendLink: (contactName) =>
    `Gửi liên kết này cho ${contactName}. Khi họ mở và nhấn Start (Bắt đầu), Telegram sẽ tự động được liên kết tại đây.`,
  theirAccount: "tài khoản Telegram của họ",
  unlink: "Bỏ liên kết Telegram",
  waitingAsk: (contactName) => `. Nhờ ${contactName} mở `,
  waitingFor: (username) => `Đang chờ @${username}`,
  waitingRest:
    " trong Telegram và nhấn Start (Bắt đầu). LifeLink sẽ liên kết ngay khi họ thực hiện.",
};

export { telegramSetup };
