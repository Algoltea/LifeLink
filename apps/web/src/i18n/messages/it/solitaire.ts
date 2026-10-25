import type { Messages } from "../en";

const solitaire: Messages["solitaire"] = {
  action: "Cosa fa",
  cardName: (rank, suit) => `${rank} di ${suit}`,
  cards: (count) => `${count} ${count === 1 ? "carta" : "carte"}`,
  cardsAbove: (count) =>
    `${count} ${count === 1 ? "carta sopra" : "carte sopra"}`,
  cardsBelow: (count) =>
    `${count} ${count === 1 ? "carta coperta" : "carte coperte"} sotto`,
  cardsPerDraw: "Carte per pescata",
  chooseAnother:
    "Scelga un altro posto oppure prema Escape per scegliere un’altra carta.",
  columnCard: (card, index) => `${card}, colonna ${index}`,
  columnEmpty: (index) => `Colonna ${index}, vuota. Qui può andare solo un re.`,
  dealAgain: "Distribuisci una nuova partita",
  dealt: (cards) => `Nuova partita distribuita, con ${cards} per pescata.`,
  discarded: (reason) =>
    `Non è stato possibile aprire la partita salvata, quindi ne è stata distribuita una nuova. ${reason}`,
  draw: "Pesca",
  drawSetting: (next, current) =>
    `Le nuove partite useranno ${next} per pescata. Questa continua con ${current}.`,
  drawWords: (count) => (count === 1 ? "una carta" : "tre carte"),
  drawing: (cards) => `Si pescano ${cards} alla volta`,
  earlier: "in precedenza",
  emptyColumn: "Questa colonna è vuota. Qui può andare solo un re.",
  emptyFoundation: "Questa base è vuota. Si inizia con un asso.",
  emptyWaste: "La pila degli scarti è vuota. Peschi prima dal mazzo.",
  engineExact: {
    "A saved column is out of order.":
      "Una colonna salvata non è nell’ordine corretto.",
    "A saved foundation is out of order.":
      "Una base salvata non è nell’ordine corretto.",
    "Only a king can go into an empty column.":
      "Solo un re può andare in una colonna vuota.",
    "Only one card at a time can go onto a foundation.":
      "Solo una carta alla volta può andare su una base.",
    "That card can't go onto a foundation yet.":
      "Quella carta non può ancora andare su una base.",
    "That card can't go there: a foundation starts with an ace.":
      "Quella carta non può andare lì: una base inizia con un asso.",
    "That card is already there.": "Quella carta è già lì.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "Quella carta è coperta. Sposti le carte sopra per scoprirla.",
    "That foundation is empty.": "Quella base è vuota.",
    "The saved draw setting is not 1 or 3.":
      "Il numero salvato di carte per pescata non è 1 né 3.",
    "The saved game could not be read.":
      "Non è stato possibile leggere la partita salvata.",
    "The saved game does not hold exactly one full deck.":
      "La partita salvata non contiene esattamente un mazzo completo.",
    "The saved move counts are negative.":
      "I contatori delle mosse salvati sono negativi.",
    "The saved move counts could not be read.":
      "Non è stato possibile leggere i contatori delle mosse salvati.",
    "The saved recycle limit could not be read.":
      "Non è stato possibile leggere il limite salvato dei giri del mazzo.",
    "The saved stock has a face-up card.":
      "Il mazzo salvato contiene una carta scoperta.",
    "The saved table could not be read.":
      "Non è stato possibile leggere il tavolo salvato.",
    "The saved table is missing.": "Manca il tavolo salvato.",
    "The saved waste pile has a face-down card.":
      "La pila degli scarti salvata contiene una carta coperta.",
    "The waste pile is empty. Draw from the stock first.":
      "La pila degli scarti è vuota. Peschi prima dal mazzo.",
    "There are no cards left to draw.": "Non ci sono più carte da pescare.",
    "There is no card there.": "Non c’è una carta lì.",
    "There is no column there.": "Non c’è una colonna lì.",
    "There is no foundation there.": "Non c’è una base lì.",
    "There is nothing to undo yet.": "Non c’è ancora nulla da annullare.",
    "This is not a saved solitaire game.":
      "Questa non è una partita di Solitario salvata.",
    "This save comes from a different version of the game.":
      "Questo salvataggio proviene da un’altra versione del gioco.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "Quelle carte non possono essere spostate insieme: solo una sequenza continua a colori alternati può muoversi in gruppo.",
    "Turned the waste pile over to make a new stock.":
      "La pila degli scarti è stata girata per formare un nuovo mazzo.",
    "Undid the last move.": "Ultima mossa annullata.",
    "You have already gone through the deck as many times as this game allows.":
      "Ha già girato il mazzo tutte le volte consentite da questa partita.",
  },
  engineMoreCards: (count) =>
    `e ${count} ${count === "1" ? "altra carta" : "altre carte"}`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `Carta pescata: ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `Pescate ${count} carte. In cima c’è ${card}.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `Spostamento di ${card} alla base ${index} completato.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `Spostamento di ${cards} su ${top} completato.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) =>
        `Spostamento di ${cards} nella colonna vuota ${index} completato.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `Non si può mettere nulla su ${card} in una colonna.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `Quella carta non può andare lì: serve una carta di valore ${rank} e di colore ${color === "red" ? "rosso" : "nero"}.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) => `Quella carta non può andare lì: questa base è per ${suit}.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) =>
        `Quella carta non può andare lì: questa base inizia con ${card}.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) => `Quella base è completa: termina già con ${card}.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) => `Quella carta non può andare lì: questa base richiede ${card}.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `Manca: ${pile}.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `${pile}: una carta non è leggibile.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `${pile}: devono esserci ${count} pile.`,
    ],
  ],
  engineRevealed: (card) => ` Scoperta la carta ${card}.`,
  engineUndoStep: (reason) =>
    `Un passaggio da annullare è danneggiato: ${reason}`,
  engineWords: {
    ace: "asso",
    columns: "colonne",
    foundations: "basi",
    jack: "fante",
    king: "re",
    "next card": "carta successiva",
    pile: "pila",
    queen: "regina",
    stock: "mazzo",
    "the card": "la carta",
    "waste pile": "pila degli scarti",
  },
  faceDown: "Quella carta è coperta. Sposti le carte sopra per scoprirla.",
  foundation: (index) => `Base ${index}.`,
  foundationCount: (count) => `${count} di 52 carte sulle basi`,
  foundationEmpty: (name, card) => `${name}, vuota. Inizia con ${card}.`,
  foundationName: (suit) => `Base di ${suit}`,
  foundationTop: (name, card) => `${name}, con ${card} in cima.`,
  gestures:
    "Tocchi una carta per selezionarla, poi tocchi dove vuole metterla. Se ha un solo posto possibile, basta un tocco per spostarla. Tocchi di nuovo la carta selezionata per inviarla a una base, oppure tocchi due volte una carta per fare lo stesso.",
  guestIntro: "Un gioco tranquillo. Non serve un account.",
  hint: "Suggerimento",
  hintDraw: "Suggerimento: peschi dal mazzo.",
  hintMove: (source, target) => `Suggerimento: sposti ${source} ${target}.`,
  howToPlay: "Come si gioca",
  intro: "Un gioco tranquillo.",
  key: "Tasto",
  keyboard: "Tasti della tastiera",
  keys: [
    {
      action: "Spostarsi tra pile e carte",
      keys: "Frecce",
    },
    {
      action: "Selezionare una carta o posare quella selezionata",
      keys: "Invio o Spazio",
    },
    {
      action: "Inviare la carta selezionata a una base",
      keys: "Di nuovo Invio sulla stessa carta",
    },
    {
      action: "Rimettere la carta a posto",
      keys: "Escape",
    },
    {
      action: "Pescare dal mazzo",
      keys: "D",
    },
    {
      action: "Annullare l’ultima mossa",
      keys: "U, oppure Ctrl+Z",
    },
    {
      action: "Mostrare un suggerimento",
      keys: "H",
    },
    {
      action:
        "Inviare alle basi tutte le carte che si possono spostare senza rischi",
      keys: "F",
    },
  ],
  king: "Re",
  moves: (count) => `${count} ${count === 1 ? "mossa" : "mosse"}`,
  newGame: "Nuova partita",
  noMovesNote:
    " Non ci sono più mosse in questa partita. Può annullare una mossa o iniziare una nuova partita.",
  noSafeCards:
    "Al momento non ci sono carte da inviare alle basi senza rischi.",
  noUsefulMoves:
    "Non ci sono più mosse utili. Provi ad annullare una mossa o inizi una nuova partita.",
  nothingSelected: "Nessuna carta selezionata.",
  onto: (card) => `su ${card}`,
  putBack: "Carta rimessa a posto. Nessuna carta selezionata.",
  ranks: [
    "asso",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "fante",
    "regina",
    "re",
  ],
  ready: "Una nuova partita è pronta. Scelga una carta per iniziare.",
  resumed: "La Sua ultima partita è stata ripresa.",
  resumedAt: (date) => `Partita ripresa, salvata ${date}.`,
  rules:
    "Formi quattro pile dall’asso al re, ciascuna nello spazio con il proprio seme (♠ ♥ ♣ ♦). Nelle sette colonne, metta una carta su una di valore immediatamente superiore e di colore diverso: un 7 rosso su un 8 nero. Solo un re può occupare una colonna vuota. Peschi dal mazzo quando non sa come proseguire.",
  safeCards: "Invia carte sicure alle basi",
  saveFailed:
    "Questo browser non permette di salvare la partita. Se chiude la pagina, perderà i progressi.",
  savedHint:
    "La partita si salva su questo dispositivo dopo ogni mossa, anche senza connessione a Internet.",
  savedOn: (day, time) => `il ${day} alle ${time}`,
  savedToday: (time) => `oggi alle ${time}`,
  scrollHint:
    "Scorra il tavolo lateralmente per raggiungere tutte le pile, oppure ruoti il telefono per avere più spazio.",
  selected: " Selezionata.",
  selectedBlocked: (name) =>
    `Selezionata ${name}. Al momento non ha una destinazione. Prema Escape per rimetterla a posto.`,
  selectedTargets: (name, count) =>
    `Selezionata ${name}. Può andare in ${count} ${count === 1 ? "posto" : "posti"}. Ne scelga uno oppure prema Escape.`,
  sentSafe: (count, names) =>
    `${count} ${count === 1 ? "carta inviata" : "carte inviate"} alle basi: ${names}.`,
  shuffling: "Mescolamento delle carte.",
  sourceWithCards: (name, count) =>
    `${name} e ${count === 1 ? "la carta" : `le ${count} carte`} sopra`,
  startFresh: "Inizia da capo",
  stock: (cards) => `Mazzo, ${cards}. Prema per pescare.`,
  stockEmpty: "Il mazzo è vuoto.",
  stockRecycle: "Il mazzo è vuoto. Prema per girare la pila degli scarti.",
  suggested: " Indicata dal suggerimento.",
  suits: {
    clubs: "fiori",
    diamonds: "quadri",
    hearts: "cuori",
    spades: "picche",
  },
  table: "Tavolo da gioco",
  target: " La carta selezionata può andare qui.",
  thatCard: "quella carta",
  title: "Solitario",
  toColumn: (index) => `nella colonna vuota ${index}`,
  toFoundation: "in una base",
  undo: "Annulla ultima azione",
  waste: "Scarti",
  wasteEmpty: "Pila degli scarti vuota. Peschi dal mazzo.",
  wasteTop: (card) => `Pila degli scarti, con ${card} in cima.`,
  won: (moves) => `Ha vinto in ${moves} ${moves === 1 ? "mossa" : "mosse"}.`,
  wonNote: (moves) =>
    ` Ha vinto in ${moves} ${moves === 1 ? "mossa" : "mosse"}. Bella partita.`,
};

export { solitaire };
