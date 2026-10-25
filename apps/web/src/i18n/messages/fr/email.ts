import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "À propos des vérifications d’arnaques",
  appointmentAdded:
    "Il a été ajouté à Votre semaine sur votre page Aujourd’hui.",
  appointmentFound: "Rendez-vous trouvé",
  backToInbox: "Retour à la boîte de réception",
  checkAnother: "Vérifier un autre message",
  checkCouldNotFinish: (error) =>
    `La vérification d’arnaque n’a pas pu aboutir. ${error}`,
  checkFirst: "Recherchez les signaux d’alerte courants avant d’agir.",
  checkForNew: "Rechercher de nouveaux courriels",
  checkManually: " Vous pouvez lancer une vérification ci-dessous.",
  checkThis: "Vérifier ce courriel",
  checked: (when) => `Vérifié ${when}`,
  checkedAt: (when) => ` Vérifié ${when}.`,
  checking: "Vérification…",
  checksAutomatic:
    "Si les vérifications de courriels par IA sont activées dans les paramètres, les nouveaux courriels réels peuvent être envoyés à un fournisseur d’IA dans le nuage. Les courriels d’entraînement restent dans LifeLink. Des règles locales limitées à l’anglais sont utilisées si l’IA dans le nuage est désactivée, indisponible ou ne termine pas la vérification. Même si une demande dans le nuage échoue, le fournisseur peut avoir reçu le courriel. Aucune des deux méthodes ne peut vérifier l’expéditeur ni prouver qu’un courriel est sans danger.",
  checksIntro:
    "LifeLink recherche les signes courants d’arnaque dans les nouveaux courriels. Choisissez un message pour le lire et voir ce qui a été relevé.",
  checksTitle: "Comment fonctionnent les vérifications de courriels",
  chooseEmail:
    "Choisissez un courriel pour le lire et voir sa vérification d’arnaque.",
  cloudCheckNotice:
    "L’IA dans le nuage a aidé à vérifier ce courriel. Elle peut se tromper et ne peut pas vérifier l’expéditeur. L’absence de signaux d’alerte ne signifie pas que le courriel est sans danger.",
  cloudConsent:
    "Envoyer ce courriel à un service d’IA dans le nuage pour le résumer et repérer un éventuel rendez-vous. Laissez cette case décochée pour un court aperçu réalisé dans LifeLink.",
  concern:
    "Ce courriel a soulevé une inquiétude. Vérifiez la demande avant d’agir.",
  connectMailbox: "Connecter Gmail ou Outlook",
  connected: (list) => `Connecté : ${list}.`,
  countEmails: (count) => `${count} ${count > 1 ? "courriels" : "courriel"}`,
  empty:
    "Aucun courriel ici pour le moment. Connectez une boîte courriel, puis choisissez « Rechercher de nouveaux courriels » pour importer les messages récents.",
  from: "De ",
  helpMeUnderstand: "Aidez-moi à comprendre",
  inbox: "Boîte de réception",
  linksNotOpened:
    "LifeLink n’ouvre pas les liens dans les courriels. Si un courriel demande de l’argent ou des renseignements privés, vérifiez-le d’abord.",
  loadingEmail: "Chargement du courriel",
  loadingEmails: "Chargement des courriels",
  localLanguageNotice:
    "Cette vérification a utilisé des règles locales conçues uniquement pour l’anglais. Elles peuvent manquer des arnaques en français et dans d’autres langues. L’absence de signaux d’alerte ne signifie pas qu’un courriel est sans danger.",
  lowerPriority: "Moins prioritaire",
  mailboxes: "Vos boîtes courriel",
  mayNeedReply: "Une réponse peut être nécessaire",
  needsAttention: (label, error) =>
    `${label} nécessite votre attention${error ? ` : ${error}` : "."}`,
  newEmails: (count) =>
    count === 0
      ? "Aucun nouveau courriel."
      : `${count} ${count > 1 ? "nouveaux courriels" : "nouveau courriel"}.`,
  noMailbox: "Aucune boîte courriel connectée.",
  noSigns: "Aucun signal d’alerte trouvé. Expéditeur non confirmé.",
  noSubject: "(Sans objet)",
  noSubjectSpoken: "Sans objet",
  noText: "Ce courriel ne contient pas de texte.",
  notChecked: "Pas encore vérifié",
  notCheckedEmail: "Ce courriel n’a pas encore été vérifié.",
  notCheckedNote: "Pas encore vérifié",
  nowTheEmail: "Maintenant, le courriel.",
  openManualCheck: "Ouvrir la vérification manuelle d’arnaque",
  opened: (subject) => `Ouvert : ${subject}`,
  paging: {
    loadOlder: "Charger les courriels plus anciens",
    loading: "Chargement…",
    newer: "Plus récents",
    noMoreImported:
      "Aucun courriel supplémentaire importé. Essayez le lot suivant si des courriels plus anciens sont encore disponibles.",
    noOlder: "Aucun courriel plus ancien disponible.",
    older: "Courriels plus anciens",
    page: (page) => `Page ${page} · Jusqu’à 15 courriels à la fois`,
  },
  preview: "Afficher un court aperçu",
  readSummary: "Lire le résumé à voix haute",
  readingNow: "Lecture en cours…",
  readyToRead: "Prêt à lire",
  reconnect: "Reconnecter",
  reply: "Répondre",
  replyAdded:
    "Réponse ajoutée à votre brouillon. Vous pouvez la modifier avant de la vérifier.",
  replyComposer: {
    nothingSent: (provider) =>
      `Rien n’est envoyé. Vous vérifierez d’abord votre réponse, puis elle sera enregistrée comme brouillon dans votre ${provider}.`,
    placeholder: "Écrivez votre réponse…",
    replyTo: (to) => `Répondre à ${to}`,
    review: "Vérifier le brouillon",
    speak: "Parler",
    stopListening: "Arrêter l’écoute",
  },
  ride: {
    asked: "Vous avez demandé à quelqu’un de vous accompagner.",
    confirmed: "Votre trajet est confirmé.",
    declined: "La demande de trajet a été refusée.",
  },
  sampleEmails:
    " Ce sont des exemples de courriels pour vous entraîner en toute tranquillité.",
  scamCheck: "Vérification d’arnaque",
  scamCheckNotDone: "Vérification d’arnaque pas encore effectuée",
  scamSigns:
    "Ce courriel présente des signes d’arnaque. Veuillez le vérifier avant de faire ce qu’il demande.",
  spokenFrom: (subject, from, body) => `${subject}. De ${from}. ${body}`,
  summarizeCloud: "Résumer avec l’IA dans le nuage",
  summary: "Résumé",
  summaryNote:
    "Obtenez un court aperçu réalisé dans LifeLink ou choisissez l’IA dans le nuage",
  summarySpoken: "Résumé du courriel.",
  theEmail: "Le courriel",
  title: "Courriels",
  unknownCheckNotice:
    "Cette vérification enregistrée ne précise pas si elle a utilisé l’IA dans le nuage ou des règles locales. Les règles locales couvrent uniquement l’anglais et peuvent manquer des arnaques dans d’autres langues. L’absence de signaux d’alerte ne signifie pas que le courriel est sans danger.",
  warning: {
    concern:
      "Ce courriel a soulevé une inquiétude. Vérifiez la demande avant d’agir.",
    intro: (reason) =>
      `Arnaque possible. ${reason} En cas de doute, demandez à une personne de confiance avant de répondre, d’ouvrir un lien, d’envoyer de l’argent ou de partager des renseignements personnels.`,
    signs: (signs) => `Signaux d’alerte : ${signs}.`,
  },
  warningSigns: "Signaux d’alerte",
  warningSignsFound: "Signaux d’alerte trouvés",
  whatShouldIDo: "Que dois-je faire ?",
};

export { email };
