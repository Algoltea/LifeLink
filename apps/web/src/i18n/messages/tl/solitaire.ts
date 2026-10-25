import type { Messages } from "../en";

const solitaire: Messages["solitaire"] = {
  action: "Gagawin",
  cardName: (rank, suit) => `${rank} ng ${suit}`,
  cards: (count) => `${count} baraha`,
  cardsAbove: (count) => `${count} baraha sa ibabaw nito`,
  cardsBelow: (count) => `${count} nakataob na baraha sa ilalim nito`,
  cardsPerDraw: "Baraha sa bawat bunot",
  chooseAnother:
    "Pumili ng ibang lugar, o pindutin ang Escape para pumili ng ibang baraha.",
  columnCard: (card, index) => `${card}, hanay ${index}`,
  columnEmpty: (index) =>
    `Hanay ${index}, walang laman. Hari lang ang maaaring ilagay dito.`,
  dealAgain: "Mamahagi ng bagong laro",
  dealt: (cards) => `Namahagi ng bagong laro, ${cards} bawat bunot.`,
  discarded: (reason) =>
    `Hindi mabuksan ang naka-save na laro, kaya namahagi ng bago. ${reason}`,
  draw: "Bumunot",
  drawSetting: (next, current) =>
    `${next} bawat bunot sa mga bagong laro. Sa larong ito, ${current} pa rin.`,
  drawWords: (count) => (count === 1 ? "isang baraha" : "tatlong baraha"),
  drawing: (cards) => `${cards} bawat bunot`,
  earlier: "mas maaga",
  emptyColumn:
    "Walang laman ang hanay na ito. Hari lang ang maaaring ilagay dito.",
  emptyFoundation: "Walang laman ang pundasyong ito. Alas muna ang ilalagay.",
  emptyWaste:
    "Walang laman ang tumpok ng nabunot. Bumunot muna sa tumpok ng bunutan.",
  engineExact: {
    "A saved column is out of order.":
      "Hindi tama ang ayos ng naka-save na hanay.",
    "A saved foundation is out of order.":
      "Hindi tama ang ayos ng naka-save na pundasyon.",
    "Only a king can go into an empty column.":
      "Hari lang ang maaaring ilagay sa walang lamang hanay.",
    "Only one card at a time can go onto a foundation.":
      "Isang baraha lang bawat pagkakataon ang mailalagay sa pundasyon.",
    "That card can't go onto a foundation yet.":
      "Hindi pa maaaring ilagay sa pundasyon ang barahang iyon.",
    "That card can't go there: a foundation starts with an ace.":
      "Hindi maaaring ilagay ang barahang iyon dito: nagsisimula sa alas ang pundasyon.",
    "That card is already there.": "Nandoon na ang barahang iyon.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "Nakataob ang barahang iyon. Ilipat ang mga baraha sa ibabaw para maibalik ito nang nakaharap.",
    "That foundation is empty.": "Walang laman ang pundasyong iyon.",
    "The saved draw setting is not 1 or 3.":
      "Hindi 1 o 3 ang naka-save na dami ng bunot.",
    "The saved game could not be read.": "Hindi mabasa ang naka-save na laro.",
    "The saved game does not hold exactly one full deck.":
      "Hindi eksaktong isang buong deck ang nasa naka-save na laro.",
    "The saved move counts are negative.":
      "Negatibo ang naka-save na bilang ng galaw.",
    "The saved move counts could not be read.":
      "Hindi mabasa ang naka-save na bilang ng galaw.",
    "The saved recycle limit could not be read.":
      "Hindi mabasa ang naka-save na limitasyon sa pagbalik ng bunutan.",
    "The saved stock has a face-up card.":
      "May nakaharap na baraha ang naka-save na bunutan.",
    "The saved table could not be read.": "Hindi mabasa ang naka-save na mesa.",
    "The saved table is missing.": "Nawawala ang naka-save na mesa.",
    "The saved waste pile has a face-down card.":
      "May nakataob na baraha ang naka-save na tumpok ng nabunot.",
    "The waste pile is empty. Draw from the stock first.":
      "Walang laman ang tumpok ng nabunot. Bumunot muna sa tumpok ng bunutan.",
    "There are no cards left to draw.": "Wala nang barahang mabubunot.",
    "There is no card there.": "Walang baraha roon.",
    "There is no column there.": "Walang hanay roon.",
    "There is no foundation there.": "Walang pundasyon roon.",
    "There is nothing to undo yet.": "Wala pang maaaring i-undo.",
    "This is not a saved solitaire game.":
      "Hindi ito naka-save na larong Solitaire.",
    "This save comes from a different version of the game.":
      "Galing sa ibang bersyon ng laro ang naka-save na ito.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "Hindi maililipat nang sabay ang mga barahang iyon: tuloy-tuloy na hanay na salit-salitan ang kulay lang ang maililipat bilang grupo.",
    "Turned the waste pile over to make a new stock.":
      "Ibinaligtad ang tumpok ng nabunot para gumawa ng bagong bunutan.",
    "Undid the last move.": "Na-undo ang huling galaw.",
    "You have already gone through the deck as many times as this game allows.":
      "Naikot na ninyo ang deck nang pinakamaraming beses na pinapayagan ng larong ito.",
  },
  engineMoreCards: (count) => `at ${count} pang baraha`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `Nabunot ang ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `Bumunot ng ${count} baraha. Nasa ibabaw ang ${card}.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `Inilipat ang ${card} sa pundasyon ${index}.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `Inilipat ang ${cards} sa ibabaw ng ${top}.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) =>
        `Inilipat ang ${cards} sa walang lamang hanay ${index}.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `Walang maaaring ilagay sa ibabaw ng ${card} sa isang hanay.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `Hindi maaaring ilagay ang barahang iyon dito: kailangan ng ${rank} na ${color === "red" ? "pula" : "itim"}.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) =>
        `Hindi maaaring ilagay ang barahang iyon dito: para sa ${suit} ang pundasyong ito.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) =>
        `Hindi maaaring ilagay ang barahang iyon dito: nagsisimula sa ${card} ang pundasyong ito.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) => `Kumpleto na ang pundasyong iyon: nagtatapos na sa ${card}.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) =>
        `Hindi maaaring ilagay ang barahang iyon dito: kailangan ng pundasyong ito ang ${card}.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `Nawawala ang ${pile}.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `May barahang hindi mabasa sa ${pile}.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `Dapat may ${count} tumpok ang ${pile}.`,
    ],
  ],
  engineRevealed: (card) => ` Ibinaligtad ang ${card}.`,
  engineUndoStep: (reason) => `May sirang hakbang sa pag-undo: ${reason}`,
  engineWords: {
    ace: "alas",
    columns: "mga hanay",
    foundations: "mga pundasyon",
    jack: "sota",
    king: "hari",
    "next card": "susunod na baraha",
    pile: "tumpok",
    queen: "reyna",
    stock: "bunutan",
    "the card": "baraha",
    "waste pile": "tumpok ng nabunot",
  },
  faceDown:
    "Nakataob ang barahang iyon. Ilipat ang mga baraha sa ibabaw para maibalik ito nang nakaharap.",
  foundation: (index) => `Pundasyon ${index}.`,
  foundationCount: (count) => `${count} sa 52 baraha ang nasa mga pundasyon`,
  foundationEmpty: (name, card) =>
    `${name}, walang laman. Nagsisimula sa ${card}.`,
  foundationName: (suit) => `Pundasyon ng ${suit}`,
  foundationTop: (name, card) => `${name}, ${card} sa ibabaw.`,
  gestures:
    "Pindutin ang baraha para piliin, saka pindutin ang paglilipatan. Kung iisa lang ang puwedeng puntahan, isang pindot lang ang kailangan. Pindutin ulit ang napiling baraha para dalhin sa pundasyon, o pindutin nang dalawang beses ang alinmang baraha para gawin iyon.",
  guestIntro: "Isang tahimik na laro. Hindi kailangan ng account.",
  hint: "Pahiwatig",
  hintDraw: "Pahiwatig: bumunot sa tumpok ng bunutan.",
  hintMove: (source, target) => `Pahiwatig: ilipat ang ${source} ${target}.`,
  howToPlay: "Paano maglaro",
  intro: "Isang tahimik na laro.",
  key: "Key",
  keyboard: "Mga key sa keyboard",
  keys: [
    {
      action: "Lumipat sa pagitan ng mga tumpok at baraha",
      keys: "Mga arrow key",
    },
    {
      action: "Piliin ang baraha o ibaba ang napili",
      keys: "Enter o Space",
    },
    {
      action: "Dalhin ang napiling baraha sa pundasyon",
      keys: "Enter ulit sa parehong baraha",
    },
    {
      action: "Ibalik ang baraha",
      keys: "Escape",
    },
    {
      action: "Bumunot sa tumpok ng bunutan",
      keys: "D",
    },
    {
      action: "I-undo ang huling galaw",
      keys: "U o Ctrl+Z",
    },
    {
      action: "Magpakita ng pahiwatig",
      keys: "H",
    },
    {
      action: "Dalhin ang lahat ng ligtas na baraha sa mga pundasyon",
      keys: "F",
    },
  ],
  king: "Hari",
  moves: (count) => `${count} galaw`,
  newGame: "Bagong laro",
  noMovesNote:
    " Wala nang magagalaw sa larong ito. Maaari kayong mag-undo o magsimula ng bagong laro.",
  noSafeCards: "Walang barahang ligtas dalhin sa mga pundasyon ngayon.",
  noUsefulMoves:
    "Wala nang kapaki-pakinabang na galaw. Subukang mag-undo o magsimula ng bagong laro.",
  nothingSelected: "Walang napili.",
  onto: (card) => `sa ibabaw ng ${card}`,
  putBack: "Ibinalik ang baraha. Walang napili.",
  ranks: [
    "alas",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "sota",
    "reyna",
    "hari",
  ],
  ready: "Handa na ang bagong laro. Pumili ng baraha para magsimula.",
  resumed: "Ipinagpatuloy ang huli ninyong laro.",
  resumedAt: (date) => `Ipinagpatuloy ang larong na-save ${date}.`,
  rules:
    "Bumuo ng apat na tumpok mula alas hanggang hari sa puwestong may katugmang simbolo (♠ ♥ ♣ ♦). Sa pitong hanay, ilagay ang baraha sa isang mas mataas nang isa at ibang kulay: pulang 7 sa itim na 8. Hari lang ang mailalagay sa walang lamang hanay. Bumunot sa tumpok ng bunutan kapag wala nang malipatan.",
  safeCards: "Dalhin sa pundasyon ang mga ligtas na baraha",
  saveFailed:
    "Hindi pinapayagan ng browser na i-save ang laro, kaya mawawala ang inyong pag-usad kapag isinara ang pahina.",
  savedHint:
    "Nase-save ang laro sa device na ito pagkatapos ng bawat galaw, kahit walang internet.",
  savedOn: (day, time) => `noong ${day}, ${time}`,
  savedToday: (time) => `ngayon, ${time}`,
  scrollHint:
    "I-scroll nang pahalang ang mesa para maabot ang bawat tumpok, o ipahiga ang telepono para mas maluwag.",
  selected: " Napili.",
  selectedBlocked: (name) =>
    `Napili ang ${name}. Wala itong malipatan ngayon. Pindutin ang Escape para ibalik.`,
  selectedTargets: (name, count) =>
    `Napili ang ${name}. May ${count} puwedeng lipatan. Pumili ng isa, o pindutin ang Escape.`,
  sentSafe: (count, names) =>
    `Dinala ang ${count} baraha sa mga pundasyon: ${names}.`,
  shuffling: "Binabalasa ang mga baraha.",
  sourceWithCards: (name, count) =>
    `${name} at ang ${count} baraha sa ibabaw nito`,
  startFresh: "Magsimula na lang ng bago",
  stock: (cards) => `Tumpok ng bunutan, ${cards}. Pindutin para bumunot.`,
  stockEmpty: "Wala nang laman ang bunutan.",
  stockRecycle:
    "Wala nang laman ang bunutan. Pindutin para baligtarin ang tumpok ng nabunot.",
  suggested: " Iminungkahi ng pahiwatig.",
  suits: {
    clubs: "clubs",
    diamonds: "diamonds",
    hearts: "hearts",
    spades: "spades",
  },
  table: "Mesa ng baraha",
  target: " Maaaring ilagay dito ang napiling baraha.",
  thatCard: "barahang iyon",
  title: "Solitaire",
  toColumn: (index) => `sa walang lamang hanay ${index}`,
  toFoundation: "sa pundasyon",
  undo: "I-undo",
  waste: "Mga nabunot",
  wasteEmpty:
    "Walang laman ang tumpok ng nabunot. Bumunot sa tumpok ng bunutan.",
  wasteTop: (card) => `Tumpok ng nabunot, ${card} sa ibabaw.`,
  won: (moves) => `Nanalo kayo sa ${moves} galaw.`,
  wonNote: (moves) =>
    ` Nanalo kayo sa ${moves} galaw. Mahusay ang inyong laro.`,
};

export { solitaire };
