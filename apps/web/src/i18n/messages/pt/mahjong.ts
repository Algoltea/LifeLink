import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "Ações do jogo",
  alreadyClear: "O tabuleiro já está vazio.",
  biggerScreen:
    "O Mahjong precisa de uma tela maior para que as peças sejam grandes o suficiente para tocar. Abra o LifeLink em um tablet ou computador para jogar.",
  blocked: {
    "boxed-in":
      "Essa peça está bloqueada dos dois lados. Escolha uma peça com o lado esquerdo ou direito livre.",
    covered:
      "Essa peça está coberta por outra. Remova primeiro as peças que estão sobre ela.",
    removed: "Essa peça já foi combinada.",
  },
  board: "Tabuleiro de peças",
  clearBoard:
    "O tabuleiro está vazio. Desfazer traz de volta o último par, ou você pode preparar outra partida.",
  cleared: (moves) =>
    `Você limpou o tabuleiro em ${moves} ${moves === 1 ? "jogada" : "jogadas"}.`,
  dealAgain: "Preparar outra partida",
  dealt: (layout) => `Nova partida preparada. Disposição: ${layout}.`,
  discarded:
    "Não foi possível abrir a partida salva. Uma nova partida foi preparada.",
  dragonTile: (dragon) => `Dragão: ${dragon}`,
  dragons: { green: "Verde", red: "Vermelho", white: "Branco" },
  earlier: "anteriormente",
  errors: {
    blocked: "Essa peça ainda não pode ser escolhida.",
    "cannot-shuffle":
      "Não foi possível embaralhar as peças. Tente desfazer uma jogada ou começar uma nova partida.",
    "invalid-index": "Não há nenhuma peça nessa posição.",
    "no-match": "Essas peças não combinam.",
    "nothing-to-shuffle": "Não há mais peças para embaralhar.",
    "nothing-to-undo": "Ainda não há jogadas para desfazer.",
    "same-tile": "Essa é a mesma peça. Escolha uma segunda peça.",
  },
  flowerTile: (flower) => `Flor: ${flower}`,
  flowers: {
    bamboo: "Bambu",
    chrysanthemum: "Crisântemo",
    orchid: "Orquídea",
    plum: "Ameixeira",
  },
  free: "Livre para escolher.",
  gestures:
    "Toque em uma peça para escolhê-la e depois toque na peça correspondente. Toque de novo na peça escolhida para desmarcá-la. Se não puder avançar, Dica mostra um par, Embaralhar reorganiza as peças restantes e Desfazer reverte sua última jogada. Toda partida pode ser concluída, inclusive após cada embaralhamento.",
  groups: {
    characters: {
      matches: "Números de 1 a 9. Combine duas peças com o mesmo número.",
      name: "Caracteres (萬)",
    },
    dragons: {
      matches:
        "Vermelho, Verde e Branco. Combine duas peças com o mesmo dragão.",
      name: "Dragões",
    },
    flowers: {
      matches:
        "Marcadas com 花 no canto. Qualquer flor combina com qualquer outra flor.",
      name: "Flores",
    },
    otherSuits: {
      matches: "Números de 1 a 9, apenas na disposição Clássica.",
      name: "Círculos (筒) e Bambu (條)",
    },
    seasons: {
      matches:
        "Marcadas com 季 no canto. Qualquer estação combina com qualquer outra estação.",
      name: "Estações",
    },
    winds: {
      matches:
        "Leste, Sul, Oeste e Norte. Combine duas peças com o mesmo vento.",
      name: "Ventos",
    },
  },
  guestSubtitle: "Um jogo tranquilo de peças. Não precisa de conta.",
  hint: "Dica",
  hintPair: (pair) => `Dica: combine ${pair}.`,
  howToPlay: "Como jogar",
  keyboard:
    "Use as teclas de seta para percorrer as peças livres. Pressione Enter para escolher uma peça e Esc para desmarcá-la.",
  layout: "Disposição",
  layoutLabel: (name) => `Disposição: ${name}`,
  layoutSetting: (next, current) =>
    `As novas partidas usarão a disposição ${next}. Esta partida mantém a disposição ${current}.`,
  layouts: { classic: "Clássica", easy: "Fácil" },
  matched: (pair, left) => `Par combinado: ${pair}. Peças restantes: ${left}.`,
  mismatch: (first, second) =>
    `${first} e ${second} não combinam. A peça ${second} foi selecionada em seu lugar.`,
  moves: (count) => `${count} ${count === 1 ? "jogada" : "jogadas"}`,
  newGame: "Nova partida",
  onDateAt: (date, time) => `em ${date} às ${time}`,
  pair: (first, second) => `${first} e ${second}`,
  picked: (name) =>
    `Peça escolhida: ${name}. Agora toque na peça correspondente.`,
  playSolitaire: "Jogar Paciência em vez disso",
  preparing: "Preparando as peças.",
  putDown: "Peça desmarcada. Nenhuma peça escolhida.",
  ready: "Uma nova partida está pronta. Escolha uma peça clara para começar.",
  resumed: (when) => `Partida retomada, salva ${when}.`,
  rules:
    "Limpe o tabuleiro combinando as peças em pares. Você só pode pegar uma peça livre: sem nada por cima e com o lado esquerdo ou direito livre. As peças livres são claras; as que ainda não podem ser escolhidas ficam apagadas.",
  saveFailed:
    "Este navegador não permite salvar a partida. Se fechar a página, você perderá seu progresso.",
  saved:
    "A partida é salva neste dispositivo após cada jogada, mesmo sem conexão com a internet.",
  scroll:
    "Role o tabuleiro para os lados se algumas peças não estiverem visíveis.",
  seasonTile: (season) => `Estação: ${season}`,
  seasons: {
    autumn: "Outono",
    spring: "Primavera",
    summer: "Verão",
    winter: "Inverno",
  },
  selected: "Selecionada.",
  shuffle: "Embaralhar",
  shuffled: "As peças restantes foram embaralhadas.",
  stillSelected: "A peça escolhida continua selecionada.",
  stuck: "Não há pares livres. Embaralhe as peças ou desfaça uma jogada.",
  subtitle: "Um jogo tranquilo de peças.",
  suggested: "Sugerida pela dica.",
  suitTile: (rank, suit) => `${rank} de ${suit}`,
  suits: { bamboo: "Bambu", characters: "Caracteres", dots: "Círculos" },
  tileGuide: "As peças",
  tilePosition: (name, layer, row, column) =>
    `${name}, camada ${layer}, linha ${row}, coluna ${column}.`,
  tiles: (count) => `${count} ${count === 1 ? "peça" : "peças"}`,
  tilesLeft: (left, total) => `Peças restantes: ${left} de ${total}`,
  title: "Mahjong",
  todayAt: (time) => `hoje às ${time}`,
  undo: "Desfazer",
  undone: "A última jogada foi desfeita.",
  wellPlayed: "Boa partida.",
  windTile: (wind) => `Vento: ${wind}`,
  winds: { east: "Leste", north: "Norte", south: "Sul", west: "Oeste" },
};

export { mahjong };
