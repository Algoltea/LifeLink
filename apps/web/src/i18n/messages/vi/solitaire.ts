import type { Messages } from "../en";

const solitaire: Messages["solitaire"] = {
  action: "Chức năng",
  cardName: (rank, suit) => `${rank} ${suit}`,
  cards: (count) => `${count} lá bài`,
  cardsAbove: (count) => `${count} lá bài ở trên`,
  cardsBelow: (count) => `${count} lá bài úp ở dưới`,
  cardsPerDraw: "Số lá mỗi lần rút",
  chooseAnother: "Chọn vị trí khác hoặc nhấn Escape để chọn lá khác.",
  columnCard: (card, index) => `${card}, cột ${index}`,
  columnEmpty: (index) => `Cột ${index}, trống. Chỉ lá già được đặt ở đây.`,
  dealAgain: "Chia ván khác",
  dealt: (cards) => `Đã chia ván mới, mỗi lần rút ${cards}.`,
  discarded: (reason) =>
    `Không mở được ván đã lưu nên đã chia ván mới. ${reason}`,
  draw: "Rút bài",
  drawSetting: (next, current) =>
    `Ván mới sẽ rút ${next} mỗi lần. Ván này vẫn rút ${current}.`,
  drawWords: (count) => (count === 1 ? "một lá" : "ba lá"),
  drawing: (cards) => `Rút ${cards} mỗi lần`,
  earlier: "trước đó",
  emptyColumn: "Cột này trống. Chỉ lá già được đặt ở đây.",
  emptyFoundation: "Ô đích này trống. Đặt lá át trước.",
  emptyWaste: "Chồng bài đã rút trống. Hãy rút từ chồng bài úp trước.",
  engineExact: {
    "A saved column is out of order.": "Một cột đã lưu không đúng thứ tự.",
    "A saved foundation is out of order.":
      "Một ô đích đã lưu không đúng thứ tự.",
    "Only a king can go into an empty column.":
      "Chỉ lá già được đặt vào cột trống.",
    "Only one card at a time can go onto a foundation.":
      "Chỉ được đặt một lá mỗi lần vào ô đích.",
    "That card can't go onto a foundation yet.":
      "Lá đó chưa thể đặt vào ô đích.",
    "That card can't go there: a foundation starts with an ace.":
      "Không đặt được lá đó ở đây: ô đích bắt đầu bằng lá át.",
    "That card is already there.": "Lá đó đã ở đó rồi.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "Lá đó đang úp. Di chuyển các lá phía trên để lật nó.",
    "That foundation is empty.": "Ô đích đó trống.",
    "The saved draw setting is not 1 or 3.":
      "Số lá rút đã lưu không phải 1 hoặc 3.",
    "The saved game could not be read.": "Không đọc được ván đã lưu.",
    "The saved game does not hold exactly one full deck.":
      "Ván đã lưu không chứa đúng một bộ bài đầy đủ.",
    "The saved move counts are negative.": "Số nước đi đã lưu là số âm.",
    "The saved move counts could not be read.":
      "Không đọc được số nước đi đã lưu.",
    "The saved recycle limit could not be read.":
      "Không đọc được giới hạn lật lại bài đã lưu.",
    "The saved stock has a face-up card.": "Chồng bài úp đã lưu có lá ngửa.",
    "The saved table could not be read.": "Không đọc được bàn bài đã lưu.",
    "The saved table is missing.": "Thiếu bàn bài đã lưu.",
    "The saved waste pile has a face-down card.":
      "Chồng bài đã rút được lưu có lá úp.",
    "The waste pile is empty. Draw from the stock first.":
      "Chồng bài đã rút trống. Hãy rút từ chồng bài úp trước.",
    "There are no cards left to draw.": "Không còn lá nào để rút.",
    "There is no card there.": "Không có lá bài ở đó.",
    "There is no column there.": "Không có cột ở đó.",
    "There is no foundation there.": "Không có ô đích ở đó.",
    "There is nothing to undo yet.": "Chưa có gì để hoàn tác.",
    "This is not a saved solitaire game.":
      "Đây không phải ván Solitaire đã lưu.",
    "This save comes from a different version of the game.":
      "Bản lưu này từ phiên bản trò chơi khác.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "Không chuyển cùng lúc các lá đó được: chỉ một dãy liên tục xen kẽ màu mới chuyển cùng nhóm được.",
    "Turned the waste pile over to make a new stock.":
      "Đã lật chồng bài đã rút để tạo chồng bài úp mới.",
    "Undid the last move.": "Đã hoàn tác nước đi cuối.",
    "You have already gone through the deck as many times as this game allows.":
      "Quý vị đã rút hết bộ bài đủ số lần ván này cho phép.",
  },
  engineMoreCards: (count) => `và ${count} lá nữa`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `Đã rút ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `Đã rút ${count} lá. ${card} ở trên cùng.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `Đã chuyển ${card} về ô đích ${index}.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `Đã chuyển ${cards} lên ${top}.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) => `Đã chuyển ${cards} vào cột trống ${index}.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `Không thể đặt lá nào lên ${card} trong một cột.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `Không đặt được lá đó ở đây: cần ${rank} ${color === "red" ? "đỏ" : "đen"}.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) => `Không đặt được lá đó ở đây: ô đích này dành cho ${suit}.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) => `Không đặt được lá đó ở đây: ô đích này bắt đầu bằng ${card}.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) => `Ô đích này đã hoàn tất: kết thúc bằng ${card}.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) => `Không đặt được lá đó ở đây: ô đích này cần ${card}.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `Thiếu ${pile}.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `${pile} có lá bài không đọc được.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `${pile} phải có ${count} chồng.`,
    ],
  ],
  engineRevealed: (card) => ` Đã lật ${card}.`,
  engineUndoStep: (reason) => `Một bước hoàn tác bị hỏng: ${reason}`,
  engineWords: {
    ace: "át",
    columns: "các cột",
    foundations: "các ô đích",
    jack: "bồi",
    king: "già",
    "next card": "lá tiếp theo",
    pile: "chồng bài",
    queen: "đầm",
    stock: "chồng bài úp",
    "the card": "lá bài",
    "waste pile": "chồng bài đã rút",
  },
  faceDown: "Lá đó đang úp. Di chuyển các lá phía trên để lật nó.",
  foundation: (index) => `Ô đích ${index}.`,
  foundationCount: (count) => `${count} trên 52 lá ở ô đích`,
  foundationEmpty: (name, card) => `${name}, trống. Bắt đầu bằng ${card}.`,
  foundationName: (suit) => `Ô đích ${suit}`,
  foundationTop: (name, card) => `${name}, ${card} ở trên cùng.`,
  gestures:
    "Chạm một lá để chọn rồi chạm nơi muốn đặt. Nếu chỉ có một nơi để đặt, chạm một lần sẽ di chuyển lá đó. Chạm lại lá đã chọn để đưa về ô đích, hoặc chạm hai lần vào bất kỳ lá nào để làm tương tự.",
  guestIntro: "Trò chơi thư giãn. Không cần tài khoản.",
  hint: "Gợi ý",
  hintDraw: "Gợi ý: rút từ chồng bài úp.",
  hintMove: (source, target) => `Gợi ý: chuyển ${source} ${target}.`,
  howToPlay: "Cách chơi",
  intro: "Trò chơi thư giãn.",
  key: "Phím",
  keyboard: "Phím bàn phím",
  keys: [
    {
      action: "Di chuyển giữa chồng bài và lá bài",
      keys: "Các phím mũi tên",
    },
    {
      action: "Chọn lá bài hoặc đặt lá đã chọn xuống",
      keys: "Enter hoặc phím cách",
    },
    {
      action: "Đưa lá đã chọn về ô đích",
      keys: "Nhấn Enter lần nữa trên cùng lá",
    },
    {
      action: "Đặt lá bài lại chỗ cũ",
      keys: "Escape",
    },
    {
      action: "Rút từ chồng bài úp",
      keys: "D",
    },
    {
      action: "Hoàn tác nước đi cuối",
      keys: "U hoặc Ctrl+Z",
    },
    {
      action: "Hiện gợi ý",
      keys: "H",
    },
    {
      action: "Đưa mọi lá an toàn về ô đích",
      keys: "F",
    },
  ],
  king: "Già",
  moves: (count) => `${count} nước đi`,
  newGame: "Ván mới",
  noMovesNote:
    " Không còn nước đi trong ván này. Quý vị có thể hoàn tác hoặc bắt đầu ván mới.",
  noSafeCards: "Hiện không có lá nào an toàn để đưa về ô đích.",
  noUsefulMoves:
    "Không còn nước đi hữu ích. Thử hoàn tác hoặc bắt đầu ván mới.",
  nothingSelected: "Chưa chọn gì.",
  onto: (card) => `lên ${card}`,
  putBack: "Đã đặt lá bài lại. Chưa chọn gì.",
  ranks: [
    "át",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "bồi",
    "đầm",
    "già",
  ],
  ready: "Ván mới đã sẵn sàng. Chọn một lá để bắt đầu.",
  resumed: "Đã tiếp tục ván trước.",
  resumedAt: (date) => `Đã tiếp tục ván lưu ${date}.`,
  rules:
    "Xếp bốn chồng từ át đến già vào ô có ký hiệu chất tương ứng (♠ ♥ ♣ ♦). Trong bảy cột, đặt một lá lên lá lớn hơn một bậc và khác màu: 7 đỏ lên 8 đen. Chỉ lá già được đặt vào cột trống. Rút từ chồng bài úp khi hết nước đi.",
  safeCards: "Đưa lá an toàn về ô đích",
  saveFailed:
    "Trình duyệt không cho lưu ván chơi, nên tiến độ sẽ mất nếu quý vị đóng trang.",
  savedHint:
    "Ván chơi được lưu trên thiết bị sau mỗi nước đi, kể cả khi không có internet.",
  savedOn: (day, time) => `vào ${day} lúc ${time}`,
  savedToday: (time) => `hôm nay lúc ${time}`,
  scrollHint:
    "Cuộn ngang bàn để đến mọi chồng bài hoặc xoay ngang điện thoại cho rộng hơn.",
  selected: " Đã chọn.",
  selectedBlocked: (name) =>
    `Đã chọn ${name}. Hiện chưa có chỗ đặt. Nhấn Escape để trả lại.`,
  selectedTargets: (name, count) =>
    `Đã chọn ${name}. Có thể đặt ở ${count} vị trí. Chọn một nơi hoặc nhấn Escape.`,
  sentSafe: (count, names) => `Đã đưa ${count} lá về ô đích: ${names}.`,
  shuffling: "Đang xáo bài.",
  sourceWithCards: (name, count) => `${name} và ${count} lá phía trên`,
  startFresh: "Bắt đầu ván mới",
  stock: (cards) => `Chồng bài úp, ${cards}. Nhấn để rút.`,
  stockEmpty: "Chồng bài úp đã hết.",
  stockRecycle: "Chồng bài úp đã hết. Nhấn để lật chồng bài đã rút.",
  suggested: " Được đề xuất trong gợi ý.",
  suits: {
    clubs: "tép",
    diamonds: "rô",
    hearts: "cơ",
    spades: "bích",
  },
  table: "Bàn bài",
  target: " Lá đã chọn có thể đặt ở đây.",
  thatCard: "lá đó",
  title: "Solitaire",
  toColumn: (index) => `vào cột trống ${index}`,
  toFoundation: "về ô đích",
  undo: "Hoàn tác",
  waste: "Bài đã rút",
  wasteEmpty: "Chồng bài đã rút trống. Rút từ chồng bài úp.",
  wasteTop: (card) => `Chồng bài đã rút, ${card} ở trên.`,
  won: (moves) => `Quý vị thắng sau ${moves} nước đi.`,
  wonNote: (moves) => ` Quý vị thắng sau ${moves} nước đi. Chơi rất tốt.`,
};

export { solitaire };
