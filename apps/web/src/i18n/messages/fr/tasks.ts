import type { Messages } from "../en";

const tasks: Messages["tasks"] = {
  alsoWaiting: "Attend aussi votre attention",
  answerFirst: "Répondez d’abord à la question ci-dessus.",
  approve: {
    calendar_event: "Approuver et ajouter",
    confirm_arrangement: "Confirmer le trajet",
    create_reminder: "Enregistrer le rappel",
    drive_note: "Approuver et enregistrer",
    email_draft: "Approuver et enregistrer le brouillon",
    email_reply: "Approuver et envoyer",
    family_update: "Partager les nouvelles",
    grocery_handoff: "Approuver la demande",
    send_message: "Approuver et envoyer",
  },
  approveAgain:
    "Quelque chose a changé après votre approbation. Veuillez vérifier et approuver à nouveau.",
  approvedWaiting: "Approuvé. En attente du démarrage…",
  approving: "Approbation…",
  askAgainIfChanged:
    "Si quelque chose change après votre approbation, comme l’heure ou le destinataire, LifeLink vous redemandera votre accord.",
  backToToday: "Retour à Aujourd’hui",
  breadcrumb: "Fil d’Ariane",
  cancelEditing: "Annuler les modifications",
  cancelRequest: "Annuler cette demande",
  cancelled: "Vous avez annulé cette demande. Rien n’a été envoyé.",
  cancelling: "Annulation…",
  changeWords: "Modifier le texte",
  changesSaved:
    "Modifications enregistrées. Vérifiez le message mis à jour avant de l’approuver.",
  checkNow: "Vérifier maintenant",
  checkedForYou: "Vérifié pour vous",
  checking: "Vérification…",
  checks: {
    appointment: (title, day, time) =>
      `Le jour et l’heure correspondent à ${title}, le ${day} à ${time}.`,
    contact: (name, relationship) =>
      `${name} figure dans vos contacts (${relationship}).`,
    hasLink:
      "Ce message contient un lien. Vérifiez que vous souhaitiez l’inclure.",
    noLinks: "Aucun lien dans le message.",
    nothingUnclear: "Aucune incertitude sur la personne ou le moment.",
    trusted: "de confiance",
  },
  couldNotTell:
    "Nous n’avons pas pu le déterminer ici. Veuillez vérifier, par exemple auprès de la personne, et nous indiquer :",
  detailsChanged:
    "Les détails ont changé pendant votre modification. Vos modifications sont conservées ici. Comparez-les à la dernière version avant d’enregistrer.",
  detailsGone: "Ces détails ne sont plus disponibles.",
  didNotGoThrough: "Cette action n’a pas abouti.",
  done: "Terminé",
  earlierVersionHide: "Masquer la version précédente",
  earlierVersionShow: "Afficher la version précédente",
  goToCircle: "Aller au Cercle de confiance",
  heading: {
    approveSubline: "Rien ne se passe sans votre approbation.",
    approveTitle: "Vérifiez, puis approuvez",
    completedSubline: "Tout est terminé pour cette demande.",
    confirmSubline: (who) =>
      `${who} a répondu. Vérifiez l’heure, puis confirmez.`,
    confirmTitle: "Confirmer le trajet",
    sendSubline: (who) =>
      `Rien n’est envoyé à ${who} avant votre appui sur Approuver. Vous pouvez d’abord modifier le texte.`,
    sendTitle: "Lisez ceci avant l’envoi",
    standsSubline: "Voici où en est cette demande.",
    waitingSubline: (who) =>
      `Votre message a été envoyé. La réponse de ${who} apparaîtra ici dès son arrivée.`,
    waitingTitle: (who) => `En attente de ${who}`,
  },
  howItWent: "Ce qui s’est passé",
  inProgress: "En cours",
  itArrived: "Le message est arrivé",
  itDidNotArrive: "Le message n’est pas arrivé",
  keepMyEdits: "Conserver mes modifications",
  latestWording: "Voir la dernière version du texte",
  loadingDetails: "Chargement des détails de la tâche",
  loadingLatest: "Chargement des derniers détails",
  loadingRequest: "Chargement des détails de la demande",
  messageText: "Texte du message",
  messages: "Messages",
  noLongerEditable:
    "Cette demande ne peut plus être modifiée. Votre texte non enregistré est conservé ici pour que vous puissiez le copier.",
  notFound: "Cet élément est introuvable.",
  notSure: "Nous ne savons pas si cette action a abouti.",
  notSureDetail:
    "Le service n’a pas confirmé ce qui s’est passé. LifeLink garde ce résultat comme incertain pour éviter de laisser croire qu’une nouvelle tentative est sans risque.",
  nothingNeedsYou: "Rien ne nécessite votre intervention pour le moment.",
  nothingToApprove: "Rien à approuver ici.",
  nothingToApproveRequest: "Il n’y a rien à approuver pour cette demande.",
  nothingWasSent:
    "Rien n’a été envoyé ; vous pouvez donc réessayer sans risque.",
  offlineApprovalFailed:
    "Cette approbation n’a pas pu être enregistrée hors ligne. Veuillez approuver à nouveau une fois connecté.",
  offlineApprovalSaved:
    "Enregistré pour votre prochaine connexion. LifeLink vérifiera à nouveau tous les détails avant l’envoi.",
  openReceipt: "Ouvrir le reçu",
  outcomeError: (error) => `${error} Veuillez réessayer.`,
  practiceApproval:
    " Mode entraînement : l’approbation montre ce qui se passerait ; rien de réel n’est envoyé.",
  progress: "Avancement",
  progressAndNext: "Avancement et prochaines étapes",
  recordedOutcome: "Résultat enregistré",
  reminderShare: "Permettre à mon cercle de confiance de voir ce rappel",
  reminderShareAria: "Partager ce rappel avec mon cercle de confiance",
  reminderShareHint:
    "Uniquement les personnes avec qui vous partagez vos rappels.",
  replied: (who) => `${who} a répondu`,
  reviewStatus: {
    approved: "Approuvé",
    awaiting_approval: "Vérifiez ces détails",
    cancelled: "Annulé",
    executing: "En cours",
    failed: "N’a pas abouti",
    succeeded: "Terminé",
    unknown: "Résultat non confirmé",
  },
  savedApproveAgain:
    "Enregistré. Le texte ayant changé, veuillez approuver à nouveau.",
  savingOutcome: "Enregistrement du résultat…",
  seeDetails: "Voir les détails",
  sendAll: {
    back: "Retour",
    confirm: (count: number) => `Tout envoyer (${count})`,
    finishEdits:
      "Enregistrez ou annulez vos modifications avant de tout envoyer.",
    intro:
      "Chaque personne reçoit son propre message, par le moyen qu’elle préfère.",
    practiceConfirm: (count: number) =>
      `Entraînement : tout envoyer (${count})`,
    practiceReview: (count: number) =>
      `Entraînement : vérifier et tout envoyer (${count})`,
    recipient: (name: string, channel: string) => `${name}, par ${channel}`,
    reconnect: "Reconnectez-vous pour tout envoyer.",
    resolveFirst:
      "Certains messages attendent d’abord votre réponse. Vous pouvez encore envoyer les messages prêts un par un.",
    review: (count: number) => `Vérifier et tout envoyer (${count})`,
    sending: "Envoi en cours…",
    summaryHint: "Rien ne part avant que vous appuyiez sur Tout envoyer.",
    summaryTitle: (count: number) => `Envoyer ces ${count} messages ?`,
  },
  sentStatus: { sent: "envoyé" },
  sentWaiting:
    "Votre message a été envoyé. La réponse apparaîtra dès son arrivée.",
  shoppingRetired: "Les demandes d’achats ne peuvent plus être approuvées.",
  spectrumUnknown:
    "Nous ne pouvons toujours pas confirmer ce message. Demandez à la personne s’il est arrivé. S’il n’est pas encore arrivé, il peut arriver plus tard ; LifeLink conservera son état incertain.",
  status: {
    awaiting_approval: "À vous",
    cancelled: "Annulé",
    completed: "Terminé",
    in_progress: "En cours",
    needs_attention: "À vérifier",
    needs_clarification: "Une question pour vous",
    waiting_for_reply: "En attente d’une réponse",
  },
  stepByStep: "Étape par étape",
  steps: {
    awaiting_approval: "Votre intervention est nécessaire",
    failed: "N’a pas fonctionné",
    pending: "Plus tard",
    running: "En cours",
    skipped: "Pas nécessaire",
    succeeded: "Terminé",
    unknown: "Résultat incertain",
    waiting: "En attente",
  },
  them: "cette personne",
  they: "Cette personne",
  unclearReply: (who) =>
    `Nous n’avons pas pu déterminer avec certitude ce que ${who} voulait dire. Est-ce que ${who} a dit oui ?`,
  useLatestWords: "Utiliser la dernière version du texte",
  version: (version, status) => `Version ${version} · ${status}`,
  wentNotThrough: "L’action n’a pas abouti. Vous pouvez réessayer.",
  wentThrough: "L’action a abouti.",
  whoCan: (who) => `Oui, ${who} peut`,
  whoCannot: (who) => `Non, ${who} ne peut pas`,
  workingNow: "Traitement en cours…",
  youSent: "Vous avez envoyé",
};

export { tasks };
