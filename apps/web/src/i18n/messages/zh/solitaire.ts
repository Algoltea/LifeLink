import type { Messages } from "../en";

const solitaire: Messages["solitaire"] = {
  action: "作用",
  cardName: (rank: string, suit: string) => `${suit}${rank}`,
  cards: (count: number) => `${count} 张牌`,
  cardsAbove: (count: number) => `上面有 ${count} 张牌`,
  cardsBelow: (count: number) => `下面有 ${count} 张背面朝上的牌`,
  cardsPerDraw: "每次翻牌张数",
  chooseAnother: "请选择其他位置，或按 Escape 选择另一张牌。",
  columnCard: (card: string, index: number) => `${card}，第 ${index} 列`,
  columnEmpty: (index: number) => `第 ${index} 列，空列。这里只能放 K。`,
  dealAgain: "再发一局",
  dealt: (cards: string) => `已发新的一局，每次翻${cards}。`,
  discarded: (reason: string) =>
    `无法打开已保存的游戏，因此已发新的一局。${reason}`,
  draw: "翻牌",
  drawSetting: (next: string, current: string) =>
    `新的一局将每次翻${next}。本局仍每次翻${current}。`,
  drawWords: (count: number): string => (count === 1 ? "一张牌" : "三张牌"),
  drawing: (cards: string) => `每次翻${cards}`,
  earlier: "较早时",
  emptyColumn: "此列为空。这里只能放 K。",
  emptyFoundation: "此收牌区为空。请先放 A。",
  emptyWaste: "翻出牌堆为空。请先从牌库翻牌。",
  engineExact: {
    "A saved column is out of order.": "保存的一列牌顺序有误。",
    "A saved foundation is out of order.": "保存的一个收牌区顺序有误。",
    "Only a king can go into an empty column.": "空列只能放 K。",
    "Only one card at a time can go onto a foundation.":
      "每次只能向收牌区移动一张牌。",
    "That card can't go onto a foundation yet.": "这张牌暂时不能放入收牌区。",
    "That card can't go there: a foundation starts with an ace.":
      "这张牌不能放在这里：收牌区必须从 A 开始。",
    "That card is already there.": "这张牌已经在那里。",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "这张牌背面朝上。移开上面的牌就能翻开它。",
    "That foundation is empty.": "该收牌区为空。",
    "The saved draw setting is not 1 or 3.": "保存的每次翻牌张数不是 1 或 3。",
    "The saved game could not be read.": "无法读取已保存的游戏。",
    "The saved game does not hold exactly one full deck.":
      "已保存的游戏没有恰好包含一副完整的牌。",
    "The saved move counts are negative.": "保存的步数为负数。",
    "The saved move counts could not be read.": "无法读取保存的步数。",
    "The saved recycle limit could not be read.":
      "无法读取保存的牌库循环次数上限。",
    "The saved stock has a face-up card.": "保存的牌库中有一张正面朝上的牌。",
    "The saved table could not be read.": "无法读取保存的牌桌。",
    "The saved table is missing.": "缺少保存的牌桌。",
    "The saved waste pile has a face-down card.":
      "保存的翻出牌堆中有一张背面朝上的牌。",
    "The waste pile is empty. Draw from the stock first.":
      "翻出牌堆为空。请先从牌库翻牌。",
    "There are no cards left to draw.": "没有可以翻出的牌了。",
    "There is no card there.": "那里没有牌。",
    "There is no column there.": "那里没有牌列。",
    "There is no foundation there.": "那里没有收牌区。",
    "There is nothing to undo yet.": "目前没有可以撤销的操作。",
    "This is not a saved solitaire game.": "这不是已保存的纸牌接龙游戏。",
    "This save comes from a different version of the game.":
      "此存档来自不同版本的游戏。",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "这些牌不能一起移动：只有连续且红黑交替的牌组才能一起移动。",
    "Turned the waste pile over to make a new stock.":
      "已将翻出牌堆翻回，组成新的牌库。",
    "Undid the last move.": "已撤销上一步。",
    "You have already gone through the deck as many times as this game allows.":
      "您已达到本局允许的牌库循环次数上限。",
  },
  engineMoreCards: (count: string) => `及另外 ${count} 张牌`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `翻出了${card}。`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `翻出了 ${count} 张牌。最上面是${card}。`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `已将${card}移至第 ${index} 个收牌区。`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `已将${cards}移到${top}上。`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) => `已将${cards}移至第 ${index} 列（空列）。`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `牌列中的${card}上不能再放任何牌。`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `这张牌不能放在这里：需要一张${color === "red" ? "红色" : "黑色"}的${rank}。`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) => `这张牌不能放在这里：此收牌区用于${suit}。`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) => `这张牌不能放在这里：此收牌区从${card}开始。`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) => `此收牌区已完成：最后一张已是${card}。`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) => `这张牌不能放在这里：此收牌区需要${card}。`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `缺少${pile}。`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `${pile}中有一张无法读取的牌。`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `${pile}应有 ${count} 堆。`,
    ],
  ],
  engineRevealed: (card: string) => `翻开了${card}。`,
  engineUndoStep: (reason: string) => `一条撤销记录已损坏：${reason}`,
  engineWords: {
    ace: "A",
    columns: "牌列",
    foundations: "收牌区",
    jack: "J",
    king: "K",
    "next card": "下一张牌",
    pile: "牌堆",
    queen: "Q",
    stock: "牌库",
    "the card": "这张牌",
    "waste pile": "翻出牌堆",
  },
  faceDown: "这张牌背面朝上。移开上面的牌就能翻开它。",
  foundation: (index: number) => `第 ${index} 个收牌区。`,
  foundationCount: (count: number) => `收牌区已有 ${count} / 52 张牌`,
  foundationEmpty: (name: string, card: string) =>
    `${name}，为空。从${card}开始。`,
  foundationName: (suit: string) => `${suit}收牌区`,
  foundationTop: (name: string, card: string) => `${name}，最上面是${card}。`,
  gestures:
    "轻点一张牌选中它，再轻点要放置的位置。如果只有一个可放置的位置，轻点一次就会移动到那里。再次轻点已选中的牌，可将它送入收牌区；双击任何一张牌也有同样的作用。",
  guestIntro: "安静地玩一局。无需账号。",
  hint: "提示",
  hintDraw: "提示：从牌库翻牌。",
  hintMove: (source: string, target: string) =>
    `提示：移动${source}${target}。`,
  howToPlay: "怎么玩",
  intro: "安静地玩一局。",
  key: "按键",
  keyboard: "键盘按键",
  keys: [
    { action: "在牌堆和牌之间移动", keys: "方向键" },
    { action: "选中一张牌，或放下选中的牌", keys: "Enter 或空格键" },
    { action: "将选中的牌送入收牌区", keys: "在同一张牌上再次按 Enter" },
    { action: "放回选中的牌", keys: "Escape" },
    { action: "从牌库翻牌", keys: "D" },
    { action: "撤销上一步", keys: "U 或 Ctrl+Z" },
    { action: "显示提示", keys: "H" },
    { action: "将所有不影响后续操作的牌送入收牌区", keys: "F" },
  ],
  king: "K",
  moves: (count: number) => `${count} 步`,
  newGame: "新游戏",
  noMovesNote: "本局没有可移动的牌了。您可以撤销，或开始新的一局。",
  noSafeCards: "目前没有可以在不影响后续操作的情况下送入收牌区的牌。",
  noUsefulMoves: "没有有用的移动了。请尝试撤销，或开始新的一局。",
  nothingSelected: "尚未选中任何牌。",
  onto: (card: string) => `到${card}上`,
  putBack: "已放回牌。目前没有选中的牌。",
  ranks: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
  ready: "新的一局已准备好。选择一张牌开始。",
  resumed: "已继续上次的游戏。",
  resumedAt: (date: string) => `已继续您的游戏，保存时间为${date}。`,
  rules:
    "在四个标有花色的位置（♠ ♥ ♣ ♦），各自从 A 到 K 依次收牌。在七列牌中，将牌放在点数大一级、颜色不同的牌上，例如红色 7 放在黑色 8 上。空列只能放 K。无法继续时，从牌库翻牌。",
  safeCards: "将可安全收起的牌送入收牌区",
  saveFailed: "此浏览器不允许保存游戏，关闭页面后进度会丢失。",
  savedHint: "每走一步，游戏都会保存在此设备上，即使没有网络连接也一样。",
  savedOn: (day: string, time: string) => `${day} ${time}`,
  savedToday: (time: string) => `今天 ${time}`,
  scrollHint: "横向滚动牌桌可看到所有牌堆，或将手机横放以获得更多空间。",
  selected: "已选中。",
  selectedBlocked: (name: string) =>
    `已选中${name}。目前没有可放置的位置。请按 Escape 放回。`,
  selectedTargets: (name: string, count: number) =>
    `已选中${name}。可以放到 ${count} 个位置。请选择一个，或按 Escape。`,
  sentSafe: (count: number, names: string) =>
    `已将 ${count} 张牌送入收牌区：${names}。`,
  shuffling: "正在洗牌。",
  sourceWithCards: (name: string, count: number) =>
    `${name}及上面的 ${count} 张牌`,
  startFresh: "重新开始",
  stock: (cards: string) => `牌库，${cards}。按下翻牌。`,
  stockEmpty: "牌库为空。",
  stockRecycle: "牌库为空。按下可将翻出牌堆翻回牌库。",
  suggested: "提示建议的牌。",
  suits: { clubs: "梅花", diamonds: "方块", hearts: "红桃", spades: "黑桃" },
  table: "牌桌",
  target: "选中的牌可以放在这里。",
  thatCard: "那张牌",
  title: "纸牌接龙",
  toColumn: (index: number) => `到第 ${index} 列（空列）`,
  toFoundation: "到收牌区",
  undo: "撤销",
  waste: "翻出牌堆",
  wasteEmpty: "翻出牌堆为空。请从牌库翻牌。",
  wasteTop: (card: string) => `翻出牌堆，最上面是${card}。`,
  won: (moves: number) => `您用了 ${moves} 步获胜。`,
  wonNote: (moves: number) => `您用了 ${moves} 步获胜。玩得好。`,
};

export { solitaire };
