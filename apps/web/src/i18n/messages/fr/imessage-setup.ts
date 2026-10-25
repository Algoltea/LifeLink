import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "Accepter et lier ce contact",
  assignedNumber: "Numéro iMessage attribué : ",
  checkComplete: "Vérification terminée. L’état actuel est indiqué ci-dessus.",
  checkFailed:
    "Impossible de vérifier l’arrivée de son premier message. Veuillez réessayer.",
  checkFirstMessage: "Rechercher le premier message",
  checking: "Recherche de son premier message…",
  confirmDescription:
    "Vérifiez l’adresse exacte et son utilisation avant de continuer.",
  confirmInvitation: (contactName, handle) =>
    `Aucun message d’invitation n’est envoyé. Vous verrez le numéro attribué à transmettre à ${contactName}. Cette personne doit d’abord y envoyer un message depuis ${handle}. Un numéro de téléphone et une adresse courriel d’identifiant Apple sont deux identités différentes, même sur le même téléphone.`,
  confirmLink: "Lier le contact Photon existant à l’adresse ",
  confirmLookup:
    "En continuant, vous recherchez cette adresse exacte dans Photon, notre fournisseur iMessage, et réutilisez le contact existant. LifeLink n’inscrit pas de nouvelles personnes et n’utilise pas de places supplémentaires.",
  confirmNoAccount: (contactName) =>
    `${contactName} n’a besoin ni d’un compte LifeLink ni d’une invitation au tableau de bord. Cette liaison ne donne aucun accès à votre compte.`,
  confirmTitle: (contactName) => `Lier iMessage pour ${contactName} ?`,
  confirmTo: " à ",
  copied: (contactName) =>
    `Instructions copiées. Envoyez-les vous-même à ${contactName}.`,
  copy: "Copier les instructions",
  copyFailed:
    "Impossible de copier les instructions. Sélectionnez et copiez le texte ci-dessus, ou appuyez à nouveau sur Copier les instructions.",
  exactAddress: "Adresse exacte du contact : ",
  firstMessageConfirmed:
    "Son premier message a été confirmé. LifeLink peut maintenant écrire à cette adresse enregistrée.",
  heading: "Configuration d’iMessage",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName} : pour commencer à utiliser iMessage avec LifeLink, vous devez d’abord envoyer un iMessage (par exemple « Bonjour ») au ${assignedNumber} depuis votre adresse exacte enregistrée : ${handle}. Dans Messages, vérifiez que votre conversation part de ${handle}. Un numéro de téléphone et une adresse courriel d’identifiant Apple sont deux identités différentes, même sur le même téléphone. Un message envoyé depuis une autre adresse n’activera pas celle-ci. Vous n’avez besoin ni d’un compte LifeLink ni d’une invitation au tableau de bord.`,
  link: "Lier iMessage",
  linkExplanation:
    "Liez la personne déjà enregistrée avec cette adresse exacte dans Photon. Si elle n’y figure pas, ajoutez-la d’abord dans le tableau de bord Photon, puis réessayez. LifeLink ne crée pas de nouvelles personnes.",
  linkFailed:
    "Impossible de lier ce contact. Vérifiez que cette adresse exacte est enregistrée dans le tableau de bord Photon, puis réessayez.",
  loading: "Chargement de la configuration d’iMessage…",
  lookingUp: "Recherche de ce contact existant dans Photon…",
  mustSendFirst: (contactName) =>
    `${contactName} doit envoyer le premier message depuis son adresse indiquée ci-dessus. Votre propre message n’activera pas sa configuration.`,
  needsAddress:
    "Une adresse iMessage est nécessaire. Ajoutez son numéro de téléphone ou l’adresse courriel de son identifiant Apple ci-dessus, puis enregistrez.",
  notConfigured:
    "L’application doit être configurée. La personne qui gère LifeLink doit connecter Photon avant que vous puissiez configurer iMessage pour ce contact.",
  ownerOnly:
    "Seul le titulaire du compte peut configurer ou vérifier iMessage pour ses contacts.",
  practice: (contactName) =>
    `Les messages d’entraînement restent dans LifeLink ; il n’y a donc rien à configurer ici. Lorsque vous passerez aux vrais iMessages, vous pourrez lier ${contactName} ici.`,
  retryLink: "Réessayer de lier iMessage",
  row: {
    failed: "iMessage nécessite votre attention",
    not_registered: "iMessage pas encore lié",
    registering: "Liaison d’iMessage",
    waiting: "En attente de son premier iMessage",
  },
  status: {
    failed: "La configuration nécessite votre attention",
    not_registered: "Non lié",
    ready: "Prêt pour iMessage",
    registering: "Liaison en cours",
    waiting: "En attente de son premier message",
  },
};

export { imessageSetup };
