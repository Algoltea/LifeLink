import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "Azioni di gioco",
  alreadyClear: "Il tavolo è già libero.",
  biggerScreen:
    "Per giocare a Mahjong serve uno schermo più grande, così le tessere sono abbastanza grandi da toccare. Apra LifeLink su un tablet o un computer per giocare.",
  blocked: {
    "boxed-in":
      "Questa tessera è bloccata su entrambi i lati. Scelga una tessera con il lato sinistro o destro libero.",
    covered:
      "Questa tessera è coperta da un’altra. Prima rimuova le tessere sopra di essa.",
    removed: "Questa tessera è già stata abbinata.",
  },
  board: "Tavolo delle tessere",
  clearBoard:
    "Il tavolo è libero. Annulla ripristina l’ultima coppia, oppure può preparare un’altra partita.",
  cleared: (moves) =>
    `Ha liberato il tavolo in ${moves} ${moves === 1 ? "mossa" : "mosse"}.`,
  dealAgain: "Prepara un’altra partita",
  dealt: (layout) => `Nuova partita preparata. Disposizione: ${layout}.`,
  discarded:
    "Non è stato possibile aprire la partita salvata. È stata preparata una nuova partita.",
  dragonTile: (dragon) => `Drago: ${dragon}`,
  dragons: { green: "Verde", red: "Rosso", white: "Bianco" },
  earlier: "in precedenza",
  errors: {
    blocked: "Questa tessera non può ancora essere scelta.",
    "cannot-shuffle":
      "Non è stato possibile mescolare le tessere. Provi ad annullare una mossa o a iniziare una nuova partita.",
    "invalid-index": "Non c’è nessuna tessera in quella posizione.",
    "no-match": "Queste tessere non corrispondono.",
    "nothing-to-shuffle": "Non ci sono più tessere da mescolare.",
    "nothing-to-undo": "Non ci sono ancora mosse da annullare.",
    "same-tile": "È la stessa tessera. Ne scelga una seconda.",
  },
  flowerTile: (flower) => `Fiore: ${flower}`,
  flowers: {
    bamboo: "Bambù",
    chrysanthemum: "Crisantemo",
    orchid: "Orchidea",
    plum: "Pruno",
  },
  free: "Libera da scegliere.",
  gestures:
    "Tocchi una tessera per sceglierla, poi tocchi quella corrispondente. Tocchi di nuovo la tessera scelta per deselezionarla. Se non sa come proseguire, Suggerimento mostra una coppia, Mescola riordina le tessere rimaste e Annulla ripristina l’ultima mossa. Ogni partita può essere completata, anche dopo ogni mescolamento.",
  groups: {
    characters: {
      matches: "Numeri da 1 a 9. Abbini due tessere con lo stesso numero.",
      name: "Caratteri (萬)",
    },
    dragons: {
      matches: "Rosso, Verde e Bianco. Abbini due tessere con lo stesso drago.",
      name: "Draghi",
    },
    flowers: {
      matches:
        "Contrassegnati da 花 nell’angolo. Ogni fiore può essere abbinato a qualsiasi altro fiore.",
      name: "Fiori",
    },
    otherSuits: {
      matches: "Numeri da 1 a 9, solo nella disposizione Classica.",
      name: "Cerchi (筒) e Bambù (條)",
    },
    seasons: {
      matches:
        "Contrassegnate da 季 nell’angolo. Ogni stagione può essere abbinata a qualsiasi altra stagione.",
      name: "Stagioni",
    },
    winds: {
      matches:
        "Est, Sud, Ovest e Nord. Abbini due tessere con lo stesso vento.",
      name: "Venti",
    },
  },
  guestSubtitle: "Un tranquillo gioco di tessere. Non serve un account.",
  hint: "Suggerimento",
  hintPair: (pair) => `Suggerimento: abbini ${pair}.`,
  howToPlay: "Come si gioca",
  keyboard:
    "Usi i tasti freccia per spostarsi tra le tessere libere. Prema Invio per scegliere una tessera ed Esc per deselezionarla.",
  layout: "Disposizione",
  layoutLabel: (name) => `Disposizione: ${name}`,
  layoutSetting: (next, current) =>
    `Le nuove partite useranno la disposizione ${next}. Questa partita mantiene la disposizione ${current}.`,
  layouts: { classic: "Classica", easy: "Facile" },
  matched: (pair, left) =>
    `Coppia abbinata: ${pair}. Tessere rimaste: ${left}.`,
  mismatch: (first, second) =>
    `${first} e ${second} non corrispondono. Ora è selezionata la tessera ${second}.`,
  moves: (count) => `${count} ${count === 1 ? "mossa" : "mosse"}`,
  newGame: "Nuova partita",
  onDateAt: (date, time) => `il ${date} alle ${time}`,
  pair: (first, second) => `${first} e ${second}`,
  picked: (name) =>
    `Tessera scelta: ${name}. Ora tocchi la tessera corrispondente.`,
  playSolitaire: "Gioca invece a Solitario",
  preparing: "Preparazione delle tessere.",
  putDown: "Tessera deselezionata. Nessuna tessera scelta.",
  ready:
    "Una nuova partita è pronta. Scelga una tessera luminosa per iniziare.",
  resumed: (when) => `Partita ripresa, salvata ${when}.`,
  rules:
    "Liberi il tavolo abbinando le tessere a coppie. Può prendere solo una tessera libera: senza altre tessere sopra e con il lato sinistro o destro libero. Le tessere libere sono luminose; quelle che non può ancora prendere sono sbiadite.",
  saveFailed:
    "Questo browser non permette di salvare la partita. Se chiude la pagina, perderà i progressi.",
  saved:
    "La partita si salva su questo dispositivo dopo ogni mossa, anche senza connessione a Internet.",
  scroll: "Scorra il tavolo lateralmente se alcune tessere non sono visibili.",
  seasonTile: (season) => `Stagione: ${season}`,
  seasons: {
    autumn: "Autunno",
    spring: "Primavera",
    summer: "Estate",
    winter: "Inverno",
  },
  selected: "Selezionata.",
  shuffle: "Mescola",
  shuffled: "Le tessere rimaste sono state mescolate.",
  stillSelected: "La tessera scelta è ancora selezionata.",
  stuck: "Non ci sono coppie libere. Mescoli le tessere o annulli una mossa.",
  subtitle: "Un tranquillo gioco di tessere.",
  suggested: "Indicata dal suggerimento.",
  suitTile: (rank, suit) => `${rank} di ${suit}`,
  suits: { bamboo: "Bambù", characters: "Caratteri", dots: "Cerchi" },
  tileGuide: "Le tessere",
  tilePosition: (name, layer, row, column) =>
    `${name}, livello ${layer}, riga ${row}, colonna ${column}.`,
  tiles: (count) => `${count} ${count === 1 ? "tessera" : "tessere"}`,
  tilesLeft: (left, total) => `Tessere rimaste: ${left} su ${total}`,
  title: "Mahjong",
  todayAt: (time) => `oggi alle ${time}`,
  undo: "Annulla",
  undone: "L’ultima mossa è stata annullata.",
  wellPlayed: "Ben giocato.",
  windTile: (wind) => `Vento: ${wind}`,
  winds: { east: "Est", north: "Nord", south: "Sud", west: "Ovest" },
};

export { mahjong };
