import {
  cardName as englishCardName,
  RANKS,
  SUITS,
} from "@lifelink/solitaire/cards";
import type { CardIdentity } from "@lifelink/solitaire/cards";

import { currentMessages, getLocale } from "@/i18n/locale";

const CARD_NAME =
  /\b(?:ace|[2-9]|10|jack|queen|king) of (?:clubs|diamonds|hearts|spades)\b/gu;

const EXTRA_CARDS = /\band (?<count>\d+) more cards?\b/gu;

const ENGINE_WORDS =
  /\b(?:next card|the card|waste pile|stock|foundations|columns|pile|ace|jack|queen|king|clubs|diamonds|hearts|spades)\b/gu;

const REVEAL = /^(?<description>.*) Turned over the (?<card>.+)\.$/u;
const UNDO_STEP = /^An undo step is damaged: (?<reason>.+)$/u;

export const cardName = (card: CardIdentity): string => {
  const t = currentMessages().solitaire;

  return t.cardName(
    t.ranks[card.rank - 1] ?? String(card.rank),
    t.suits[card.suit]
  );
};

const translateCardWords = (message: string): string => {
  const t = currentMessages().solitaire;

  return message
    .replace(CARD_NAME, (name) => {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          if (englishCardName({ rank, suit }) === name) {
            return cardName({ rank, suit });
          }
        }
      }

      return name;
    })
    .replace(EXTRA_CARDS, (_match, count: string) => t.engineMoreCards(count))
    .replace(ENGINE_WORDS, (word) => {
      const suit = SUITS.find((item) => item === word);

      return suit ? t.suits[suit] : (t.engineWords[word] ?? word);
    });
};

export const translateGameMessage = (message: string): string => {
  if (getLocale() === "en") {
    return message;
  }

  const t = currentMessages().solitaire;
  const exact = t.engineExact[message];

  if (exact !== undefined) {
    return exact;
  }

  const undoStep = UNDO_STEP.exec(message);

  if (undoStep?.[1]) {
    return t.engineUndoStep(translateGameMessage(undoStep[1]));
  }

  const reveal = REVEAL.exec(message);

  if (reveal?.[1] && reveal[2]) {
    return `${translateGameMessage(reveal[1])}${t.engineRevealed(translateCardWords(reveal[2]))}`;
  }

  const localized = translateCardWords(message);

  for (const [pattern, replace] of t.enginePatterns) {
    const match = pattern.exec(localized);

    if (match) {
      return replace(...match.slice(1));
    }
  }

  return message;
};
