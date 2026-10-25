import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "Thao tác trong trò chơi",
  alreadyClear: "Bàn đã được dọn hết rồi.",
  biggerScreen:
    "Mạt chược ghép cặp cần màn hình lớn hơn để các quân đủ lớn và dễ chạm. Hãy mở LifeLink trên máy tính bảng hoặc máy tính để chơi.",
  blocked: {
    "boxed-in":
      "Quân này bị chặn ở cả hai bên. Hãy chọn quân có bên trái hoặc bên phải còn trống.",
    covered:
      "Quân này bị một quân khác che lên. Hãy dọn các quân ở trên trước.",
    removed: "Quân này đã được ghép cặp và lấy khỏi bàn.",
  },
  board: "Bàn mạt chược",
  clearBoard:
    "Bàn đã được dọn hết. Hoàn tác để lấy lại cặp vừa ghép, hoặc bày ván khác.",
  cleared: (moves) => `Bạn đã dọn hết bàn sau ${moves} lượt.`,
  dealAgain: "Bày ván khác",
  dealt: (layout) => `Đã bày ván mới với bố cục ${layout}.`,
  discarded: "Không thể mở ván đã lưu nên một ván mới đã được bày.",
  dragonTile: (dragon) => `Quân ${dragon}`,
  dragons: { green: "Phát", red: "Trung", white: "Bạch" },
  earlier: "trước đó",
  errors: {
    blocked: "Chưa thể chọn quân này.",
    "cannot-shuffle":
      "Không thể xáo quân. Hãy thử hoàn tác hoặc bắt đầu ván mới.",
    "invalid-index": "Không có quân nào ở đó.",
    "no-match": "Các quân đó không ghép được với nhau.",
    "nothing-to-shuffle": "Không còn quân nào để xáo.",
    "nothing-to-undo": "Chưa có lượt nào để hoàn tác.",
    "same-tile": "Đó vẫn là cùng một quân. Hãy chọn thêm một quân khác.",
  },
  flowerTile: (flower) => `Hoa ${flower}`,
  flowers: { bamboo: "Trúc", chrysanthemum: "Cúc", orchid: "Lan", plum: "Mai" },
  free: "Có thể chọn.",
  gestures:
    "Chạm vào một quân để chọn, rồi chạm vào quân ghép được với nó. Chạm lại vào quân đã chọn để bỏ chọn. Nếu bị bí, Gợi ý sẽ chỉ một cặp, Xáo quân sẽ sắp xếp lại các quân còn lại và Hoàn tác sẽ quay lại lượt trước. Mọi ván chơi, kể cả sau mỗi lần xáo quân, đều có thể dọn hết.",
  groups: {
    characters: {
      matches: "Các số từ 1 đến 9. Ghép hai quân Vạn cùng số.",
      name: "Vạn (萬)",
    },
    dragons: {
      matches: "Trung, Phát và Bạch. Ghép hai quân tam nguyên giống nhau.",
      name: "Tam nguyên",
    },
    flowers: {
      matches:
        "Có chữ 花 ở góc. Bất kỳ hai quân hoa nào cũng ghép được với nhau.",
      name: "Hoa",
    },
    otherSuits: {
      matches: "Các số từ 1 đến 9, chỉ có trong bố cục Cổ điển.",
      name: "Đồng (筒) và Sách (條)",
    },
    seasons: {
      matches:
        "Có chữ 季 ở góc. Bất kỳ hai quân mùa nào cũng ghép được với nhau.",
      name: "Mùa",
    },
    winds: {
      matches: "Đông, Nam, Tây và Bắc. Ghép hai quân cùng hướng gió.",
      name: "Gió",
    },
  },
  guestSubtitle: "Một trò ghép quân thư giãn. Không cần tài khoản.",
  hint: "Gợi ý",
  hintPair: (pair) => `Gợi ý: ghép ${pair}.`,
  howToPlay: "Cách chơi",
  keyboard:
    "Dùng các phím mũi tên để di chuyển giữa các quân có thể chọn. Nhấn Enter để chọn một quân và Escape để bỏ chọn.",
  layout: "Bố cục",
  layoutLabel: (name) => `Bố cục ${name}`,
  layoutSetting: (next, current) =>
    `Ván mới sẽ dùng bố cục ${next}. Ván này vẫn giữ bố cục ${current}.`,
  layouts: { classic: "Cổ điển", easy: "Dễ" },
  matched: (pair, left) => `Đã ghép ${pair}. Còn ${left} quân.`,
  mismatch: (first, second) =>
    `${first} và ${second} không ghép được với nhau. Đã chuyển sang chọn ${second}.`,
  moves: (count) => `${count} lượt`,
  newGame: "Ván mới",
  onDateAt: (date, time) => `ngày ${date} lúc ${time}`,
  pair: (first, second) => `${first} và ${second}`,
  picked: (name) =>
    `Đã chọn ${name}. Giờ hãy chạm vào quân ghép được với quân đó.`,
  playSolitaire: "Chơi xếp bài thay thế",
  preparing: "Đang bày các quân.",
  putDown: "Đã bỏ chọn. Không có quân nào được chọn.",
  ready: "Ván mới đã sẵn sàng. Chọn một quân sáng để bắt đầu.",
  resumed: (when) => `Đã tiếp tục ván được lưu ${when}.`,
  rules:
    "Ghép các quân thành từng cặp để dọn hết bàn. Bạn chỉ có thể lấy quân không bị chặn: không có quân nào ở trên và có ít nhất một bên trái hoặc phải còn trống. Quân có thể chọn sẽ sáng; quân chưa thể lấy sẽ mờ đi.",
  saveFailed:
    "Trình duyệt này không cho phép lưu trò chơi. Tiến trình sẽ mất nếu bạn đóng trang này.",
  saved:
    "Ván chơi được lưu trên thiết bị này sau mỗi lượt, ngay cả khi không có kết nối mạng.",
  scroll: "Cuộn bàn sang ngang nếu có quân nằm ngoài màn hình.",
  seasonTile: (season) => `Mùa ${season}`,
  seasons: { autumn: "Thu", spring: "Xuân", summer: "Hạ", winter: "Đông" },
  selected: "Đã chọn.",
  shuffle: "Xáo quân",
  shuffled: "Đã xáo các quân còn lại.",
  stillSelected: "Quân bạn đã chọn vẫn đang được chọn.",
  stuck: "Không có cặp nào có thể chọn. Hãy xáo quân hoặc hoàn tác.",
  subtitle: "Một trò ghép quân thư giãn.",
  suggested: "Quân được gợi ý.",
  suitTile: (rank, suit) => `${rank} ${suit}`,
  suits: { bamboo: "Sách", characters: "Vạn", dots: "Đồng" },
  tileGuide: "Các quân mạt chược",
  tilePosition: (name, layer, row, column) =>
    `${name}, lớp ${layer}, hàng ${row}, cột ${column}.`,
  tiles: (count) => `${count} quân`,
  tilesLeft: (left, total) => `Còn ${left} trên ${total} quân`,
  title: "Mạt chược ghép cặp",
  todayAt: (time) => `hôm nay lúc ${time}`,
  undo: "Hoàn tác",
  undone: "Đã hoàn tác lượt vừa rồi.",
  wellPlayed: "Bạn chơi rất tốt.",
  windTile: (wind) => `Gió ${wind}`,
  winds: { east: "Đông", north: "Bắc", south: "Nam", west: "Tây" },
};

export { mahjong };
