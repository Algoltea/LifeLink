import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "Ajouter une personne de confiance",
  call: "Appeler",
  callAria: (name) => `Appeler ${name}`,
  callHelpMessage:
    "J’ai un doute au sujet d’un appel reçu. Pourriez-vous m’aider à vérifier s’il est authentique avant que je partage des informations ou envoie de l’argent ?",
  callsLoading:
    "Les appels seront disponibles après le chargement des paramètres de votre compte.",
  callsPractice: "Les appels ne sont pas disponibles en mode entraînement.",
  contactFallback: "Contact",
  empty:
    "Un second avis peut aider. Ajoutez une personne que vous connaissez à votre ",
  emptyRest:
    " pour demander de l’aide avec cette vérification. Vous vérifierez tout message avant son envoi.",
  failed: (name, error) =>
    `Le message à ${name} n’a pas pu être préparé. ${error} Rien n’a été envoyé. Appuyez à nouveau sur Préparer le message.`,
  introCall:
    "Préparez un message pour demander de l’aide au sujet de l’appel. Vous pourrez le lire et le modifier avant de l’approuver. Rien n’est encore envoyé.",
  introCheck:
    "Préparez un message pour demander de l’aide avec cette vérification. Vous pourrez le lire et le modifier avant de l’approuver. Rien n’est encore envoyé.",
  list: "Personnes de confiance",
  loading: "Chargement des personnes de confiance",
  noMessageAddress: "Aucune adresse de messagerie enregistrée",
  noPhone: "Aucun numéro de téléphone enregistré. ",
  noWayToMessage: "Aucun moyen d’envoyer un message enregistré. ",
  prepare: "Préparer le message",
  prepareAria: (name) => `Préparer un message à ${name}`,
  preparing: "Préparation…",
  reachedBy: {
    discord: "Joignable par message",
    email: "Joignable par courriel",
    imessage: "Joignable par message",
    in_app: "Joignable dans LifeLink",
    telegram: "Joignable par message",
  },
  saveDetails: "Enregistrez ses coordonnées dans votre ",
  trustedCircle: "Cercle de confiance",
  unavailable:
    "Appeler et Préparer le message sont indisponibles pour le moment.",
};

export { trustedPeople };
