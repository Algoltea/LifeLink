import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `Giá lúc ${when}`,
  close: "Đóng",
  commodities: "Hàng hóa",
  dataFrom: "Dữ liệu thị trường từ ",
  delayed:
    "Giá có thể đã cũ tới 30 phút. Chỉ để tham khảo, không phải lời khuyên.",
  directions: { down: "giảm", flat: "không đổi", up: "tăng" },
  index: "Chỉ số",
  loading: "Đang tải giá hôm nay…",
  names: {
    coffee: "Cà phê",
    gold: "Vàng",
    oil: "Dầu thô",
    silver: "Bạc",
  },
  pause: "Tạm dừng giá đang chạy",
  play: "Chạy lại giá",
  showAll: ". Xem tất cả giá",
  stocks: "Cổ phiếu",
  title: "Thị trường",
  units: { barrel: "mỗi thùng", ounce: "mỗi ounce", pound: "mỗi pound" },
};

export { markets };
