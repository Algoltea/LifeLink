import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Fermer l’explication",
  cloud:
    "Lecture par l’IA dans le nuage, demandée avec votre autorisation. Chaque citation a été comparée au message.",
  cloudConsent:
    "Utiliser l’assistant dans le nuage pour une explication plus complète. Le texte du message sera envoyé au fournisseur d’IA. Laissez cette case décochée pour une lecture locale.",
  cloudConsentWithNotes:
    "Utiliser l’assistant dans le nuage pour une explication plus complète. Le texte du message et vos notes sur l’aide que vous préférez seront envoyés au fournisseur d’IA. Laissez cette case décochée pour une lecture locale.",
  dateSpoken: (quote, date) =>
    `Date mentionnée : ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Dates et heures mentionnées",
  droppedNote:
    "Certains détails donnés par l’assistant ne figuraient pas mot pour mot dans le message ; ils sont donc présentés comme des suppositions ou omis.",
  explainAgainWithCloud: "Expliquer à nouveau avec l’IA dans le nuage",
  explainThis: "Expliquer ce message",
  explainWithCloud: "Expliquer avec l’IA dans le nuage",
  facts: "Ce que dit le message",
  guessNote: "Ce sont des suppositions, pas des affirmations du message.",
  guessSpoken: (text) => `Une supposition : ${text}`,
  guesses: "Ce que cela pourrait vouloir dire",
  inPlainWords: "En termes simples",
  intro:
    "LifeLink peut expliquer ce que ce message demande, les dates qu’il mentionne et ce qu’il ne précise pas.",
  loading: "Chargement de l’explication",
  local: {
    chosen:
      "Lecture locale : fondée sur des formulations reconnues, sans compréhension complète. Rien n’a été envoyé à un fournisseur d’IA.",
    failed:
      "Lecture locale. Vous avez demandé une lecture dans le nuage, mais elle n’a pas abouti. Le fournisseur a peut-être déjà reçu ce message.",
    limit:
      "Lecture locale. La limite quotidienne de lectures dans le nuage a été atteinte ; rien de plus n’a donc été envoyé.",
    practice:
      "Entraînement : explication réalisée dans LifeLink. Les messages d’entraînement ne sont jamais envoyés à un fournisseur d’IA.",
    unavailable:
      "Lecture locale. L’assistant dans le nuage n’est pas configuré ; rien n’a donc été envoyé à un fournisseur d’IA.",
  },
  localLanguageNotice:
    "Les explications locales fondées sur des règles sont en anglais et n’ont pas encore été traduites. Une explication dans le nuage peut être rédigée dans la langue choisie. Les citations du message d’origine restent inchangées.",
  missing: "Pas encore précisé",
  missingSpoken: (detail) => `Pas encore précisé : ${detail}`,
  onlyYou:
    "Vous seul pouvez voir ceci. Ce n’est jamais envoyé ni partagé avec votre famille.",
  part: "Partie",
  practiceNote:
    "En mode entraînement, LifeLink lit le message localement. Les messages d’entraînement ne sont jamais envoyés à un fournisseur d’IA.",
  readAloud: "Lire l’explication à voix haute",
  readReply: "Lire cette réponse à voix haute",
  reading: "Lecture du message…",
  replies: "Réponses possibles",
  repliesHint:
    "Rien n’est envoyé. La réponse est ajoutée à votre zone de message, où vous pouvez la modifier et la vérifier avant toute action.",
  requestSpoken: (text, quote) =>
    `La demande : ${text} Dans les mots du message : ${quote}.`,
  requests: "Ce qui est demandé",
  title: "De l’aide pour comprendre ce message",
  useReply: "Utiliser cette réponse",
  useReplyLabel: (label) => `Utiliser cette réponse : ${label}`,
};

export { explanation };
