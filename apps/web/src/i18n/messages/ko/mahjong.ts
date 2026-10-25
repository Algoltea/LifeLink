import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "게임 기능",
  alreadyClear: "이미 모든 패를 없애셨습니다.",
  biggerScreen:
    "마작패를 누르기 편한 크기로 표시하려면 더 큰 화면이 필요합니다. 태블릿이나 컴퓨터에서 LifeLink를 열어 주세요.",
  blocked: {
    "boxed-in":
      "이 패는 양옆이 막혀 있습니다. 왼쪽이나 오른쪽이 비어 있는 패를 골라 주세요.",
    covered:
      "이 패 위에 다른 패가 놓여 있습니다. 위에 있는 패부터 없애 주세요.",
    removed: "이 패는 이미 짝을 맞춰 없앴습니다.",
  },
  board: "마작 게임판",
  clearBoard:
    "모든 패를 없애셨습니다. 되돌리기로 마지막 짝을 되살리거나 새 게임을 시작해 보세요.",
  cleared: (moves) => `${moves}번 만에 모든 패를 없애셨습니다.`,
  dealAgain: "새로 패 놓기",
  dealt: (layout) => `${layout} 배치로 새 게임을 시작했습니다.`,
  discarded: "저장된 게임을 열지 못해 새 게임을 시작했습니다.",
  dragonTile: (dragon) => `${dragon} 삼원패`,
  dragons: { green: "발", red: "중", white: "백" },
  earlier: "이전",
  errors: {
    blocked: "이 패는 아직 선택할 수 없습니다.",
    "cannot-shuffle":
      "패를 섞지 못했습니다. 되돌리거나 새 게임을 시작해 보세요.",
    "invalid-index": "그곳에는 패가 없습니다.",
    "no-match": "두 패의 짝이 맞지 않습니다.",
    "nothing-to-shuffle": "섞을 패가 남아 있지 않습니다.",
    "nothing-to-undo": "아직 되돌릴 진행이 없습니다.",
    "same-tile": "같은 패입니다. 다른 패를 하나 더 골라 주세요.",
  },
  flowerTile: (flower) => `${flower} 꽃패`,
  flowers: {
    bamboo: "대나무",
    chrysanthemum: "국화",
    orchid: "난초",
    plum: "매화",
  },
  free: "선택할 수 있습니다.",
  gestures:
    "패를 눌러 선택한 다음 짝이 맞는 패를 누르세요. 선택한 패를 다시 누르면 선택이 취소됩니다. 막히시면 힌트로 짝을 확인하고, 패 섞기로 남은 패를 다시 배치하거나, 되돌리기로 마지막 진행을 취소해 보세요. 모든 게임은 끝까지 풀 수 있으며, 패를 섞은 뒤에도 끝까지 풀 수 있습니다.",
  groups: {
    characters: {
      matches: "숫자는 1부터 9까지입니다. 숫자가 같은 만수패 두 개를 맞추세요.",
      name: "만수패 (萬)",
    },
    dragons: {
      matches: "중, 발, 백이 있습니다. 같은 삼원패 두 개를 맞추세요.",
      name: "삼원패",
    },
    flowers: {
      matches:
        "모서리에 花가 표시되어 있습니다. 종류와 관계없이 꽃패끼리 짝을 맞출 수 있습니다.",
      name: "꽃패",
    },
    otherSuits: {
      matches: "숫자는 1부터 9까지이며, 기본 배치에서만 나옵니다.",
      name: "통수패 (筒)와 삭수패 (條)",
    },
    seasons: {
      matches:
        "모서리에 季가 표시되어 있습니다. 종류와 관계없이 계절패끼리 짝을 맞출 수 있습니다.",
      name: "계절패",
    },
    winds: {
      matches: "동, 남, 서, 북이 있습니다. 방향이 같은 풍패 두 개를 맞추세요.",
      name: "풍패",
    },
  },
  guestSubtitle:
    "차분하게 즐기는 짝 맞추기 게임입니다. 계정 없이도 즐기실 수 있습니다.",
  hint: "힌트",
  hintPair: (pair) => `힌트: ${pair}, 이 두 패의 짝을 맞춰 보세요.`,
  howToPlay: "게임 방법",
  keyboard:
    "방향키로 선택할 수 있는 패 사이를 이동하세요. Enter를 누르면 패를 선택하고, Escape를 누르면 선택을 취소합니다.",
  layout: "배치",
  layoutLabel: (name) => `${name} 배치`,
  layoutSetting: (next, current) =>
    `새 게임에서는 ${next} 배치를 사용합니다. 이번 게임은 ${current} 배치를 유지합니다.`,
  layouts: { classic: "기본", easy: "쉬운" },
  matched: (pair, left) =>
    `짝을 맞췄습니다: ${pair}. 패가 ${left}개 남았습니다.`,
  mismatch: (first, second) =>
    `${first} 및 ${second}: 짝이 맞지 않습니다. 대신 ${second} 패를 선택했습니다.`,
  moves: (count) => `${count}번 진행`,
  newGame: "새 게임",
  onDateAt: (date, time) => `${date} ${time}`,
  pair: (first, second) => `${first} 및 ${second}`,
  picked: (name) => `선택한 패: ${name}. 이제 짝이 맞는 패를 눌러 주세요.`,
  playSolitaire: "대신 솔리테어 하기",
  preparing: "마작패를 놓고 있습니다.",
  putDown: "선택을 취소했습니다. 선택한 패가 없습니다.",
  ready: "새 게임이 준비되었습니다. 밝은 패를 골라 시작해 보세요.",
  resumed: (when) => `저장 시점: ${when}. 이 게임을 이어갑니다.`,
  rules:
    "패를 두 개씩 짝지어 모두 없애세요. 위에 다른 패가 없고 왼쪽이나 오른쪽이 비어 있는 패만 고르실 수 있습니다. 고를 수 있는 패는 밝게, 아직 고를 수 없는 패는 흐리게 표시됩니다.",
  saveFailed:
    "이 브라우저에서는 게임을 저장할 수 없습니다. 이 화면을 닫으시면 진행 상황이 사라집니다.",
  saved: "진행할 때마다 이 기기에 저장됩니다. 인터넷 연결이 없어도 저장됩니다.",
  scroll: "보이지 않는 패가 있다면 게임판을 옆으로 스크롤해 주세요.",
  seasonTile: (season) => `${season} 계절패`,
  seasons: { autumn: "가을", spring: "봄", summer: "여름", winter: "겨울" },
  selected: "선택됨.",
  shuffle: "패 섞기",
  shuffled: "남은 패를 섞었습니다.",
  stillSelected: "고르신 패가 아직 선택되어 있습니다.",
  stuck: "지금 맞출 수 있는 짝이 없습니다. 패를 섞거나 되돌려 보세요.",
  subtitle: "차분하게 즐기는 짝 맞추기 게임입니다.",
  suggested: "힌트에서 제안한 패입니다.",
  suitTile: (rank, suit) => `${suit} ${rank}`,
  suits: { bamboo: "삭수", characters: "만수", dots: "통수" },
  tileGuide: "마작패 알아보기",
  tilePosition: (name, layer, row, column) =>
    `${name}, ${layer}층, ${row}행, ${column}열.`,
  tiles: (count) => `${count}개`,
  tilesLeft: (left, total) => `전체 ${total}개 중 ${left}개 남음`,
  title: "마작 솔리테어",
  todayAt: (time) => `오늘 ${time}`,
  undo: "되돌리기",
  undone: "마지막 진행을 되돌렸습니다.",
  wellPlayed: "잘하셨습니다.",
  windTile: (wind) => `${wind}풍패`,
  winds: { east: "동", north: "북", south: "남", west: "서" },
};

export { mahjong };
