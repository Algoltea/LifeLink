import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "À propos de cette vérification",
  adviceNote:
    "Ce conseil provient du message lui-même ; il n’est donc pas compté comme signal d’alerte",
  adviceTitle: "Conseils dans le message lui-même",
  allWords: "Tout le texte lu par LifeLink",
  cannotProve:
    "Ce résultat ne peut pas prouver qu’un message est authentique. Confirmez les demandes inattendues auprès d’un contact que vous connaissez déjà.",
  checkDidNotFinish: "La vérification n’a pas abouti",
  checkingMessage: "Vérification de votre message…",
  compareWithPhoto: "Comparez le texte à votre photo",
  confidence: {
    high: "Plusieurs éléments soutiennent cette évaluation. Elle ne permet toujours pas de vérifier l’expéditeur.",
    low: "Les informations ne suffisent pas pour être sûr. Un second avis peut aider.",
    medium:
      "Certains éléments soutiennent cette évaluation. Vérifiez la demande par un autre moyen.",
  },
  couldNotRead: "LifeLink n’a pas pu lire clairement cette photo",
  delete: "Supprimer cette vérification",
  deleteConfirm:
    "Supprimer cette vérification ? Elle sera retirée des Vérifications précédentes.",
  deleting: "Suppression…",
  howChecked: "Comment la vérification a été effectuée",
  imageUnverified:
    "Ces mots ont été lus sur une photo et peuvent être incorrects ou incomplets. LifeLink n’a pas pu les comparer au texte d’origine. Vérifiez-les sur votre photo.",
  keep: "Conserver cette vérification",
  kinds: {
    email: "Un courriel",
    screenshot: "Une photo ou une capture d’écran",
    text: "Un message",
  },
  localLanguageNotice:
    "Cette vérification locale est conçue uniquement pour l’anglais. Elle peut manquer des arnaques en français et dans d’autres langues. L’absence de signaux d’alerte ne signifie pas qu’un message est sans danger.",
  method: {
    cloud:
      "Un service d’IA dans le nuage a aidé à cette vérification, avec votre autorisation.",
    cloudOld:
      "Un service d’IA dans le nuage a aidé à cette ancienne vérification. Les détails de l’autorisation n’ont pas été conservés avec ce résultat.",
    rules:
      "LifeLink a utilisé des règles de détection courantes. Le message n’a pas été envoyé à un service d’IA dans le nuage pour cette vérification.",
    rulesFallback:
      "LifeLink a utilisé des règles de détection courantes car l’IA dans le nuage était indisponible ou n’a pas terminé. Le service a peut-être déjà reçu ce contenu.",
    rulesOld:
      "LifeLink a utilisé des règles de détection courantes. Cet ancien résultat ne précise pas si un service d’IA dans le nuage a aussi reçu le message.",
  },
  newPhoto: "Prendre une nouvelle photo",
  noFullWording:
    "Le texte complet n’a pas été enregistré avec cette vérification. Les citations ci-dessus ne constituent pas une transcription complète. Comparez-les à votre photo ou saisissez le texte pour une nouvelle vérification.",
  noSigns:
    "Aucun signal d’alerte clair n’a été trouvé. Cela ne prouve pas que ce message est authentique.",
  noStepsHint:
    "Avant de donner suite à une demande inattendue, vérifiez auprès d’une personne que vous connaissez, en utilisant ses coordonnées enregistrées.",
  originalEmail: "Courriel d’origine",
  originalMessage: "Message d’origine",
  photo: {
    alt: "La photo utilisée pour cette vérification",
    larger: "Agrandir la photo",
    noPreview:
      "L’aperçu de la photo n’est pas disponible pour cette vérification. ",
    readSaved: "Vous pouvez toujours lire le résultat enregistré.",
    reopen: "Essayez de rouvrir la vérification.",
    see: "Voir la photo",
    smaller: "Réduire la photo",
    smallerAria: "Réduire la photo",
  },
  photoRetention: {
    old: "Cette ancienne vérification n’a pas d’aperçu photo enregistré. La supprimer retire le résultat ; l’ancienne photo peut rester stockée.",
    owned:
      "Votre photo est conservée avec cette vérification. Supprimer la vérification supprime aussi la photo, sauf si une autre vérification ou photo enregistrée l’utilise encore.",
  },
  readAloud: "Lire le résultat à voix haute",
  readingPhoto: "Lecture du texte de votre photo…",
  recoveryMessage:
    "Abordez ce message avec prudence. Vous pouvez lancer une nouvelle vérification ou demander à une personne de confiance.",
  recoveryPhoto:
    "Essayez une photo plus nette, bien éclairée, avec tout le texte visible, ou saisissez le texte. Cette vérification ne peut pas vous dire si le message est authentique.",
  removedQuotes:
    "Certains mots relevés par l’assistant ne figuraient pas dans le message ; ils ne sont donc pas affichés.",
  savedWording: "Le texte enregistré avec cette vérification",
  signCount: (count) =>
    `${count} ${count > 1 ? "signaux d’alerte" : "signal d’alerte"}`,
  signsNoteMessage: "Ce qui a été relevé dans ce message",
  signsNotePhoto: "Avec les mots lus par LifeLink sur votre photo",
  step: "Étape",
  titles: {
    email: "Votre vérification de courriel",
    screenshot: "Votre vérification de photo",
    text: "Votre vérification de message",
  },
  typeWords: "Saisir le texte à la place",
  verdicts: {
    likely_safe: "Aucun signal d’alerte clair",
    likely_scam: "Probablement une arnaque",
    suspicious: "Signaux d’alerte trouvés",
    unsure: "Non vérifié",
  },
  waitHint:
    "Cela prend généralement quelques secondes. Gardez cette page ouverte. En attendant, n’utilisez pas les liens ou numéros de téléphone du message et ne payez personne.",
  whatNow: "Que faire maintenant",
};

export { scamResult };
