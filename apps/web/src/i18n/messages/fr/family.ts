import type { Messages } from "../en";

const family: Messages["family"] = {
  appointments: "Rendez-vous",
  budget: (amount) => ` · budget ${amount}`,
  checked: (kind, day) => `Vérification de ${kind} ${day}`,
  codeHint:
    "La personne qui vous a invité peut lire ce code sur sa page Cercle de confiance.",
  connect: "Se lier à ce compte",
  connected:
    "Vous êtes maintenant lié à ce compte. Vous verrez uniquement ce que cette personne a choisi de partager.",
  empty:
    "Personne ne partage encore d’informations avec vous. Lorsqu’une personne vous invite, saisissez son code ci-dessous.",
  groceries: "Courses",
  haveCode: "Vous avez un code d’invitation ?",
  invitationCode: "Code d’invitation",
  kinds: { email: "courriel", screenshot: "capture d’écran", text: "texte" },
  likelyScam: "Probablement une arnaque",
  loadingMessages: "Chargement des messages",
  loadingPhoto: "Chargement de la photo…",
  loadingShared: "Chargement des informations partagées",
  loadingWhatWasShared: "Chargement du contenu partagé",
  messagesWith: (name) => `Messages avec ${name}`,
  noMessages: "Aucun message dans LifeLink pour le moment.",
  noSharedReminders: "Aucun rappel partagé.",
  notSharing:
    "Cette personne ne partage pas d’informations avec vous pour le moment.",
  nothingLeft: "Plus rien à acheter.",
  nothingSoon: "Rien dans les 30 prochains jours.",
  onlyResult: "Seul le résultat est partagé, jamais le message lui-même.",
  photoUnavailable: "Cette photo n’est pas disponible.",
  photos: "Photos",
  replyTo: (name) => `Répondre à ${name}`,
  ride: {
    asked: "Trajet demandé, pas encore confirmé",
    confirmed: "Trajet confirmé",
    declined: "Trajet refusé",
  },
  scamChecks: "Vérifications d’arnaques",
  sendReply: "Envoyer la réponse",
  sharedPhoto: "Une photo partagée",
  sharedReminders: "Rappels partagés",
  shares: (name, scopes) =>
    `${name} partage : ${scopes}. Vous pouvez consulter ces informations, mais vous ne pouvez rien envoyer, approuver ou dépenser à sa place.`,
  subline:
    "Voyez uniquement ce que chaque personne choisit de partager. Vous pouvez consulter ces informations, mais jamais envoyer, approuver ou dépenser quoi que ce soit à sa place.",
  suspicious: "Suspect",
  theyWrote: (name) => `${name} a écrit : `,
  title: "Famille",
  updates: "Nouvelles",
  withPhotos: " · avec des photos",
  you: "Vous",
  youWrote: "Vous avez écrit : ",
};

export { family };
