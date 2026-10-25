import type { Messages } from "../en";

const callScreening: Messages["callScreening"] = {
  alertOff: "Le son d’alerte est désactivé",
  alertPlayed: "Alerte lue à voix haute",
  alertPlaying: "Lecture de l’alerte à voix haute",
  alertReady: "Alerte prête",
  alertUnavailable:
    "Le son n’a pas pu être lu. Lisez l’avertissement à l’écran.",
  askTrusted: "Demander à une personne de confiance",
  bigger: "Texte plus grand",
  callCaptions: "Ce qui a été entendu pendant l’appel",
  callTime: "après le début de l’appel",
  callback:
    "Si quelque chose vous a semblé suspect, raccrochez et appelez la personne ou l’entreprise à un numéro que vous connaissez déjà et auquel vous faites confiance.",
  callbackAdvice:
    "Si quelque chose vous a semblé suspect, raccrochez et rappelez à un numéro de confiance.",
  caller: "La personne qui appelle",
  cannotConfirm: "Ceci ne permet pas de confirmer qui a appelé.",
  captionSize: "Taille des sous-titres",
  captionSource:
    "Réalisé à partir de sous-titres qui peuvent contenir des erreurs.",
  captions: "Sous-titres",
  captionsEmpty: "Les paroles de l’appel apparaîtront ici.",
  captionsNotSaved:
    "Affichés jusqu’à ce que vous quittiez cette page. Non enregistrés.",
  checkMessage: "Vérifier un message",
  checkingLastPart:
    "Recherche de signaux d’alerte dans la dernière partie de l’appel…",
  checksUnavailable:
    "La recherche de signaux d’alerte est indisponible pour le moment. Les paroles de l’appel continuent d’apparaître ci-dessous.",
  clearTitle: "Aucun signal d’alerte entendu",
  close: "Fermer",
  codes:
    "les demandes de code, de mot de passe ou de renseignements personnels",
  connectionError:
    "La connexion d’écoute s’est interrompue. Vos sous-titres sont toujours ici. Appuyez sur Recommencer pour poursuivre l’écoute, ou sur Terminer pour enregistrer un résumé.",
  consent:
    "Je comprends que le son et les paroles de l’appel seront envoyés à des services d’IA dans le nuage pendant cette vérification.",
  credentialsReason:
    "Une demande de partage d’un code de vérification ou d’un mot de passe.",
  delete: "Supprimer le résumé",
  deleteError: "Le résumé n’a pas pu être supprimé. Réessayez.",
  deleteNotice:
    "Supprimer ce résumé ne supprime pas les messages que vous avez préparés ou envoyés.",
  deleting: "Suppression…",
  discard: "Ne pas conserver le résumé",
  earlierAria: "Vérifications d’appels précédentes",
  finish: "Terminer",
  finishSave: "Terminer et enregistrer le résumé",
  flagged: "Ce que LifeLink a signalé",
  flaggedAdvice:
    "Ne partagez pas de codes et n’envoyez pas d’argent. Raccrochez et rappelez à un numéro que vous connaissez déjà et auquel vous faites confiance.",
  flaggedBody: "La personne a fait des demandes fréquentes chez les escrocs.",
  flaggedTitle: (count) =>
    `${count} ${count > 1 ? "signaux d’alerte entendus" : "signal d’alerte entendu"}`,
  gettingReady: "Préparation…",
  guideCaution:
    "Des signaux d’alerte peuvent passer inaperçus. Si un appel vous semble suspect, raccrochez et rappelez à un numéro que vous connaissez déjà et auquel vous faites confiance.",
  guideTitle: "LifeLink peut vous avertir à voix haute en cas de :",
  hangUpFirst:
    "Vous pouvez tout à fait dire « Je vous rappelle » et raccrocher d’abord.",
  heard: "Ce que LifeLink a entendu",
  heardText: (heardWords) => {
    if (heardWords === undefined) {
      return "Rien de ce que LifeLink a entendu ne correspondait aux demandes courantes des escrocs.";
    }

    const words =
      heardWords === 1
        ? "1 mot"
        : `environ ${heardWords} ${heardWords > 1 ? "mots" : "mot"}`;

    return `LifeLink a entendu ${words}. Aucune de ces paroles ne correspondait aux demandes courantes des escrocs.`;
  },
  help: "Je viens de recevoir un appel dont je ne suis pas sûr. Pourriez-vous m’aider à vérifier s’il était authentique avant que je partage des informations ou envoie de l’argent ?",
  interrupted:
    "La connexion s’est interrompue pendant cette vérification. Seules les parties entendues par LifeLink ont été vérifiées.",
  intro:
    "LifeLink affiche les paroles de l’appel à l’écran, demande à l’IA d’y rechercher des signes d’arnaque et vous avertit à voix haute s’il en trouve.",
  languageLimit:
    "Les appels en direct utilisent l’IA dans le nuage. Les vérifications locales de texte reposent toujours sur des formulations en anglais ; traduire l’interface n’étend pas leur couverture de détection. Le scénario d’entraînement et l’alerte vocale sont en anglais. Les sous-titres et les paroles citées gardent leur langue d’origine.",
  listenTitle: "Écouter un appel",
  listening: "LifeLink écoute",
  liveCall: "Appel en direct",
  messageReview: "Message à vérifier",
  mixedVoices:
    "Ces sous-titres mélangent les deux voix et peuvent contenir des erreurs.",
  money: "les demandes d’argent ou de cartes-cadeaux",
  moneyReason:
    "Une demande d’envoi d’argent ou de paiement par cartes-cadeaux.",
  mute: "Couper le son d’alerte",
  noWarnings: "Aucun signal d’alerte détecté",
  noWarningsYet: " · Aucun signal d’alerte détecté pour le moment",
  notConfigured:
    "Les vérifications d’appels en direct ne sont pas encore configurées. Vous pouvez essayer un appel d’entraînement ou saisir les paroles de la personne qui appelle.",
  notSafe:
    "Cela ne signifie pas que l’appel était sans danger. LifeLink peut manquer des signaux d’alerte et ne peut pas vérifier qui a appelé.",
  openStep: "Gardez cet écran ouvert pendant que vous parlez.",
  otherDevice:
    "Si votre téléphone ne peut pas utiliser le microphone pendant un appel, ouvrez LifeLink sur un autre appareil.",
  outcomeLabels: {
    clear: "Aucun signal d’alerte détecté",
    flagged: "Signaux d’alerte détectés",
    silent: "Rien n’a été entendu",
    unchecked: "Vérification incomplète",
  },
  partlyChecked:
    "Une partie de cet appel n’a pas pu être vérifiée ; il peut donc y avoir d’autres signaux d’alerte.",
  paused:
    "L’écoute s’interrompt pendant l’alerte pour éviter que LifeLink entende son propre avertissement.",
  permissionDenied:
    "L’accès au microphone n’a pas été autorisé. Autorisez-le dans les paramètres du site de votre navigateur, puis réessayez. Vous pouvez aussi essayer un appel d’entraînement.",
  phoneCall: "Appel téléphonique",
  potentialScam: "Arnaque possible.",
  practice: "Entraînement",
  practiceCall: "Appel d’entraînement",
  practiceCaptionSource:
    "Il s’agit des paroles prévues dans le scénario d’entraînement.",
  practiceCaptions: "Ce qui se dit",
  practiceExplanation:
    "Cet appel est fictif. Aucun microphone ni service d’IA dans le nuage n’est utilisé.",
  practiceFlaggedBody:
    "Dans l’appel d’entraînement, la personne a fait des demandes fréquentes chez les escrocs.",
  practiceHeard: "Paroles de l’appel d’entraînement",
  practiceHelp:
    "J’ai essayé l’appel d’arnaque fictif de LifeLink. Pourrions-nous parler de ce qu’il faut faire si un appel de ce genre se présente ?",
  practiceMode:
    "Le mode entraînement est activé. Essayez l’appel fictif ci-dessous, sans microphone.",
  practicePlaying: "Lecture de l’appel d’entraînement",
  practicePrivacy:
    "Aucun microphone ni service d’IA dans le nuage n’est utilisé. Un court résumé est enregistré dans Vérifications précédentes.",
  practiceSaved:
    "L’appel d’entraînement n’utilise aucun microphone ni service d’IA dans le nuage. Son court résumé est enregistré dans Vérifications précédentes.",
  practiceSilentBody:
    "L’appel d’entraînement s’est terminé avant toute parole ; il n’y avait donc rien à vérifier.",
  practiceSilentTitle: "Entraînement arrêté trop tôt",
  practiceSource: "Réalisé à partir du scénario d’entraînement.",
  practiceSummary: "Résumé de l’appel d’entraînement",
  practiceTime: "après le début",
  practiceVoices:
    "Les voix d’entraînement sont identifiées. Les sous-titres d’un vrai appel mélangent les deux voix sans les identifier.",
  privacy:
    "LifeLink n’enregistre pas les appels. Le son de votre microphone est envoyé à Gemini de Google pour produire les sous-titres. Ceux-ci sont ensuite envoyés à un modèle d’IA qui recherche des signaux d’alerte. À l’arrêt, LifeLink enregistre un court résumé des signaux d’alerte, pas les sous-titres.",
  protect:
    "Ne partagez pas de codes, de mots de passe ni d’argent. Demandez à une personne de confiance.",
  quoteNotice:
    "Les citations peuvent contenir des erreurs. Les longs numéros sont masqués.",
  readResult: "Lire le résultat à voix haute",
  remote: "les demandes de contrôle de votre ordinateur ou de votre téléphone",
  remoteReason: "Une demande d’autorisation d’accès à distance à un appareil.",
  retrySave: "Réessayer l’enregistrement",
  retrySteps: [
    "Mettez l’appel en haut-parleur.",
    "Gardez le téléphone près de cet appareil.",
    "Relancez la vérification d’appel avant de répondre.",
  ],
  retryTitle: "Pour réessayer",
  review: "Vérifier",
  saveError:
    "Le résumé n’a pas pu être enregistré. Gardez cette page ouverte et réessayez.",
  saving: "Enregistrement de votre résumé…",
  scamWarning: "Cela ressemble à une arnaque.",
  screenAnotherCall: "Vérifier un autre appel",
  secrecyReason:
    "Une demande de secret accompagnée de pression pour agir dans l’urgence.",
  silentBody:
    "Aucune parole n’est parvenue à LifeLink ; il n’a donc pas pu rechercher de signaux d’alerte dans cet appel.",
  silentTitle: "LifeLink n’a pas entendu l’appel",
  smaller: "Texte plus petit",
  soundUnavailable:
    "Le son est indisponible. Les signaux d’alerte apparaîtront toujours à l’écran.",
  speakerStep: "Mettez l’appel en haut-parleur près de cet appareil.",
  start: "Commencer à écouter",
  startAgain: "Recommencer",
  startError:
    "LifeLink n’a pas pu commencer l’écoute. Réessayez ou essayez un appel d’entraînement.",
  startStep: "Appuyez sur Commencer à écouter et autorisez le microphone.",
  stop: "Arrêter",
  stopListening: "Arrêter l’écoute",
  stopPractice: "Arrêter l’appel d’entraînement",
  stopped: "L’écoute est arrêtée",
  summary: "Résumé de l’appel",
  summaryNoWarnings: "Aucun signal d’alerte n’a été détecté.",
  summarySaved:
    "Enregistré dans Vérifications précédentes sous forme de court résumé. Aucun son ni sous-titre n’est conservé.",
  summaryStorage:
    "Seul un court résumé est enregistré dans Vérifications précédentes. Aucun son ni sous-titre n’est conservé.",
  summaryWarnings: "Cet appel présentait des signaux d’alerte.",
  tellTrusted: "En parler à une personne de confiance",
  timeLimit:
    "La vérification s’est arrêtée après 30 minutes. Voici le résumé jusqu’à cet instant.",
  times:
    "Les horaires indiquent les minutes et secondes écoulées depuis le début de la vérification. Les longs numéros sont masqués.",
  tryPractice: "Essayer un appel d’entraînement",
  uncheckedBody:
    "Certaines paroles n’ont pas pu être vérifiées ; des signaux d’alerte peuvent donc manquer dans ce résumé.",
  uncheckedTitle: "LifeLink n’a pas pu vérifier cet appel entièrement",
  unmute: "Activer le son d’alerte",
  urgency: "les menaces, ou la pression pour agir vite et garder un secret",
  warningReasons: {
    codes_or_passwords:
      "Une demande de partage d’un code de vérification ou d’un mot de passe.",
    gift_cards:
      "Une demande de paiement par cartes-cadeaux ou de partage de leurs codes.",
    money: "Une demande d’envoi d’argent ou de déplacement de vos économies.",
    personal_details: "Une demande de renseignements personnels ou bancaires.",
    remote_access:
      "Une demande d’autorisation d’accès à distance à un appareil.",
    secrecy_or_pressure:
      "Une demande de secret ou une pression pour agir immédiatement.",
    threats: "Une menace d’arrestation, d’amende ou de fermeture de compte.",
  },
  warningSign: "Signal d’alerte",
  warnings: "Signaux d’alerte détectés",
  you: "Vous",
};

export { callScreening };
