import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "Spielaktionen",
  alreadyClear: "Das Spielfeld ist bereits leer.",
  biggerScreen:
    "Mahjong braucht einen größeren Bildschirm, damit die Spielsteine groß genug zum Antippen sind. Öffnen Sie LifeLink auf einem Tablet oder Computer, um zu spielen.",
  blocked: {
    "boxed-in":
      "Dieser Spielstein ist auf beiden Seiten blockiert. Wählen Sie einen Spielstein, dessen linke oder rechte Seite frei ist.",
    covered:
      "Dieser Spielstein ist von einem anderen bedeckt. Entfernen Sie zuerst die Spielsteine darüber.",
    removed: "Dieser Spielstein wurde bereits als Teil eines Paares entfernt.",
  },
  board: "Spielfeld mit Spielsteinen",
  clearBoard:
    "Das Spielfeld ist leer. Mit Rückgängig holen Sie das letzte Paar zurück. Sie können auch eine neue Partie auslegen.",
  cleared: (moves) =>
    `Sie haben das Spielfeld in ${moves} ${moves === 1 ? "Zug" : "Zügen"} geleert.`,
  dealAgain: "Neue Partie auslegen",
  dealt: (layout) =>
    `Eine neue Partie mit der Anordnung ${layout} wurde ausgelegt.`,
  discarded:
    "Ihre gespeicherte Partie konnte nicht geöffnet werden. Deshalb wurde eine neue Partie ausgelegt.",
  dragonTile: (dragon) => `Drache: ${dragon}`,
  dragons: { green: "Grün", red: "Rot", white: "Weiß" },
  earlier: "zuvor",
  errors: {
    blocked: "Dieser Spielstein kann noch nicht ausgewählt werden.",
    "cannot-shuffle":
      "Die Spielsteine konnten nicht gemischt werden. Machen Sie einen Zug rückgängig oder beginnen Sie eine neue Partie.",
    "invalid-index": "Dort liegt kein Spielstein.",
    "no-match": "Diese Spielsteine bilden kein Paar.",
    "nothing-to-shuffle": "Es sind keine Spielsteine mehr zum Mischen übrig.",
    "nothing-to-undo": "Es gibt noch keinen Zug zum Rückgängigmachen.",
    "same-tile": "Das ist derselbe Spielstein. Wählen Sie einen zweiten aus.",
  },
  flowerTile: (flower) => `Blume: ${flower}`,
  flowers: {
    bamboo: "Bambus",
    chrysanthemum: "Chrysantheme",
    orchid: "Orchidee",
    plum: "Pflaume",
  },
  free: "Frei auswählbar.",
  gestures:
    "Tippen Sie auf einen Spielstein, um ihn auszuwählen, und dann auf den passenden Spielstein. Tippen Sie erneut auf den ausgewählten Spielstein, um ihn zurückzulegen. Wenn Sie nicht weiterkommen, zeigt Tipp ein Paar, Mischen ordnet die übrigen Spielsteine neu an und Rückgängig nimmt Ihren letzten Zug zurück. Jede Partie ist lösbar, auch nach jedem Mischen.",
  groups: {
    characters: {
      matches:
        "Zahlen von 1 bis 9. Bilden Sie ein Paar aus zwei gleichen Zahlen.",
      name: "Schriftzeichen (萬)",
    },
    dragons: {
      matches:
        "Rot, Grün und Weiß. Bilden Sie ein Paar aus zwei gleichen Drachen.",
      name: "Drachen",
    },
    flowers: {
      matches:
        "Mit 花 in der Ecke gekennzeichnet. Jede Blume passt zu jeder anderen Blume.",
      name: "Blumen",
    },
    otherSuits: {
      matches: "Zahlen von 1 bis 9, nur in der Anordnung Klassisch.",
      name: "Kreise (筒) und Bambus (條)",
    },
    seasons: {
      matches:
        "Mit 季 in der Ecke gekennzeichnet. Jede Jahreszeit passt zu jeder anderen Jahreszeit.",
      name: "Jahreszeiten",
    },
    winds: {
      matches:
        "Ost, Süd, West und Nord. Bilden Sie ein Paar aus zwei gleichen Winden.",
      name: "Winde",
    },
  },
  guestSubtitle: "Ein ruhiges Spiel mit Spielsteinen. Kein Konto nötig.",
  hint: "Tipp",
  hintPair: (pair) => `Tipp: Wählen Sie das Paar ${pair}.`,
  howToPlay: "Spielanleitung",
  keyboard:
    "Wechseln Sie mit den Pfeiltasten zwischen freien Spielsteinen. Drücken Sie Enter, um einen Spielstein auszuwählen, und Escape, um ihn zurückzulegen.",
  layout: "Anordnung",
  layoutLabel: (name) => `Anordnung: ${name}`,
  layoutSetting: (next, current) =>
    `Neue Partien verwenden die Anordnung ${next}. Diese Partie behält die Anordnung ${current}.`,
  layouts: { classic: "Klassisch", easy: "Einfach" },
  matched: (pair, left) =>
    `Paar entfernt: ${pair}. Noch ${left} ${left === 1 ? "Spielstein" : "Spielsteine"} übrig.`,
  mismatch: (first, second) =>
    `${first} und ${second} bilden kein Paar. Stattdessen ist jetzt ${second} ausgewählt.`,
  moves: (count) => `${count} ${count === 1 ? "Zug" : "Züge"}`,
  newGame: "Neue Partie",
  onDateAt: (date, time) => `am ${date} um ${time}`,
  pair: (first, second) => `${first} und ${second}`,
  picked: (name) =>
    `Ausgewählter Spielstein: ${name}. Tippen Sie jetzt auf den passenden Spielstein.`,
  playSolitaire: "Stattdessen Solitaire spielen",
  preparing: "Die Spielsteine werden ausgelegt.",
  putDown: "Spielstein zurückgelegt. Nichts ausgewählt.",
  ready:
    "Eine neue Partie ist bereit. Wählen Sie einen hellen Spielstein, um zu beginnen.",
  resumed: (when) => `Ihre Partie wurde fortgesetzt, gespeichert ${when}.`,
  rules:
    "Leeren Sie das Spielfeld, indem Sie passende Spielsteine paarweise entfernen. Sie können nur freie Spielsteine nehmen: Es darf kein Spielstein darauf liegen und die linke oder rechte Seite muss frei sein. Freie Spielsteine sind hell. Spielsteine, die Sie noch nicht nehmen können, sind blasser.",
  saveFailed:
    "Dieser Browser erlaubt das Speichern der Partie nicht. Ihr Fortschritt geht verloren, wenn Sie diese Seite schließen.",
  saved:
    "Ihre Partie wird nach jedem Zug auf diesem Gerät gespeichert, auch ohne Internetverbindung.",
  scroll:
    "Scrollen Sie das Spielfeld seitwärts, wenn einige Spielsteine nicht sichtbar sind.",
  seasonTile: (season) => `Jahreszeit: ${season}`,
  seasons: {
    autumn: "Herbst",
    spring: "Frühling",
    summer: "Sommer",
    winter: "Winter",
  },
  selected: "Ausgewählt.",
  shuffle: "Mischen",
  shuffled: "Die übrigen Spielsteine wurden gemischt.",
  stillSelected: "Ihr gewählter Spielstein ist weiterhin ausgewählt.",
  stuck:
    "Kein Paar ist frei. Mischen Sie die Spielsteine oder machen Sie einen Zug rückgängig.",
  subtitle: "Ein ruhiges Spiel mit Spielsteinen.",
  suggested: "Vom Tipp vorgeschlagen.",
  suitTile: (rank, suit) => `${suit} ${rank}`,
  suits: { bamboo: "Bambus", characters: "Schriftzeichen", dots: "Kreise" },
  tileGuide: "Die Spielsteine",
  tilePosition: (name, layer, row, column) =>
    `${name}, Ebene ${layer}, Reihe ${row}, Spalte ${column}.`,
  tiles: (count) => `${count} ${count === 1 ? "Spielstein" : "Spielsteine"}`,
  tilesLeft: (left, total) => `Noch ${left} von ${total} Spielsteinen`,
  title: "Mahjong",
  todayAt: (time) => `heute um ${time}`,
  undo: "Rückgängig",
  undone: "Der letzte Zug wurde rückgängig gemacht.",
  wellPlayed: "Gut gespielt.",
  windTile: (wind) => `Wind: ${wind}`,
  winds: { east: "Ost", north: "Nord", south: "Süd", west: "West" },
};

export { mahjong };
