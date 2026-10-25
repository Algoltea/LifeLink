import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "Ajouter une personne",
  addPhoto: "Ajouter une photo",
  addWayToReach: (firstName) =>
    `Ajoutez un moyen de joindre ${firstName} dans le Cercle de confiance.`,
  addingPhoto: "Ajout de la photo…",
  backTo: "Retour à ",
  channels: {
    discord: "Message privé Discord",
    email: "Courriel",
    imessage: "iMessage",
    in_app: "Message LifeLink",
    telegram: "Telegram",
  },
  chooseConversation:
    "Choisissez une personne pour lire votre conversation et lui répondre.",
  conversationWith: (name) => `Conversation avec ${name}`,
  conversationWithPrefix: "Conversation avec ",
  conversations: "Conversations",
  dividerAt: (day, time) => `${day} à ${time}`,
  empty:
    "Ajoutez des proches à votre cercle de confiance pour commencer à leur écrire.",
  emptyThread: (firstName) => `Aucun message avec ${firstName} pour le moment`,
  emptyThreadHint: (firstName) =>
    `Écrivez ci-dessous pour commencer. Vous verrez exactement ce que ${firstName} recevra avant tout envoi.`,
  helpMeUnderstand: "Aidez-moi à comprendre",
  loadingConversation: "Chargement de la conversation",
  loadingConversations: "Chargement des conversations",
  maxPhotos: (count) =>
    `Vous pouvez joindre jusqu’à ${count} ${count > 1 ? "photos" : "photo"}. Retirez-en une pour en ajouter une autre.`,
  messageTo: (firstName) => `Message à ${firstName}`,
  messagesWith: (name) => `Messages avec ${name}`,
  noWayToReach: "Aucun moyen de contact pour le moment",
  noWayToReachName: (firstName) =>
    `Aucun moyen de joindre ${firstName} pour le moment`,
  notSent: "Non envoyé",
  notSureSent: "Envoi incertain",
  nothingSentUntilApproved:
    "Rien n’est envoyé avant votre vérification et votre approbation.",
  pendingMany: (count, firstName) =>
    `${count} ${count > 1 ? "messages à" : "message à"} ${firstName} en attente de votre approbation.`,
  pendingOne: (firstName) =>
    `Un message à ${firstName} attend votre approbation.`,
  peopleCount: (count) => `${count} ${count > 1 ? "personnes" : "personne"}`,
  photoCount: (count) => `${count} ${count > 1 ? "photos" : "photo"}`,
  photoInvalid: (name) =>
    `${name} : veuillez choisir une photo (JPEG, PNG, WebP ou HEIC).`,
  photosToSend: "Photos à envoyer",
  practiceNothingSent: (firstName) =>
    `Entraînement : rien ne sera envoyé à ${firstName}.`,
  preparing: "Préparation…",
  preparingMessage: "Préparation de votre message",
  previewManyPhotos: (count) => `${count} ${count > 1 ? "photos" : "photo"}`,
  previewOnePhoto: "Une photo",
  previewYou: (words) => `Vous : ${words}`,
  recap: "Récapituler",
  recapThis: " cette conversation",
  removePhoto: (name) => `Retirer ${name}`,
  replyAdded:
    "Réponse ajoutée à votre message. Vous pouvez la modifier avant de la vérifier.",
  review: "Vérifier",
  reviewBeforeSending: "Vérifier avant l’envoi",
  reviewBeforeSendingTail: " avant l’envoi",
  reviewIt: "Vérifier",
  seeWhatHappened: "Voir ce qui s’est passé",
  srThem: (firstName, when) => `${firstName}, ${when} : `,
  srYou: (when) => `Vous, ${when} : `,
  startConversation: "Commencer une conversation",
  status: {
    delivered: "Remis",
    draft: "Brouillon, non envoyé",
    failed: "Non envoyé",
    read: "Lu",
    received: "Reçu",
    sending: "Envoi…",
    sent: "Envoyé",
    unknown: "Envoi incertain",
  },
  subline:
    "Écrivez aux personnes de votre cercle de confiance. Vous voyez chaque message avant son envoi.",
  title: "Messages",
  toAddress: (address) => ` à ${address}`,
  waitingForApproval: (count) =>
    count === 1
      ? "En attente de votre approbation"
      : `${count} en attente de votre approbation`,
  writeTo: (firstName) => `Écrire à ${firstName}`,
  writeToPlaceholder: (firstName) => `Écrire à ${firstName}…`,
};

export { threads };
