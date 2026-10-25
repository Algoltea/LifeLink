import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `Peut voir : ${labels}`,
  changePermissions: "Modifier les autorisations",
  chooseAtLeastOne:
    "Choisissez au moins une information à partager pour créer un code.",
  chooseWhatToShare: "Choisir ce qui est partagé",
  codeAriaLabel: (spelled) => `Code d’invitation ${spelled}`,
  codeCopied: "Code copié.",
  codeCopyFailed:
    "Le code n’a pas pu être copié. Réessayez avec Copier le code ou notez le code affiché ci-dessus.",
  codeSpoken: (spelled) => `Le code est ${spelled}`,
  codeSpokenDash: ", tiret, ",
  copyCode: "Copier le code",
  createCode: "Créer un code d’invitation",
  expiry: { none: "Sans date de fin", seven: "7 jours", thirty: "30 jours" },
  forHowLong: "Pour combien de temps",
  giveCode: (firstName) =>
    `Donnez ce code à ${firstName}. Cette personne crée un compte LifeLink, choisit « Un membre de ma famille m’a invité » et saisit le code. Il est utilisable une seule fois, pendant 14 jours. Copiez-le maintenant : il n’est affiché ici qu’une seule fois.`,
  invitationWaiting: "Invitation en attente d’acceptation",
  inviteFailed: (error) =>
    `L’invitation n’a pas pu être créée. ${error} Vos choix sont toujours ici. Réessayez de créer le code.`,
  keepSharing: "Continuer le partage",
  loadingPermissions: "Chargement des autorisations",
  loadingPermissionsShort: "Chargement des autorisations…",
  makingCode: "Création du code…",
  noInformationSelected: "Aucune information sélectionnée pour le partage.",
  noInformationShared: "Aucune information partagée",
  notSharing: (firstName) =>
    `Vous ne partagez aucune information avec ${firstName}.`,
  permissionsFor: (name) => `Autorisations pour ${name}`,
  readCode: "Lire le code à voix haute",
  savePermissions: "Enregistrer les autorisations",
  scopes: {
    "appointments.view": {
      description: "Les rendez-vous à venir, avec l’heure et le lieu.",
      label: "Rendez-vous",
    },
    "groceries.view": {
      description: "Vos listes de courses enregistrées et leurs budgets.",
      label: "Listes de courses",
    },
    "photos.view": {
      description:
        "Les photos que vous avez partagées dans vos conversations familiales.",
      label: "Photos partagées",
    },
    "reminders.view": {
      description:
        "Les rappels que vous avez enregistrés et choisi de partager.",
      label: "Rappels",
    },
    "rides.view": {
      description:
        "L’avancement d’un trajet ou d’une course : demande, réponse, confirmation.",
      label: "Organisation des trajets",
    },
    "scam_alerts.view": {
      description:
        "Un avis lorsque vous vérifiez un message qui ressemble à une arnaque.",
      label: "Alertes d’arnaque",
    },
  },
  sharedInformation: "Informations partagées",
  startSharing:
    "Pour commencer le partage, choisissez ce que cette personne peut voir et donnez-lui un code d’invitation. Elle le saisit dans son propre compte LifeLink.",
  state: {
    active: "Peut voir les informations partagées",
    expired: "Partage arrivé à son terme",
    invited: "Invitation pas encore utilisée",
    revoked: "Partage arrêté",
  },
  stopDescription: (name) =>
    `${name} cessera immédiatement de voir les informations que vous avez partagées. Vous pourrez inviter cette personne à nouveau plus tard.`,
  stopFailed: (error) =>
    `Le partage n’a pas pu être arrêté. ${error} Appuyez à nouveau sur Arrêter le partage.`,
  stopSharing: "Arrêter le partage",
  stopSharingWith: (name) => `Arrêter le partage avec ${name}`,
  stopTitle: (name) => `Arrêter le partage avec ${name} ?`,
  stopped: (name) => `Le partage avec ${name} est arrêté.`,
  stopping: "Arrêt du partage…",
  them: "cette personne",
  until: (day) => `Jusqu’au ${day}`,
  updateFailed: (error) =>
    `Le partage n’a pas pu être mis à jour. ${error} Vos choix sont toujours ici. Choisissez Enregistrer les autorisations pour réessayer.`,
  updated: "Partage mis à jour. Les changements s’appliquent immédiatement.",
  viewOnly:
    "Choisissez les informations à partager dans LifeLink. Ces personnes peuvent uniquement les consulter ; elles ne peuvent pas envoyer de messages, approuver des actions ni dépenser à votre place.",
  whatNameCanSee: (firstName) => `Ce que ${firstName} peut voir`,
  whatTheyCanSee: "Ce que cette personne peut voir",
};

export { sharing };
