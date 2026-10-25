import type { Messages } from "../en";

const requiredCard = (color: string, rank: string): string => {
  const feminine = rank === "dame" || rank === "carte suivante";
  const colorWord = color === "red" ? "rouge" : `noir${feminine ? "e" : ""}`;

  return `${feminine ? "une" : "un"} ${rank} ${colorWord}`;
};

const solitaire: Messages["solitaire"] = {
  action: "Action",
  cardName: (rank, suit) => `${rank} de ${suit}`,
  cards: (count) => `${count} ${count > 1 ? "cartes" : "carte"}`,
  cardsAbove: (count) => `${count} ${count > 1 ? "cartes" : "carte"} au-dessus`,
  cardsBelow: (count) =>
    `${count} ${count > 1 ? "cartes face cachée" : "carte face cachée"} en dessous`,
  cardsPerDraw: "Cartes par pioche",
  chooseAnother:
    "Choisissez un autre emplacement ou appuyez sur Échap pour choisir une autre carte.",
  columnCard: (card, index) => `${card}, colonne ${index}`,
  columnEmpty: (index) =>
    `Colonne ${index}, vide. Seul un roi peut être placé ici.`,
  dealAgain: "Distribuer une nouvelle partie",
  dealt: (cards) =>
    `Nouvelle partie distribuée, avec une pioche de ${cards} à la fois.`,
  discarded: (reason) =>
    `Votre partie enregistrée n’a pas pu être ouverte ; une nouvelle partie a donc été distribuée. ${reason}`,
  draw: "Piocher",
  drawSetting: (next, current) =>
    `Les nouvelles parties permettront de piocher ${next} à la fois. Cette partie garde une pioche de ${current}.`,
  drawWords: (count) => (count === 1 ? "une carte" : "trois cartes"),
  drawing: (cards) => `Pioche de ${cards} à la fois`,
  earlier: "plus tôt",
  emptyColumn: "Cette colonne est vide. Seul un roi peut être placé ici.",
  emptyFoundation: "Cette fondation est vide. Placez-y d’abord un as.",
  emptyWaste: "La défausse est vide. Piochez d’abord dans la réserve.",
  engineExact: {
    "A saved column is out of order.":
      "Une colonne enregistrée n’est pas dans le bon ordre.",
    "A saved foundation is out of order.":
      "Une fondation enregistrée n’est pas dans le bon ordre.",
    "Only a king can go into an empty column.":
      "Seul un roi peut être placé dans une colonne vide.",
    "Only one card at a time can go onto a foundation.":
      "Une seule carte à la fois peut être placée sur une fondation.",
    "That card can't go onto a foundation yet.":
      "Cette carte ne peut pas encore être placée sur une fondation.",
    "That card can't go there: a foundation starts with an ace.":
      "Cette carte ne peut pas aller là : une fondation commence par un as.",
    "That card is already there.": "Cette carte est déjà à cet endroit.",
    "That card is face down. Turn it over by moving the cards on top of it.":
      "Cette carte est face cachée. Déplacez les cartes au-dessus pour la retourner.",
    "That foundation is empty.": "Cette fondation est vide.",
    "The saved draw setting is not 1 or 3.":
      "Le nombre enregistré de cartes par pioche n’est ni 1 ni 3.",
    "The saved game could not be read.":
      "La partie enregistrée n’a pas pu être lue.",
    "The saved game does not hold exactly one full deck.":
      "La partie enregistrée ne contient pas exactement un jeu complet de cartes.",
    "The saved move counts are negative.":
      "Les nombres de coups enregistrés sont négatifs.",
    "The saved move counts could not be read.":
      "Les nombres de coups enregistrés n’ont pas pu être lus.",
    "The saved recycle limit could not be read.":
      "La limite enregistrée de passages dans la réserve n’a pas pu être lue.",
    "The saved stock has a face-up card.":
      "La réserve enregistrée contient une carte face visible.",
    "The saved table could not be read.":
      "La table enregistrée n’a pas pu être lue.",
    "The saved table is missing.": "La table enregistrée est absente.",
    "The saved waste pile has a face-down card.":
      "La défausse enregistrée contient une carte face cachée.",
    "The waste pile is empty. Draw from the stock first.":
      "La défausse est vide. Piochez d’abord dans la réserve.",
    "There are no cards left to draw.": "Il ne reste aucune carte à piocher.",
    "There is no card there.": "Il n’y a pas de carte à cet endroit.",
    "There is no column there.": "Il n’y a pas de colonne à cet endroit.",
    "There is no foundation there.": "Il n’y a pas de fondation à cet endroit.",
    "There is nothing to undo yet.": "Il n’y a encore rien à annuler.",
    "This is not a saved solitaire game.":
      "Ceci n’est pas une partie de Solitaire enregistrée.",
    "This save comes from a different version of the game.":
      "Cette sauvegarde provient d’une autre version du jeu.",
    "Those cards can't move together: only an unbroken run of alternating colours moves as a group.":
      "Ces cartes ne peuvent pas se déplacer ensemble : seule une suite continue de couleurs alternées peut se déplacer en groupe.",
    "Turned the waste pile over to make a new stock.":
      "La défausse a été retournée pour former une nouvelle réserve.",
    "Undid the last move.": "Le dernier coup a été annulé.",
    "You have already gone through the deck as many times as this game allows.":
      "Vous avez déjà parcouru la réserve autant de fois que cette partie le permet.",
  },
  engineMoreCards: (count) =>
    `et ${count} ${Number(count) > 1 ? "cartes supplémentaires" : "carte supplémentaire"}`,
  enginePatterns: [
    [/^Drew the (?<card>.+)\.$/u, (card) => `Carte piochée : ${card}.`],
    [
      /^Drew (?<count>\d+) cards\. The (?<card>.+) is on top\.$/u,
      (count, card) =>
        `${count} ${Number(count) > 1 ? "cartes piochées" : "carte piochée"}. Carte du dessus : ${card}.`,
    ],
    [
      /^Moved (?<card>.+) to foundation (?<index>\d+)\.$/u,
      (card, index) => `Carte déplacée vers la fondation ${index} : ${card}.`,
    ],
    [
      /^Moved (?<cards>.+) onto (?<top>.+)\.$/u,
      (cards, top) => `Déplacement de ${cards} sur ${top}.`,
    ],
    [
      /^Moved (?<cards>.+) to empty column (?<index>\d+)\.$/u,
      (cards, index) =>
        `Déplacement de ${cards} vers la colonne vide ${index}.`,
    ],
    [
      /^Nothing can go on the (?<card>.+) in a column\.$/u,
      (card) =>
        `Rien ne peut être posé sur cette carte dans une colonne : ${card}.`,
    ],
    [
      /^That card can't go there: it needs a (?<color>red|black) (?<rank>.+)\.$/u,
      (color, rank) =>
        `Cette carte ne peut pas aller là : il faut ${requiredCard(color, rank)}.`,
    ],
    [
      /^That card can't go there: this foundation is for (?<suit>.+)\.$/u,
      (suit) =>
        `Cette carte ne peut pas aller là : cette fondation est réservée à la couleur ${suit}.`,
    ],
    [
      /^That card can't go there: this foundation starts with the (?<card>.+)\.$/u,
      (card) =>
        `Cette carte ne peut pas aller là : cette fondation commence par ${card}.`,
    ],
    [
      /^That foundation is complete: it already ends with the (?<card>.+)\.$/u,
      (card) =>
        `Cette fondation est complète : elle se termine déjà par ${card}.`,
    ],
    [
      /^That card can't go there: this foundation needs the (?<card>.+)\.$/u,
      (card) =>
        `Cette carte ne peut pas aller là : cette fondation attend ${card}.`,
    ],
    [/^The (?<pile>.+) is missing\.$/u, (pile) => `Élément absent : ${pile}.`],
    [
      /^The (?<pile>.+) holds a card that could not be read\.$/u,
      (pile) => `Cet élément contient une carte illisible : ${pile}.`,
    ],
    [
      /^The (?<pile>.+) should have (?<count>\d+) piles\.$/u,
      (pile, count) =>
        `Cet élément doit contenir ${count} ${Number(count) > 1 ? "piles" : "pile"} : ${pile}.`,
    ],
  ],
  engineRevealed: (card) => ` Carte retournée : ${card}.`,
  engineUndoStep: (reason) =>
    `Une étape d’annulation est endommagée : ${reason}`,
  engineWords: {
    ace: "as",
    columns: "colonnes",
    foundations: "fondations",
    jack: "valet",
    king: "roi",
    "next card": "carte suivante",
    pile: "pile",
    queen: "dame",
    stock: "réserve",
    "the card": "la carte",
    "waste pile": "défausse",
  },
  faceDown:
    "Cette carte est face cachée. Déplacez les cartes au-dessus pour la retourner.",
  foundation: (index) => `Fondation ${index}.`,
  foundationCount: (count) =>
    `${count} ${count > 1 ? "cartes" : "carte"} sur 52 dans les fondations`,
  foundationEmpty: (name, card) => `${name}, vide. Elle commence par ${card}.`,
  foundationName: (suit) => `Fondation de ${suit}`,
  foundationTop: (name, card) => `${name}, ${card} au-dessus.`,
  gestures:
    "Touchez une carte pour la sélectionner, puis l’endroit où vous voulez la placer. Si une carte n’a qu’une destination possible, un seul toucher l’y déplace. Touchez à nouveau la carte sélectionnée pour l’envoyer sur une fondation, ou touchez deux fois une carte pour faire de même.",
  guestIntro: "Un jeu tranquille. Aucun compte nécessaire.",
  hint: "Indice",
  hintDraw: "Indice : piochez dans la réserve.",
  hintMove: (source, target) => `Indice : déplacez ${source} ${target}.`,
  howToPlay: "Comment jouer",
  intro: "Un jeu tranquille.",
  key: "Touche",
  keyboard: "Touches du clavier",
  keys: [
    {
      action: "Passer d’une pile ou d’une carte à l’autre",
      keys: "Touches fléchées",
    },
    {
      action: "Sélectionner une carte ou poser la carte sélectionnée",
      keys: "Entrée ou Espace",
    },
    {
      action: "Envoyer la carte sélectionnée sur une fondation",
      keys: "Entrée à nouveau sur la même carte",
    },
    { action: "Reposer la carte", keys: "Échap" },
    { action: "Piocher dans la réserve", keys: "D" },
    { action: "Annuler le dernier coup", keys: "U ou Ctrl+Z" },
    { action: "Afficher un indice", keys: "H" },
    {
      action: "Envoyer toutes les cartes sans risque vers les fondations",
      keys: "F",
    },
  ],
  king: "Roi",
  moves: (count) => `${count} ${count > 1 ? "coups" : "coup"}`,
  newGame: "Nouvelle partie",
  noMovesNote:
    " Il ne reste aucun coup dans cette distribution. Vous pouvez annuler un coup ou commencer une nouvelle partie.",
  noSafeCards:
    "Aucune carte ne peut être envoyée sans risque vers les fondations pour le moment.",
  noUsefulMoves:
    "Il ne reste aucun coup utile. Essayez d’annuler un coup ou commencez une nouvelle partie.",
  nothingSelected: "Aucune carte sélectionnée.",
  onto: (card) => `sur ${card}`,
  putBack: "La carte est reposée. Aucune carte sélectionnée.",
  ranks: [
    "as",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "valet",
    "dame",
    "roi",
  ],
  ready: "Une nouvelle partie est prête. Choisissez une carte pour commencer.",
  resumed: "Votre dernière partie a repris.",
  resumedAt: (date) => `Votre partie, enregistrée ${date}, a repris.`,
  rules:
    "Formez quatre piles de l’as au roi, chacune à l’emplacement marqué de sa couleur (♠ ♥ ♣ ♦). Dans les sept colonnes, placez une carte sur une carte de valeur immédiatement supérieure et de couleur opposée : un 7 rouge sur un 8 noir. Seul un roi peut aller dans une colonne vide. Piochez dans la réserve lorsque vous êtes bloqué.",
  safeCards: "Envoyer les cartes sans risque vers les fondations",
  saveFailed:
    "Ce navigateur ne permet pas d’enregistrer la partie. Votre progression sera perdue si vous fermez cette page.",
  savedHint:
    "Votre partie est enregistrée sur cet appareil après chaque coup, même sans connexion Internet.",
  savedOn: (day, time) => `le ${day} à ${time}`,
  savedToday: (time) => `aujourd’hui à ${time}`,
  scrollHint:
    "Faites défiler la table latéralement pour atteindre toutes les piles, ou tournez votre téléphone pour avoir plus de place.",
  selected: " Sélectionnée.",
  selectedBlocked: (name) =>
    `Carte sélectionnée : ${name}. Aucun emplacement possible pour le moment. Appuyez sur Échap pour la reposer.`,
  selectedTargets: (name, count) =>
    `Carte sélectionnée : ${name}. Elle peut aller à ${count} ${count > 1 ? "emplacements" : "emplacement"}. Choisissez-en un ou appuyez sur Échap.`,
  sentSafe: (count, names) =>
    `${count} ${count > 1 ? "cartes envoyées" : "carte envoyée"} vers les fondations : ${names}.`,
  shuffling: "Mélange des cartes.",
  sourceWithCards: (name, count) =>
    `${name} avec ${count} ${count > 1 ? "cartes" : "carte"} au-dessus`,
  startFresh: "Recommencer à zéro",
  stock: (cards) => `Réserve, ${cards}. Appuyez pour piocher.`,
  stockEmpty: "La réserve est vide.",
  stockRecycle: "La réserve est vide. Appuyez pour retourner la défausse.",
  suggested: " Suggérée par l’indice.",
  suits: {
    clubs: "trèfle",
    diamonds: "carreau",
    hearts: "cœur",
    spades: "pique",
  },
  table: "Table de cartes",
  target: " La carte sélectionnée peut être placée ici.",
  thatCard: "cette carte",
  title: "Solitaire",
  toColumn: (index) => `vers la colonne vide ${index}`,
  toFoundation: "vers une fondation",
  undo: "Annuler",
  waste: "Défausse",
  wasteEmpty: "Défausse vide. Piochez dans la réserve.",
  wasteTop: (card) => `Défausse, ${card} au-dessus.`,
  won: (moves) =>
    `Vous avez gagné en ${moves} ${moves > 1 ? "coups" : "coup"}.`,
  wonNote: (moves) =>
    ` Vous avez gagné en ${moves} ${moves > 1 ? "coups" : "coup"}. Bien joué.`,
};

export { solitaire };
