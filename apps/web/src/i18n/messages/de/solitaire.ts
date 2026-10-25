import type { Messages } from "../en";

const solitaire: Messages["solitaire"] = {
  action: "Funktion",
  cardName: (rank, suit) => `${suit} ${rank}`,
  cards: (count) => `${count} ${count === 1 ? "Karte" : "Karten"}`,
  cardsAbove: (count) => `${count} ${count === 1 ? "Karte" : "Karten"} darüber`,
  cardsBelow: (count) =>
    `${count} ${count === 1 ? "verdeckte Karte" : "verdeckte Karten"} darunter`,
  cardsPerDraw: "Karten pro Ziehen",
  chooseAnother:
    "Wählen Sie eine andere Stelle oder drücken Sie Escape, um eine andere Karte auszuwählen.",
  columnCard: (card, index) => `${card}, Spalte ${index}`,
  columnEmpty: (index) =>
    `Spalte ${index}, leer. Hier darf nur ein König liegen.`,
  dealAgain: "Neue Partie austeilen",
  dealt: (cards) =>
    `Neue Partie ausgeteilt. Es werden jeweils ${cards} gezogen.`,
  discarded: (reason) =>
    `Ihre gespeicherte Partie konnte nicht geöffnet werden. Deshalb wurde eine neue ausgeteilt. ${reason}`,
  draw: "Ziehen",
  drawSetting: (next, current) =>
    `Bei neuen Partien werden jeweils ${next} gezogen. In dieser Partie bleiben es ${current}.`,
  drawWords: (count) => (count === 1 ? "eine Karte" : "drei Karten"),
  drawing: (cards) => `Jeweils ${cards} ziehen`,
  earlier: "früher",
  emptyColumn: "Diese Spalte ist leer. Hier darf nur ein König liegen.",
  emptyFoundation: "Dieser Zielstapel ist leer. Zuerst kommt ein Ass hierher.",
  emptyWaste: "Der Ablagestapel ist leer. Ziehen Sie zuerst vom Vorratsstapel.",
  engineExact: {
    "A saved column is out of order.":
      "Eine gespeicherte Spalte ist nicht in der richtigen Reihenfolge.",
    "A saved foundation is out of order.":
      "Ein gespeicherter Zielstapel ist nicht in der richtigen Reihenfolge.",
    "Only a king can go into an empty column.":
      "In eine leere Spalte darf nur ein König.",
    "Only one card at a time can go onto a foundation.":
      "Auf einen Zielstapel darf nur eine Karte auf einmal gelegt werden.",
    "That card can't go onto a foundation yet.":
      "Diese Karte kann noch nicht auf einen Zielstapel gelegt werden.",
    "That card can't go there: a foundation starts with an ace.":
      "Diese Karte kann dort nicht hin: Ein Zielstapel beginnt mit einem Ass.",
    "That card is already there.": "Diese Karte liegt bereits dort.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "Diese Karte ist verdeckt. Verschieben Sie die Karten darüber, um sie aufzudecken.",
    "That foundation is empty.": "Dieser Zielstapel ist leer.",
    "The saved draw setting is not 1 or 3.":
      "Die gespeicherte Anzahl der Karten pro Ziehen ist weder 1 noch 3.",
    "The saved game could not be read.":
      "Die gespeicherte Partie konnte nicht gelesen werden.",
    "The saved game does not hold exactly one full deck.":
      "Die gespeicherte Partie enthält nicht genau ein vollständiges Kartenspiel.",
    "The saved move counts are negative.":
      "Die gespeicherten Zugzahlen sind negativ.",
    "The saved move counts could not be read.":
      "Die gespeicherten Zugzahlen konnten nicht gelesen werden.",
    "The saved recycle limit could not be read.":
      "Die gespeicherte Grenze für Stapeldurchläufe konnte nicht gelesen werden.",
    "The saved stock has a face-up card.":
      "Der gespeicherte Vorratsstapel enthält eine aufgedeckte Karte.",
    "The saved table could not be read.":
      "Der gespeicherte Spieltisch konnte nicht gelesen werden.",
    "The saved table is missing.": "Der gespeicherte Spieltisch fehlt.",
    "The saved waste pile has a face-down card.":
      "Der gespeicherte Ablagestapel enthält eine verdeckte Karte.",
    "The waste pile is empty. Draw from the stock first.":
      "Der Ablagestapel ist leer. Ziehen Sie zuerst vom Vorratsstapel.",
    "There are no cards left to draw.":
      "Es sind keine Karten mehr zum Ziehen übrig.",
    "There is no card there.": "Dort liegt keine Karte.",
    "There is no column there.": "Dort gibt es keine Spalte.",
    "There is no foundation there.": "Dort gibt es keinen Zielstapel.",
    "There is nothing to undo yet.":
      "Es gibt noch nichts rückgängig zu machen.",
    "This is not a saved solitaire game.":
      "Dies ist keine gespeicherte Solitaire-Partie.",
    "This save comes from a different version of the game.":
      "Dieser Spielstand stammt aus einer anderen Spielversion.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "Diese Karten können nicht zusammen verschoben werden: Nur eine lückenlose Folge mit abwechselnden Farben lässt sich als Gruppe bewegen.",
    "Turned the waste pile over to make a new stock.":
      "Der Ablagestapel wurde umgedreht und bildet einen neuen Vorratsstapel.",
    "Undid the last move.": "Der letzte Zug wurde rückgängig gemacht.",
    "You have already gone through the deck as many times as this game allows.":
      "Sie haben den Stapel bereits so oft durchlaufen, wie es diese Partie erlaubt.",
  },
  engineMoreCards: (count) =>
    `und ${count} weitere ${count === "1" ? "Karte" : "Karten"}`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `Gezogen: ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) => `${count} Karten gezogen. Oben liegt: ${card}.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `${card} auf Zielstapel ${index} verschoben.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `${cards} auf ${top} verschoben.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) => `${cards} in die leere Spalte ${index} verschoben.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) => `Auf ${card} kann in einer Spalte keine Karte gelegt werden.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `Diese Karte kann dort nicht hin. Benötigt wird eine ${color === "red" ? "rote" : "schwarze"} Karte mit dem Wert ${rank}.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) =>
        `Diese Karte kann dort nicht hin: Dieser Zielstapel ist für ${suit}.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) =>
        `Diese Karte kann dort nicht hin: Dieser Zielstapel beginnt mit ${card}.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) =>
        `Dieser Zielstapel ist vollständig: Er endet bereits mit ${card}.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) =>
        `Diese Karte kann dort nicht hin: Dieser Zielstapel benötigt ${card}.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `Fehlt: ${pile}.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `${pile}: Eine Karte konnte nicht gelesen werden.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) => `${pile}: Es sollten ${count} Stapel sein.`,
    ],
  ],
  engineRevealed: (card) => ` Aufgedeckt: ${card}.`,
  engineUndoStep: (reason) =>
    `Ein Schritt zum Rückgängigmachen ist beschädigt: ${reason}`,
  engineWords: {
    ace: "Ass",
    columns: "Spalten",
    foundations: "Zielstapel",
    jack: "Bube",
    king: "König",
    "next card": "nächste Karte",
    pile: "Stapel",
    queen: "Dame",
    stock: "Vorratsstapel",
    "the card": "die Karte",
    "waste pile": "Ablagestapel",
  },
  faceDown:
    "Diese Karte ist verdeckt. Verschieben Sie die Karten darüber, um sie aufzudecken.",
  foundation: (index) => `Zielstapel ${index}.`,
  foundationCount: (count) => `${count} von 52 Karten auf den Zielstapeln`,
  foundationEmpty: (name, card) => `${name}, leer. Beginnt mit ${card}.`,
  foundationName: (suit) => `Zielstapel ${suit}`,
  foundationTop: (name, card) => `${name}, oben liegt ${card}.`,
  gestures:
    "Tippen Sie auf eine Karte, um sie auszuwählen, und dann auf ihr Ziel. Hat eine Karte nur ein mögliches Ziel, bewegt ein einzelnes Tippen sie dorthin. Tippen Sie erneut auf die ausgewählte Karte, um sie auf einen Zielstapel zu legen. Dasselbe geht mit einem Doppeltippen auf eine beliebige Karte.",
  guestIntro: "Ein ruhiges Spiel. Kein Konto nötig.",
  hint: "Tipp",
  hintDraw: "Tipp: Ziehen Sie vom Vorratsstapel.",
  hintMove: (source, target) => `Tipp: Verschieben Sie ${source} ${target}.`,
  howToPlay: "Spielanleitung",
  intro: "Ein ruhiges Spiel.",
  key: "Taste",
  keyboard: "Tastaturbedienung",
  keys: [
    { action: "Zwischen Stapeln und Karten wechseln", keys: "Pfeiltasten" },
    {
      action: "Eine Karte auswählen oder die ausgewählte Karte ablegen",
      keys: "Enter oder Leertaste",
    },
    {
      action: "Ausgewählte Karte auf einen Zielstapel legen",
      keys: "Erneut Enter auf derselben Karte",
    },
    { action: "Karte zurücklegen", keys: "Escape" },
    { action: "Vom Vorratsstapel ziehen", keys: "D" },
    { action: "Letzten Zug rückgängig machen", keys: "U oder Strg+Z" },
    { action: "Tipp anzeigen", keys: "H" },
    {
      action: "Alle sicher ablegbaren Karten auf die Zielstapel legen",
      keys: "F",
    },
  ],
  king: "König",
  moves: (count) => `${count} ${count === 1 ? "Zug" : "Züge"}`,
  newGame: "Neue Partie",
  noMovesNote:
    " In dieser Partie sind keine Züge mehr möglich. Sie können einen Zug rückgängig machen oder eine neue Partie starten.",
  noSafeCards:
    "Gerade können keine Karten sicher auf die Zielstapel gelegt werden.",
  noUsefulMoves:
    "Es sind keine hilfreichen Züge mehr möglich. Machen Sie einen Zug rückgängig oder starten Sie eine neue Partie.",
  nothingSelected: "Nichts ausgewählt.",
  onto: (card) => `auf ${card}`,
  putBack: "Karte zurückgelegt. Nichts ausgewählt.",
  ranks: [
    "Ass",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Bube",
    "Dame",
    "König",
  ],
  ready: "Eine neue Partie ist bereit. Wählen Sie eine Karte, um zu beginnen.",
  resumed: "Ihre letzte Partie wurde fortgesetzt.",
  resumedAt: (date) => `Ihre Partie wurde fortgesetzt, gespeichert ${date}.`,
  rules:
    "Bilden Sie vier Stapel vom Ass bis zum König, jeweils an der Stelle mit dem passenden Symbol (♠ ♥ ♣ ♦). In den sieben Spalten legen Sie eine Karte auf eine um eins höhere Karte der anderen Farbe: eine rote 7 auf eine schwarze 8. In eine leere Spalte darf nur ein König. Ziehen Sie vom Vorratsstapel, wenn Sie nicht weiterkommen.",
  safeCards: "Sichere Karten auf Zielstapel legen",
  saveFailed:
    "Dieser Browser erlaubt das Speichern der Partie nicht. Ihr Fortschritt geht verloren, wenn Sie diese Seite schließen.",
  savedHint:
    "Ihre Partie wird nach jedem Zug auf diesem Gerät gespeichert, auch ohne Internetverbindung.",
  savedOn: (day, time) => `am ${day} um ${time}`,
  savedToday: (time) => `heute um ${time}`,
  scrollHint:
    "Scrollen Sie den Tisch seitwärts, um alle Stapel zu erreichen, oder drehen Sie Ihr Telefon für mehr Platz ins Querformat.",
  selected: " Ausgewählt.",
  selectedBlocked: (name) =>
    `${name} ausgewählt. Diese Karte hat gerade kein mögliches Ziel. Drücken Sie Escape, um sie zurückzulegen.`,
  selectedTargets: (name, count) =>
    `${name} ausgewählt. ${count === 1 ? "Es gibt 1 mögliches Ziel" : `Es gibt ${count} mögliche Ziele`}. Wählen Sie eines oder drücken Sie Escape.`,
  sentSafe: (count, names) =>
    `${count} ${count === 1 ? "Karte" : "Karten"} auf die Zielstapel gelegt: ${names}.`,
  shuffling: "Karten werden gemischt.",
  sourceWithCards: (name, count) =>
    `${name} und ${count === 1 ? "die Karte" : `die ${count} Karten`} darüber`,
  startFresh: "Stattdessen neu beginnen",
  stock: (cards) => `Vorratsstapel, ${cards}. Drücken Sie zum Ziehen.`,
  stockEmpty: "Der Vorratsstapel ist leer.",
  stockRecycle:
    "Der Vorratsstapel ist leer. Drücken Sie, um den Ablagestapel umzudrehen.",
  suggested: " Vom Tipp vorgeschlagen.",
  suits: { clubs: "Kreuz", diamonds: "Karo", hearts: "Herz", spades: "Pik" },
  table: "Kartentisch",
  target: " Die ausgewählte Karte kann hier abgelegt werden.",
  thatCard: "diese Karte",
  title: "Solitaire",
  toColumn: (index) => `in die leere Spalte ${index}`,
  toFoundation: "auf einen Zielstapel",
  undo: "Rückgängig",
  waste: "Ablage",
  wasteEmpty: "Ablagestapel, leer. Ziehen Sie vom Vorratsstapel.",
  wasteTop: (card) => `Ablagestapel, oben liegt ${card}.`,
  won: (moves) =>
    `Sie haben in ${moves} ${moves === 1 ? "Zug" : "Zügen"} gewonnen.`,
  wonNote: (moves) =>
    ` Sie haben in ${moves} ${moves === 1 ? "Zug" : "Zügen"} gewonnen. Gut gespielt.`,
};

export { solitaire };
