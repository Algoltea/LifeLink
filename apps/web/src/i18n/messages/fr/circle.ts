import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "Ajouter une personne",
  contactFallback: "Contact",
  edit: "Modifier",
  editPerson: (name) => `Modifier la fiche de ${name}`,
  empty:
    "Ajoutez une personne de confiance. Vous pourrez lui écrire et choisir ce qu’elle peut voir dans LifeLink. Ajouter une personne ne partage aucune information avec elle.",
  keep: "Garder",
  loadingPeople: "Chargement des personnes",
  message: "Message",
  people: "Personnes",
  peopleCount: (count) => `${count} ${count > 1 ? "personnes" : "personne"}`,
  permissions: "Autorisations",
  permissionsFor: (name) => ` pour ${name}`,
  practiceContact: "Contact d’entraînement",
  reachNone: "Aucun moyen de contact pour le moment",
  reachTelegramWaiting: "Telegram : en attente de l’appui sur Démarrer",
  reachWhatsappSaved:
    "WhatsApp enregistré. Envoi de messages indisponible pour le moment",
  reachedBy: {
    discord: "Joignable par Discord",
    email: "Joignable par courriel",
    imessage: "Joignable par iMessage",
    in_app: "Joignable dans LifeLink",
    telegram: "Joignable par Telegram",
  },
  removeConfirm: (firstName) => `Retirer ${firstName}`,
  removeDescription: (name) =>
    `${name} sera retiré de vos contacts et tout partage avec cette personne s’arrêtera immédiatement.`,
  removeFailed: (error) =>
    `Cette personne n’a pas pu être retirée. ${error} Appuyez à nouveau sur Retirer.`,
  removeFallback: "Retirer",
  removeNamed: (firstName) => `Retirer ${firstName}…`,
  removePerson: "Retirer cette personne…",
  removeStopsSharing: (firstName) =>
    `Retirer ${firstName} arrête aussi tout partage avec cette personne.`,
  removeTitle: (name) => `Retirer ${name} ?`,
  removed: (name) => `${name} ne figure plus dans vos contacts.`,
  removing: "Retrait en cours…",
  subline:
    "Les personnes en qui vous avez confiance, comment les joindre et ce que chacune peut voir précisément.",
  title: "Cercle de confiance",
  trusted: "De confiance",
};

export { circle };
