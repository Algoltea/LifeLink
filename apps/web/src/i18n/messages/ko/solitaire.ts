import type { Messages } from "../en";

const solitaire: Messages["solitaire"] = {
  action: "기능",
  cardName: (rank, suit) => `${suit} ${rank}`,
  cards: (count) => `${count}장`,
  cardsAbove: (count) => `위에 카드 ${count}장`,
  cardsBelow: (count) => `아래에 뒤집힌 카드 ${count}장`,
  cardsPerDraw: "한 번에 뽑을 카드 수",
  chooseAnother:
    "다른 위치를 선택하시거나 Escape를 눌러 다른 카드를 골라 주세요.",
  columnCard: (card, index) => `${card}, ${index}번 줄`,
  columnEmpty: (index) =>
    `${index}번 줄은 비어 있습니다. 킹만 놓을 수 있습니다.`,
  dealAgain: "새로 카드 나누기",
  dealt: (cards) => `새 게임을 시작했습니다. 한 번에 ${cards}씩 뽑습니다.`,
  discarded: (reason) =>
    `저장된 게임을 열지 못해 새 게임을 시작했습니다. ${reason}`,
  draw: "뽑기",
  drawSetting: (next, current) =>
    `새 게임에서는 한 번에 ${next}씩 뽑습니다. 이번 게임은 계속 ${current}씩 뽑습니다.`,
  drawWords: (count) => (count === 1 ? "한 장" : "세 장"),
  drawing: (cards) => `한 번에 ${cards}씩 뽑기`,
  earlier: "이전에",
  emptyColumn: "이 줄은 비어 있습니다. 킹만 놓을 수 있습니다.",
  emptyFoundation: "이 완성 더미는 비어 있습니다. 에이스부터 놓으세요.",
  emptyWaste: "펼친 카드가 없습니다. 먼저 뽑을 더미에서 카드를 뽑으세요.",
  engineExact: {
    "A saved column is out of order.":
      "저장된 줄의 카드 순서가 올바르지 않습니다.",
    "A saved foundation is out of order.":
      "저장된 완성 더미의 카드 순서가 올바르지 않습니다.",
    "Only a king can go into an empty column.":
      "빈 줄에는 킹만 놓을 수 있습니다.",
    "Only one card at a time can go onto a foundation.":
      "완성 더미에는 한 번에 한 장만 놓을 수 있습니다.",
    "That card can't go onto a foundation yet.":
      "아직 완성 더미에 놓을 수 없는 카드입니다.",
    "That card can't go there: a foundation starts with an ace.":
      "그 카드는 여기에 놓을 수 없습니다. 완성 더미는 에이스부터 시작합니다.",
    "That card is already there.": "그 카드는 이미 그곳에 있습니다.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "뒤집힌 카드입니다. 위에 있는 카드를 옮기시면 앞면이 보입니다.",
    "That foundation is empty.": "그 완성 더미는 비어 있습니다.",
    "The saved draw setting is not 1 or 3.":
      "저장된 뽑기 설정이 1장 또는 3장이 아닙니다.",
    "The saved game could not be read.": "저장된 게임을 읽지 못했습니다.",
    "The saved game does not hold exactly one full deck.":
      "저장된 게임에 온전한 카드 한 벌이 들어 있지 않습니다.",
    "The saved move counts are negative.": "저장된 이동 횟수가 음수입니다.",
    "The saved move counts could not be read.":
      "저장된 이동 횟수를 읽지 못했습니다.",
    "The saved recycle limit could not be read.":
      "저장된 카드 재사용 횟수 제한을 읽지 못했습니다.",
    "The saved stock has a face-up card.":
      "저장된 뽑을 더미에 앞면이 보이는 카드가 있습니다.",
    "The saved table could not be read.": "저장된 카드판을 읽지 못했습니다.",
    "The saved table is missing.": "저장된 카드판이 없습니다.",
    "The saved waste pile has a face-down card.":
      "저장된 펼친 더미에 뒷면이 보이는 카드가 있습니다.",
    "The waste pile is empty. Draw from the stock first.":
      "펼친 카드가 없습니다. 먼저 뽑을 더미에서 카드를 뽑으세요.",
    "There are no cards left to draw.": "뽑을 카드가 남아 있지 않습니다.",
    "There is no card there.": "그곳에는 카드가 없습니다.",
    "There is no column there.": "그곳에는 줄이 없습니다.",
    "There is no foundation there.": "그곳에는 완성 더미가 없습니다.",
    "There is nothing to undo yet.": "아직 되돌릴 일이 없습니다.",
    "This is not a saved solitaire game.": "저장된 솔리테어 게임이 아닙니다.",
    "This save comes from a different version of the game.":
      "다른 버전의 게임에서 저장한 내용입니다.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "이 카드들은 함께 옮길 수 없습니다. 색이 번갈아 나오고 숫자가 연속된 카드만 함께 옮길 수 있습니다.",
    "Turned the waste pile over to make a new stock.":
      "펼친 더미를 뒤집어 새 뽑을 더미를 만들었습니다.",
    "Undid the last move.": "마지막 이동을 되돌렸습니다.",
    "You have already gone through the deck as many times as this game allows.":
      "이 게임에서 허용한 카드 반복 사용 횟수를 모두 쓰셨습니다.",
  },
  engineMoreCards: (count) => `및 카드 ${count}장 더`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `뽑은 카드: ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `${count}장을 뽑았습니다. 맨 위 카드: ${card}.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `${card} 카드를 ${index}번 완성 더미로 옮겼습니다.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `${cards} — ${top} 위로 옮겼습니다.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) => `${cards} — 빈 ${index}번 줄로 옮겼습니다.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `줄 안의 ${card} 위에는 카드를 놓을 수 없습니다.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `그 카드는 여기에 놓을 수 없습니다. ${color === "red" ? "빨간색" : "검은색"} ${rank} 카드가 필요합니다.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) =>
        `그 카드는 여기에 놓을 수 없습니다. 이 완성 더미는 ${suit} 전용입니다.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) =>
        `그 카드는 여기에 놓을 수 없습니다. 이 완성 더미는 ${card} 카드부터 시작합니다.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) => `그 완성 더미는 이미 ${card} 카드까지 완성되었습니다.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) =>
        `그 카드는 여기에 놓을 수 없습니다. 이 완성 더미에는 ${card} 카드가 필요합니다.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `${pile} 정보가 없습니다.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `${pile} 안에 읽을 수 없는 카드가 있습니다.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `${pile} 안에는 더미 ${count}개가 있어야 합니다.`,
    ],
  ],
  engineRevealed: (card) => ` 앞면으로 뒤집은 카드: ${card}.`,
  engineUndoStep: (reason) => `되돌리기 단계가 손상되었습니다: ${reason}`,
  engineWords: {
    ace: "에이스",
    columns: "줄",
    foundations: "완성 더미",
    jack: "잭",
    king: "킹",
    "next card": "다음 카드",
    pile: "더미",
    queen: "퀸",
    stock: "뽑을 더미",
    "the card": "해당 카드",
    "waste pile": "펼친 더미",
  },
  faceDown: "뒤집힌 카드입니다. 위에 있는 카드를 옮기시면 앞면이 보입니다.",
  foundation: (index) => `${index}번 완성 더미.`,
  foundationCount: (count) => `완성 더미에 전체 52장 중 ${count}장`,
  foundationEmpty: (name, card) =>
    `${name}, 비어 있습니다. ${card} 카드부터 시작합니다.`,
  foundationName: (suit) => `${suit} 완성 더미`,
  foundationTop: (name, card) => `${name}, 맨 위 카드: ${card}.`,
  gestures:
    "카드를 눌러 선택한 다음 옮길 곳을 누르세요. 갈 수 있는 곳이 하나뿐이면 한 번 누르기만 해도 옮겨집니다. 선택한 카드를 다시 누르시면 완성 더미로 보냅니다. 어떤 카드든 두 번 누르시면 같은 동작을 합니다.",
  guestIntro: "차분히 즐기는 게임입니다. 계정이 없어도 됩니다.",
  hint: "힌트",
  hintDraw: "힌트: 뽑을 더미에서 카드를 뽑으세요.",
  hintMove: (source, target) => `힌트: ${source} — ${target} 옮기세요.`,
  howToPlay: "게임 방법",
  intro: "차분히 즐기는 게임입니다.",
  key: "키",
  keyboard: "키보드 조작",
  keys: [
    { action: "더미와 카드 사이 이동", keys: "방향키" },
    {
      action: "카드 선택 또는 선택한 카드 놓기",
      keys: "Enter 또는 스페이스바",
    },
    {
      action: "선택한 카드를 완성 더미로 보내기",
      keys: "같은 카드에서 Enter 다시 누르기",
    },
    { action: "카드 선택 취소", keys: "Escape" },
    { action: "뽑을 더미에서 뽑기", keys: "D" },
    { action: "마지막 이동 되돌리기", keys: "U 또는 Ctrl+Z" },
    { action: "힌트 보기", keys: "H" },
    { action: "진행에 지장 없는 카드를 모두 완성 더미로 보내기", keys: "F" },
  ],
  king: "킹",
  moves: (count) => `이동 ${count}번`,
  newGame: "새 게임",
  noMovesNote:
    " 이번 게임에서는 더 옮길 수 없습니다. 되돌리거나 새 게임을 시작하셔도 됩니다.",
  noSafeCards:
    "지금은 진행에 지장 없이 완성 더미로 보낼 수 있는 카드가 없습니다.",
  noUsefulMoves:
    "도움이 될 이동이 남아 있지 않습니다. 되돌리거나 새 게임을 시작해 보세요.",
  nothingSelected: "선택한 카드가 없습니다.",
  onto: (card) => `${card} 위로`,
  putBack: "카드를 제자리에 놓았습니다. 선택한 카드가 없습니다.",
  ranks: [
    "에이스",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "잭",
    "퀸",
    "킹",
  ],
  ready: "새 게임이 준비되었습니다. 카드를 골라 시작해 보세요.",
  resumed: "지난 게임을 이어갑니다.",
  resumedAt: (date) => `${date}에 저장한 게임을 이어갑니다.`,
  rules:
    "무늬가 표시된 네 자리 (♠ ♥ ♣ ♦)에 에이스부터 킹까지 같은 무늬로 쌓으세요. 일곱 줄에서는 숫자가 하나 크고 색이 다른 카드 위에 놓습니다. 예를 들어 빨간 7은 검은 8 위에 놓습니다. 빈 줄에는 킹만 놓을 수 있습니다. 막히시면 뽑을 더미에서 카드를 뽑으세요.",
  safeCards: "진행에 지장 없는 카드 완성 더미로 보내기",
  saveFailed:
    "이 브라우저에서는 게임을 저장할 수 없습니다. 이 화면을 닫으시면 진행 상황이 사라집니다.",
  savedHint:
    "카드를 옮길 때마다 이 기기에 저장됩니다. 인터넷 연결이 없어도 저장됩니다.",
  savedOn: (day, time) => `${day} ${time}`,
  savedToday: (time) => `오늘 ${time}`,
  scrollHint:
    "모든 더미를 보시려면 카드판을 옆으로 스크롤하거나 전화기를 가로로 돌려 주세요.",
  selected: " 선택됨.",
  selectedBlocked: (name) =>
    `선택한 카드: ${name}. 지금은 옮길 곳이 없습니다. 선택을 취소하시려면 Escape를 누르세요.`,
  selectedTargets: (name, count) =>
    `선택한 카드: ${name}. 갈 수 있는 곳이 ${count}군데입니다. 한 곳을 선택하시거나 Escape를 누르세요.`,
  sentSafe: (count, names) =>
    `카드 ${count}장을 완성 더미로 보냈습니다: ${names}.`,
  shuffling: "카드를 섞고 있습니다.",
  sourceWithCards: (name, count) => `${name} 및 그 위의 카드 ${count}장`,
  startFresh: "처음부터 시작",
  stock: (cards) => `뽑을 더미, ${cards}. 누르시면 뽑습니다.`,
  stockEmpty: "뽑을 더미가 비어 있습니다.",
  stockRecycle: "뽑을 더미가 비어 있습니다. 누르시면 펼친 더미를 뒤집습니다.",
  suggested: " 힌트에서 제안한 카드입니다.",
  suits: {
    clubs: "클로버",
    diamonds: "다이아몬드",
    hearts: "하트",
    spades: "스페이드",
  },
  table: "카드판",
  target: " 선택한 카드를 여기에 놓을 수 있습니다.",
  thatCard: "해당 카드",
  title: "솔리테어",
  toColumn: (index) => `빈 ${index}번 줄로`,
  toFoundation: "완성 더미로",
  undo: "되돌리기",
  waste: "펼친 더미",
  wasteEmpty: "펼친 더미가 비어 있습니다. 뽑을 더미에서 뽑으세요.",
  wasteTop: (card) => `펼친 더미, 맨 위 카드: ${card}.`,
  won: (moves) => `${moves}번 옮겨서 성공하셨습니다.`,
  wonNote: (moves) => ` ${moves}번 옮겨서 성공하셨습니다. 잘하셨습니다.`,
};

export { solitaire };
