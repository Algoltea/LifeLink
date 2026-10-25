import type { Messages } from "../en";

const voice: Messages["voice"] = {
  captions: "Sous-titres",
  connectionProblem: "La connexion vocale a rencontré un problème.",
  dictationStopped:
    "La dictée s’est arrêtée. Veuillez réessayer ou saisir le texte.",
  emptyRequest: "Rien n’a été préparé car la demande était vide.",
  inputLabel: "Pour quoi souhaitez-vous de l’aide ?",
  lifeLinkSaid: "LifeLink a dit : ",
  microphoneBusy:
    "Une autre application utilise le microphone. Fermez-la et réessayez, ou saisissez le texte.",
  microphoneDenied:
    "LifeLink n’est pas autorisé à utiliser le microphone. Autorisez-le dans les paramètres de votre navigateur pour ce site, ou saisissez le texte.",
  microphoneFailed:
    "Le microphone n’a pas démarré. Veuillez réessayer ou saisir le texte.",
  microphoneMissing:
    "Aucun microphone trouvé. Vérifiez qu’un microphone est connecté ou saisissez le texte.",
  offlineFailed:
    "Cette demande n’a pas pu être enregistrée hors ligne. Vos mots sont toujours ici. Veuillez réessayer une fois connecté.",
  opening: "Ouverture d’un espace pour votre message",
  placeholder: "Demandez à LifeLink…",
  prepareFailed:
    "Cela n’a pas pu être préparé. Veuillez demander à la personne de réessayer ou de saisir le texte.",
  prepared:
    "C’est prêt et affiché à l’écran. Rien ne se passe avant l’approbation sur cet écran.",
  readAloudUnavailable:
    "La lecture à voix haute est indisponible. Veuillez réessayer.",
  retry:
    "Vos mots sont toujours dans la zone de texte. Appuyez sur Envoyer pour réessayer.",
  savedOffline:
    "Enregistré. LifeLink examinera cette demande lorsque vous serez reconnecté.",
  screeningConnectionProblem:
    "La connexion de vérification d’appel a rencontré un problème.",
  screeningDisconnected: "La vérification d’appel a été déconnectée.",
  screeningLost: "La vérification d’appel a perdu sa connexion.",
  screeningMicrophoneStopped:
    "Le microphone s’est arrêté. Relancez la vérification d’appel pour vous reconnecter.",
  screeningResumeFailed:
    "La vérification d’appel n’a pas pu reprendre après l’alerte. Relancez-la.",
  screeningStopped: "La vérification d’appel a été arrêtée.",
  send: "Envoyer",
  sending: "Envoi",
  speak: "Parler",
  speakHint:
    "Appuyez sur Parler pour dicter au lieu d’écrire. Rien n’est envoyé sans votre approbation.",
  speaking: "LifeLink parle…",
  startFailed: (error) =>
    `La fonction vocale n’a pas démarré : ${error} Vous pouvez saisir le texte.`,
  stop: "Arrêter",
  talking:
    "Conversation avec LifeLink. Tout ce qu’il prépare apparaît à l’écran pour votre approbation.",
  unavailable:
    "La fonction vocale est indisponible pour le moment ; veuillez saisir le texte. Rien n’est envoyé sans votre approbation.",
  voiceStopped: "La fonction vocale a été arrêtée.",
  youSaid: "Vous avez dit : ",
};

export { voice };
