import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "Đóng lịch sử trò chuyện",
  composerLabel: "Viết hoặc nói với LifeLink",
  conversationLabel: "Trò chuyện với LifeLink",
  copied: "Đã sao chép",
  copy: "Sao chép",
  copyUnavailable: "Không thể sao chép tại đây. Quý vị có thể chọn văn bản.",
  emailSummary: {
    cloud: "Tóm tắt trên đám mây",
    cloudConsent:
      "Dùng AI trên đám mây để có bản tóm tắt đầy đủ hơn. Thao tác này gửi văn bản có sẵn và các bản tóm tắt đã lưu của 15 email nhập gần nhất đến nhà cung cấp AI. Bỏ chọn để LifeLink tự tóm tắt.",
    count: (count) => `${count} email nhập gần đây · `,
    empty:
      "Chưa có email được nhập. Kiểm tra email mới ở trang Email rồi tóm tắt lại.",
    emptyGroup: "Không có email trong nhóm này.",
    groups: {
      check_first: "Kiểm tra trước khi hành động",
      low_priority: "Ít ưu tiên hơn",
      reply: "Có thể cần trả lời",
      review: "Nên xem qua",
    },
    howMade: "Cách tạo bản tóm tắt này",
    local: "Tóm tắt của LifeLink",
    noSubject: "(Không có chủ đề)",
    offline: "Kết nối mạng để tóm tắt email đã nhập.",
    openEmail: "Mở Email",
    options: "Tùy chọn tóm tắt",
    practicePrefix: "Thực hành · ",
    suggestionsOnly:
      "Chỉ là gợi ý. Hãy xem lại tin nhắn gốc trước khi hành động. Không có gì được gửi hoặc thay đổi trong hộp thư.",
    summarize: "Tóm tắt email",
    summarizing: "Đang tóm tắt email…",
    title: "Tóm tắt email gần đây",
    working: "Đang thêm bản tóm tắt email vào cuộc trò chuyện…",
  },
  failed: "Phản hồi chưa hoàn tất. Vui lòng hỏi lại.",
  history: "Lịch sử",
  historyDescription: "Tiếp tục từ chỗ quý vị dừng lại.",
  historyEmpty:
    "Chưa có cuộc trò chuyện. Cuộc trò chuyện đầu tiên sẽ được lưu ở đây.",
  historyGroups: {
    earlier: "Trước đây",
    thisWeek: "Tuần này",
  },
  historyTitle: "Lịch sử trò chuyện",
  lifeLinkSaid: "LifeLink nói: ",
  loadEarlier: "Hiện tin nhắn trước",
  loadEarlierConversations: "Hiện cuộc trò chuyện trước",
  loadingConversation: "Đang tải cuộc trò chuyện của quý vị",
  loadingConversations: "Đang tải các cuộc trò chuyện…",
  loadingEarlier: "Đang tải tin nhắn trước…",
  loadingHistory: "Đang tải lịch sử trò chuyện",
  newChat: "Cuộc trò chuyện mới",
  openNow: ", đang mở",
  opening: "Đang mở cuộc trò chuyện",
  quickActions: "Thao tác nhanh",
  suggestions: {
    reminder: {
      label: "Đặt lời nhắc",
      prompt: "Nhắc tôi ",
    },
    ride: {
      label: "Nhờ đưa đón",
      prompt: "Hỏi gia đình tôi xem có ai có thể chở tôi đến cuộc hẹn vào ",
    },
    write: {
      label: "Viết cho gia đình",
      prompt: "Giúp tôi viết tin nhắn cho ",
    },
  },
  thinking: "Đang suy nghĩ…",
  title: "Hỏi LifeLink",
  titlePrefix: "Hỏi LifeLink: ",
  waitingConnection: "Đang chờ kết nối. Chưa gửi gì.",
  waitingForConnection: "Tin nhắn đang chờ kết nối",
  whatCanIHelp: "Hôm nay quý vị cần giúp gì?",
  youSaid: "Quý vị nói: ",
  yourConversation: "Cuộc trò chuyện của quý vị",
};

export { ask };
