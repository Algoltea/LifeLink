import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "Convenu",
  agreedSpoken: (text) => `Convenu : ${text}`,
  changedNote:
    "Certains détails donnés par l’assistant ne figuraient pas mot pour mot dans les messages, ou étaient des propositions plutôt que des accords ; ils ont donc été modifiés ou omis.",
  close: "Fermer le récapitulatif",
  cloud:
    "Récapitulatif par l’IA dans le nuage, demandé avec votre autorisation. Chaque citation a été comparée aux messages.",
  cloudConsent:
    "Utiliser l’assistant dans le nuage pour un récapitulatif plus complet. Vos messages récents avec cette personne seront envoyés au fournisseur d’IA. Laissez cette case décochée pour un récapitulatif rapide réalisé dans LifeLink.",
  done: "Terminé",
  doneFromRecords:
    "D’après les données de LifeLink, et non ce que disent les messages.",
  inShort: "En quelques mots",
  intro: (contactName) =>
    `LifeLink peut résumer ce que vous et ${contactName} avez convenu, ce qui a seulement été proposé et ce qui reste en suspens.`,
  loading: "Chargement du récapitulatif",
  local: {
    chosen:
      "Récapitulatif rapide réalisé dans LifeLink : fondé sur des formulations reconnues, sans compréhension complète. Rien n’a été envoyé à un fournisseur d’IA.",
    failed:
      "Récapitulatif rapide réalisé dans LifeLink. Vous avez demandé un récapitulatif dans le nuage, mais il n’a pas abouti. Le fournisseur a peut-être déjà reçu ces messages.",
    limit:
      "Récapitulatif rapide réalisé dans LifeLink. La limite quotidienne de récapitulatifs dans le nuage a été atteinte ; rien de plus n’a donc été envoyé.",
    practice:
      "Entraînement : récapitulatif rapide réalisé dans LifeLink. Les messages d’entraînement ne sont jamais envoyés à un fournisseur d’IA.",
    unavailable:
      "Récapitulatif rapide réalisé dans LifeLink. L’assistant dans le nuage n’est pas configuré ; rien n’a donc été envoyé à un fournisseur d’IA.",
  },
  messageTo: (contactName) => `Message à ${contactName}`,
  nextSteps: "Prochaines étapes possibles",
  nextStepsHint:
    "Rien ne se passe avant que vous prépariez une étape, la vérifiiez et l’approuviez.",
  noFinishedTasks: (contactName) =>
    `LifeLink n’a aucune tâche terminée avec ${contactName} pour cette période. Ce qu’un message affirme n’est pas considéré comme accompli.`,
  offerNote:
    "Une proposition ne devient un accord que lorsque l’autre personne dit oui.",
  offered: "Proposé, pas encore convenu",
  offeredSpoken: (text) => `Proposé, pas encore convenu : ${text}`,
  onlyYou:
    "Vous seul pouvez voir ceci. Ce n’est jamais envoyé ni partagé avec votre famille.",
  part: "Partie",
  practiceNote:
    "En mode entraînement, LifeLink prépare lui-même le récapitulatif. Les messages d’entraînement ne sont jamais envoyés à un fournisseur d’IA.",
  prepare: "Préparer pour vérification",
  prepared: "Prêt. Vérifiez-le",
  readAloud: "Lire le récapitulatif à voix haute",
  reading: "Lecture de la conversation…",
  recapAgain: "Récapituler à nouveau",
  recapThis: "Récapituler cette conversation",
  recapWithCloud: "Récapituler avec l’IA dans le nuage",
  reminderForYou: "Un rappel pour vous",
  stillUnclear: "Encore incertain",
  title: (contactName) => `Récapitulatif avec ${contactName}`,
  unclearSpoken: (text) => `Encore incertain : ${text}`,
  you: "Vous",
};

export { recap };
