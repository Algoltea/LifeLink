import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `Invitation copiée. Envoyez-la vous-même à ${contactName}.`,
  copiedLink: (contactName) =>
    `Lien copié. Envoyez-le vous-même à ${contactName}.`,
  copyInvitation: "Copier l’invitation",
  copyInvitationFailed:
    "Impossible de copier l’invitation. Copiez l’adresse ci-dessus.",
  copyLink: "Copier le lien",
  copyLinkFailed:
    "Impossible de copier le lien. Sélectionnez-le et copiez-le ci-dessus.",
  expires: (day) => ` Il est utilisable une seule fois et expire le ${day}.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `Bonjour ${contactName} ! Ouvrez ${botUrl} dans Telegram et appuyez sur Démarrer pour que nous puissions échanger des messages avec LifeLink.`,
  link: "Lier Telegram",
  linked: (account, contactName) =>
    `Lié à ${account}. Les messages que vous approuvez pour ${contactName} peuvent passer par Telegram, et ses réponses arrivent dans Messages.`,
  loading: "Chargement de la configuration de Telegram…",
  newLink: "Créer un nouveau lien",
  notConfigured:
    "L’application doit être configurée. La personne qui gère LifeLink doit connecter Telegram avant que vous puissiez le lier pour ce contact.",
  ownerOnly:
    "Seul le titulaire du compte peut lier Telegram pour ses contacts.",
  sendLink: (contactName) =>
    `Envoyez ce lien à ${contactName}. Lorsque cette personne l’ouvre et appuie sur Démarrer, Telegram est automatiquement lié ici.`,
  theirAccount: "son compte Telegram",
  unlink: "Délier Telegram",
  waitingAsk: (contactName) => `. Demandez à ${contactName} d’ouvrir `,
  waitingFor: (username) => `En attente de @${username}`,
  waitingRest:
    " dans Telegram et d’appuyer sur Démarrer. LifeLink effectue la liaison aussitôt.",
};

export { telegramSetup };
