import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "Retour à vos fichiers",
  changed: "Modifié ",
  changedAt: (when) => `Modifié ${when}`,
  changedSr: ", modifié ",
  changedSuffix: (when) => ` · Modifié ${when}`,
  checkingConnection: "Vérification de votre connexion à Google Drive",
  chooseFile: "Choisissez un fichier pour en voir un aperçu ici.",
  connect: "Connecter Google Drive",
  connectHint: "Connectez Google Drive pour voir vos fichiers ici.",
  connectPracticeHint:
    "Connectez le Google Drive d’entraînement pour essayer avec des exemples de fichiers.",
  connected: (account) =>
    `Connecté : Google Drive${account ? ` (${account})` : ""}. Ouvrez un fichier dans Google Drive pour le modifier ou le partager.`,
  embedHint:
    "Google affiche directement cet aperçu. Si une connexion est demandée, utilisez le même compte Google que celui que vous avez connecté, ou ouvrez le fichier dans Google Drive.",
  empty: "Votre Google Drive ne contient aucun fichier pour le moment.",
  fileCountAll: (count) =>
    count === 1
      ? "C’est le seul fichier."
      : `Tous les fichiers sont affichés : ${count}.`,
  filesFound: "Fichiers trouvés",
  find: "Rechercher un fichier par son nom",
  folderNoPreview:
    "Les dossiers n’ont pas d’aperçu ici. Ouvrez ce dossier dans Google Drive pour voir son contenu.",
  kinds: {
    Document: "Document",
    File: "Fichier",
    Folder: "Dossier",
    PDF: "PDF",
    Picture: "Image",
    Slides: "Présentation",
    Spreadsheet: "Feuille de calcul",
  },
  loadingFiles: "Chargement de vos fichiers Drive",
  loadingMore: "Chargement de fichiers supplémentaires",
  moreFailed: "Les fichiers suivants n’ont pas pu être chargés.",
  noLink:
    "Google Drive n’a pas fourni de lien pour ce fichier. Ouvrez Google Drive et recherchez-le par son nom.",
  noMatch: (search) => `Aucun nom de fichier ne contient « ${search} ».`,
  openInDrive: "Ouvrir dans Google Drive",
  opened: (name) => `Ouvert : ${name}`,
  opensNewTab: "(s’ouvre dans un nouvel onglet)",
  practiceConnected:
    "Drive d’entraînement avec des exemples de fichiers et les notes que vous enregistrez en mode entraînement. Rien ici ne provient d’un vrai compte Google.",
  practiceNoLink:
    "Les fichiers d’entraînement existent uniquement dans LifeLink et ne peuvent pas être ouverts dans Google Drive. Lorsque votre vrai Drive est connecté, ce bouton y ouvre le fichier.",
  previewOf: (name) => `Aperçu de ${name} depuis Google Drive`,
  previewPrefix: "Aperçu : ",
  reconnect: "Reconnecter Google Drive",
  searching: "Recherche…",
  sort: "Trier",
  sorts: {
    folders_first: "Dossiers en premier",
    name_asc: "Nom, de A à Z",
    name_desc: "Nom, de Z à A",
    oldest: "Les plus anciens en premier",
    recent: "Modifiés récemment",
  },
  title: "Documents",
  whatItSays: (name) => `Ce que dit ${name}`,
  yourDrive: "Votre Google Drive",
  yourDriveFiles: "Vos fichiers Drive",
  yourFiles: "Vos fichiers",
};

export { documents };
