import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "Ajouter cette personne",
  addWay: "Ajouter un autre moyen de contact",
  added: (name) => `${name} figure maintenant dans vos contacts.`,
  anotherWay: "Autre moyen de contact",
  askingForHelp: "Demander de l’aide à cette personne",
  chooseDifferentPicture: "Choisir une autre photo",
  choosePicture: "Choisir une photo",
  detailsNotSaved: (error) =>
    `Les coordonnées de cette personne n’ont pas pu être enregistrées. ${error} Vos saisies sont toujours ici. Appuyez à nouveau sur Enregistrer.`,
  howToReach: "Comment joindre cette personne",
  language: "Langue utilisée par LifeLink avec cette personne",
  languageHelp:
    "LifeLink utilise cette langue pour ses propres textes, comme la note de présentation dans le premier iMessage. Vos messages sont toujours envoyés exactement comme vous les approuvez.",
  languageSameAsMine: (language) => `La même que la mienne (${language})`,
  name: "Nom",
  notSetYet: "Pas encore défini",
  picture: "Photo",
  pictureFailed: (error) => `${error} Choisissez une photo pour réessayer.`,
  pictureHelp:
    "Facultatif. La photo est réduite et recadrée en carré sur cet appareil. Les informations de localisation et de l’appareil photo sont retirées avant l’enregistrement.",
  pictureNotSaved: (error) =>
    `Les coordonnées sont enregistrées, mais pas la photo. ${error} Vos choix sont toujours ici. Appuyez à nouveau sur Enregistrer ou choisissez une autre photo.`,
  pictureUnusable:
    "Cette image n’a pas pu être utilisée. Veuillez essayer une autre photo.",
  preferredWay: "Moyen de contact préféré",
  relationship: "Votre lien avec cette personne",
  relationshipPlaceholder: "Fils, voisine, ami",
  removePicture: "Retirer la photo",
  saveChanges: "Enregistrer les modifications",
  saved: "Enregistré.",
  savingPersonAndPicture: "Enregistrement du contact et de la photo…",
  trusted:
    "Cette personne fait partie de mon cercle de confiance. LifeLink peut me suggérer de lui demander de l’aide.",
  ways: {
    discord: {
      help: "Son identifiant utilisateur Discord, un long numéro. Dans Discord : Paramètres, Avancés, Mode développeur, puis Copier l’identifiant utilisateur.",
      label: "Discord",
      valueLabel: "Identifiant utilisateur Discord",
    },
    email: {
      help: "Son adresse courriel.",
      label: "Courriel (Gmail, Outlook et autres)",
      valueLabel: "Adresse courriel",
    },
    imessageEmail: {
      help: "L’adresse courriel de son identifiant Apple utilisée pour iMessage. Cette identité est différente de celle de son numéro de téléphone. Pour envoyer de vrais iMessages plus tard, enregistrez cette personne, puis choisissez Modifier et Lier iMessage.",
      label: "iMessage (adresse courriel de l’identifiant Apple)",
      valueLabel: "Adresse courriel de l’identifiant Apple",
    },
    imessagePhone: {
      help: "Son numéro d’iPhone. Pour envoyer de vrais iMessages plus tard, enregistrez cette personne, puis choisissez Modifier et Lier iMessage.",
      label: "iMessage (numéro de téléphone)",
      valueLabel: "Numéro de téléphone",
    },
    telegram: {
      help: "Son nom d’utilisateur Telegram, par exemple @sam_alvarez (dans Telegram : Paramètres, puis Nom d’utilisateur). Après l’enregistrement, demandez-lui d’ouvrir @LifeLinkMessage_Bot dans Telegram et d’appuyer sur Démarrer. Sans nom d’utilisateur, laissez ce champ vide et utilisez le lien Telegram ci-dessous.",
      label: "Telegram",
      valueLabel: "Nom d’utilisateur Telegram",
    },
    whatsapp: {
      help: "Conservé pour vous. LifeLink ne peut pas encore envoyer de messages WhatsApp.",
      label: "WhatsApp (enregistrement seulement)",
      valueLabel: "Numéro WhatsApp",
    },
  },
  whoTheyAre: "À propos de cette personne",
};

export { contactForm };
