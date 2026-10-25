import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "Actions de la partie",
  alreadyClear: "Le plateau est déjà vide.",
  biggerScreen:
    "Le Mahjong nécessite un écran plus grand pour que les tuiles soient assez grandes pour être touchées facilement. Ouvrez LifeLink sur une tablette ou un ordinateur pour jouer.",
  blocked: {
    "boxed-in":
      "Cette tuile est bloquée des deux côtés. Choisissez une tuile dont le côté gauche ou droit est libre.",
    covered:
      "Cette tuile est recouverte par une autre. Retirez d’abord les tuiles au-dessus.",
    removed: "Cette tuile a déjà été retirée avec sa paire.",
  },
  board: "Plateau de tuiles",
  clearBoard:
    "Le plateau est vide. Annuler remet la dernière paire en place. Vous pouvez aussi distribuer une nouvelle partie.",
  cleared: (moves) =>
    `Vous avez vidé le plateau en ${moves} ${moves > 1 ? "coups" : "coup"}.`,
  dealAgain: "Distribuer une nouvelle partie",
  dealt: (layout) =>
    `Une nouvelle partie a été distribuée avec la disposition ${layout}.`,
  discarded:
    "Votre partie enregistrée n’a pas pu être ouverte ; une nouvelle partie a donc été distribuée.",
  dragonTile: (dragon) => `Dragon : ${dragon}`,
  dragons: { green: "Vert", red: "Rouge", white: "Blanc" },
  earlier: "plus tôt",
  errors: {
    blocked: "Cette tuile ne peut pas encore être choisie.",
    "cannot-shuffle":
      "Les tuiles n’ont pas pu être mélangées. Essayez d’annuler un coup ou de commencer une nouvelle partie.",
    "invalid-index": "Il n’y a pas de tuile à cet endroit.",
    "no-match": "Ces tuiles ne forment pas une paire.",
    "nothing-to-shuffle": "Il ne reste aucune tuile à mélanger.",
    "nothing-to-undo": "Il n’y a pas encore de coup à annuler.",
    "same-tile": "C’est la même tuile. Choisissez-en une deuxième.",
  },
  flowerTile: (flower) => `Fleur : ${flower}`,
  flowers: {
    bamboo: "Bambou",
    chrysanthemum: "Chrysanthème",
    orchid: "Orchidée",
    plum: "Prunier",
  },
  free: "Libre, vous pouvez la choisir.",
  gestures:
    "Touchez une tuile pour la choisir, puis celle qui forme une paire avec elle. Touchez à nouveau la tuile choisie pour la reposer. Si vous êtes bloqué, Indice montre une paire, Mélanger réorganise les tuiles restantes et Annuler revient sur votre dernier coup. Chaque partie peut être terminée, même après chaque mélange.",
  groups: {
    characters: {
      matches: "Nombres de 1 à 9. Associez deux tuiles de même nombre.",
      name: "Caractères (萬)",
    },
    dragons: {
      matches: "Rouge, vert et blanc. Associez deux tuiles de même dragon.",
      name: "Dragons",
    },
    flowers: {
      matches:
        "Marquées 花 dans le coin. Toute fleur peut former une paire avec n’importe quelle autre fleur.",
      name: "Fleurs",
    },
    otherSuits: {
      matches: "Nombres de 1 à 9, uniquement dans la disposition Classique.",
      name: "Cercles (筒) et bambous (條)",
    },
    seasons: {
      matches:
        "Marquées 季 dans le coin. Toute saison peut former une paire avec n’importe quelle autre saison.",
      name: "Saisons",
    },
    winds: {
      matches: "Est, sud, ouest et nord. Associez deux tuiles de même vent.",
      name: "Vents",
    },
  },
  guestSubtitle: "Un jeu de tuiles paisible. Aucun compte nécessaire.",
  hint: "Indice",
  hintPair: (pair) => `Indice : formez une paire avec ${pair}.`,
  howToPlay: "Comment jouer",
  keyboard:
    "Utilisez les flèches pour passer d’une tuile libre à l’autre. Appuyez sur Entrée pour choisir une tuile et sur Échap pour la reposer.",
  layout: "Disposition",
  layoutLabel: (name) => `Disposition : ${name}`,
  layoutSetting: (next, current) =>
    `Les nouvelles parties utiliseront la disposition ${next}. Cette partie conserve la disposition ${current}.`,
  layouts: { classic: "Classique", easy: "Facile" },
  matched: (pair, left) =>
    `Paire retirée : ${pair}. Il reste ${left} ${left > 1 ? "tuiles" : "tuile"}.`,
  mismatch: (first, second) =>
    `Les tuiles ${first} et ${second} ne forment pas une paire. La tuile ${second} est maintenant sélectionnée.`,
  moves: (count) => `${count} ${count > 1 ? "coups" : "coup"}`,
  newGame: "Nouvelle partie",
  onDateAt: (date, time) => `le ${date} à ${time}`,
  pair: (first, second) => `${first} et ${second}`,
  picked: (name) =>
    `Tuile choisie : ${name}. Touchez maintenant la tuile qui forme une paire avec elle.`,
  playSolitaire: "Jouer au Solitaire à la place",
  preparing: "Mise en place des tuiles.",
  putDown: "Tuile reposée. Aucune tuile n’est sélectionnée.",
  ready:
    "Une nouvelle partie est prête. Choisissez une tuile lumineuse pour commencer.",
  resumed: (when) => `Votre partie enregistrée ${when} a été reprise.`,
  rules:
    "Videz le plateau en retirant les tuiles par paires. Vous ne pouvez prendre qu’une tuile libre : aucune tuile au-dessus et au moins un côté libre, à gauche ou à droite. Les tuiles libres sont lumineuses ; celles que vous ne pouvez pas encore prendre sont estompées.",
  saveFailed:
    "Ce navigateur ne permet pas d’enregistrer la partie. Votre progression sera perdue si vous fermez cette page.",
  saved:
    "Votre partie est enregistrée sur cet appareil après chaque coup, même sans connexion à Internet.",
  scroll:
    "Faites défiler le plateau sur les côtés si certaines tuiles ne sont pas visibles.",
  seasonTile: (season) => `Saison : ${season}`,
  seasons: {
    autumn: "Automne",
    spring: "Printemps",
    summer: "Été",
    winter: "Hiver",
  },
  selected: "Sélectionnée.",
  shuffle: "Mélanger",
  shuffled: "Les tuiles restantes ont été mélangées.",
  stillSelected: "La tuile que vous avez choisie est toujours sélectionnée.",
  stuck: "Aucune paire n’est libre. Mélangez les tuiles ou annulez un coup.",
  subtitle: "Un jeu de tuiles paisible.",
  suggested: "Suggérée par l’indice.",
  suitTile: (rank, suit) => `${rank} de ${suit}`,
  suits: { bamboo: "Bambous", characters: "Caractères", dots: "Cercles" },
  tileGuide: "Les tuiles",
  tilePosition: (name, layer, row, column) =>
    `${name}, niveau ${layer}, ligne ${row}, colonne ${column}.`,
  tiles: (count) => `${count} ${count > 1 ? "tuiles" : "tuile"}`,
  tilesLeft: (left, total) =>
    `${left} ${left > 1 ? "tuiles restantes" : "tuile restante"} sur ${total}`,
  title: "Mahjong",
  todayAt: (time) => `aujourd’hui à ${time}`,
  undo: "Annuler",
  undone: "Le dernier coup a été annulé.",
  wellPlayed: "Bien joué.",
  windTile: (wind) => `Vent : ${wind}`,
  winds: { east: "Est", north: "Nord", south: "Sud", west: "Ouest" },
};

export { mahjong };
