import type { Messages } from "../en";

const appExtras: Messages["appExtras"] = {
  approvalRecorded: (label) => `Approbation enregistrée : ${label}`,
  loading: {
    addPerson: "Ajouter une personne",
    addPhoto: "Ajouter une photo",
    app: "Chargement de LifeLink",
    beforeSending: "avant l’envoi",
    call: "Appel",
    checkPhoto: "Vérifier cette photo",
    checks: "Chargement de vos vérifications",
    chooseFile: "Choisissez un fichier pour en voir un aperçu ici.",
    choosePhoto: "Choisir une photo",
    circle: "Chargement de votre cercle de confiance",
    circleBody:
      "Les personnes en qui vous avez confiance, comment les joindre et ce que chacune peut voir précisément.",
    circleTitle: "Cercle de confiance",
    connectEmail: "Connecter Gmail ou Outlook",
    connections: "Chargement des connexions",
    connectionsBody:
      "Choisissez ce pour quoi vous souhaitez de l’aide. Ouvrez une fiche pour voir toutes ses possibilités avant de connecter le service.",
    connectionsTitle: "Connexions",
    conversation: "Chargement de la conversation",
    conversations: "Chargement des conversations",
    conversationsTitle: "Conversations",
    documentsTitle: "Documents",
    drive: "Chargement de vos fichiers Drive",
    driveNotice:
      "Drive d’entraînement avec des exemples de fichiers et les notes que vous enregistrez en mode entraînement. Rien ici ne provient d’un vrai compte Google.",
    earlierChecks: "Vérifications précédentes",
    edit: "Modifier",
    email: "Chargement du courriel",
    emailTitle: "Courriels",
    emails: "Chargement des courriels",
    familyBody:
      "Voyez uniquement ce que chaque personne choisit de partager. Vous pouvez consulter ces informations, mais jamais envoyer, approuver ou dépenser quoi que ce soit à sa place.",
    familyTitle: "Famille",
    groceriesBody:
      "Gardez une liste de courses, prévoyez votre budget et copiez ou imprimez ce dont vous avez besoin.",
    groceriesTitle: "Courses",
    helpUnderstand: "Aidez-moi à comprendre",
    inbox: "Boîte de réception",
    listenCall: "Écouter un appel",
    lists: "Chargement de vos listes",
    message: "Message",
    messagesBody:
      "Écrivez aux personnes de votre cercle de confiance. Vous voyez chaque message avant son envoi.",
    messagesTitle: "Messages",
    notSharing: "Vous ne partagez rien avec personne.",
    page: "Chargement de votre page",
    permissions: "Autorisations",
    photo: "Photo",
    practiceCall: "Essayer un appel d’entraînement",
    practiceMessage: "Entraînement : rien ne sera envoyé à cette personne.",
    readAloud: "Lire à voix haute",
    readDay: "Lire ma journée à voix haute",
    recap: "Récapitulatif",
    recapBody:
      "LifeLink peut résumer ce que vous et votre famille avez convenu, ce qui a seulement été proposé et ce qui reste en suspens.",
    recapConversation: "Récapituler cette conversation",
    recapPractice:
      "En mode entraînement, LifeLink prépare lui-même le récapitulatif. Les messages d’entraînement ne sont jamais envoyés à un fournisseur d’IA.",
    review: "Vérifier",
    scamBody:
      "Un message ou un appel vous semble suspect ? LifeLink recherche les signaux d’alerte avant que vous agissiez.",
    scamTitle: "Vérifier une possible arnaque",
    settings: "Chargement des paramètres",
    settingsBody: "Adaptez LifeLink pour le lire et l’écouter confortablement.",
    settingsTitle: "Paramètres",
    shared: "Chargement des informations partagées",
    startListening: "Commencer à écouter",
    takePhoto: "Prendre une photo",
    task: "Chargement des détails de la tâche",
    text: "Texte",
    thisConversation: "cette conversation",
    today: "Chargement d’Aujourd’hui",
    yourFiles: "Vos fichiers",
  },
  openingFamily: "Ouverture de votre vue famille",
  phone: {
    allCountries: "Tous les pays",
    common: "Fréquents",
    countryCode: "Indicatif du pays",
    other: "Autre : saisir vous-même l’indicatif avec +",
  },
  signIn: {
    backHome: "Retour à l’accueil",
    body: "Connectez-vous pour voir les messages et les rendez-vous du jour. Rien n’est envoyé sans votre accord.",
    breakPrompt: "Envie d’une petite pause ?",
    busy: "Un instant…",
    connectionError:
      "La connexion n’a pas abouti. Vérifiez votre connexion Internet et réessayez.",
    createAccount: "Créer un compte",
    createBody:
      "Cela prend environ une minute. Vous ajouterez votre famille plus tard.",
    createError: "Nous n’avons pas pu créer le compte. Veuillez réessayer.",
    createOption: "Créer un compte",
    createTitle: "Commençons.",
    email: "Adresse courriel",
    friend: "Ami",
    hide: "Masquer",
    hidePassword: "Masquer le mot de passe",
    mismatch:
      "Cette adresse courriel et ce mot de passe ne correspondent pas. Veuillez les vérifier et réessayer.",
    modeLabel: "Se connecter ou créer un compte",
    name: "Votre nom complet",
    or: ", ou ",
    paintingAlt: {
      "sign-in":
        "Claude Monet, Woman with a Parasol : une femme tenant une ombrelle verte se tient sur une colline balayée par le vent, devant un ciel lumineux. Son jeune fils est dans l’herbe à proximité.",
      "sign-up":
        "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte : des personnes se reposent sur une pelouse ensoleillée au bord de l’eau. Un couple sous une ombrelle se tient à côté d’un petit chien et d’un singe apprivoisé.",
    },
    password: "Mot de passe",
    passwordHint: (count) => `Au moins ${count} caractères.`,
    passwordMinimum: (count) =>
      `Veuillez choisir un mot de passe d’au moins ${count} caractères.`,
    play: "Jouer au Solitaire sans se connecter",
    playMahjong: "jouer au Mahjong",
    show: "Afficher",
    showPassword: "Afficher le mot de passe",
    signIn: "Se connecter",
    welcome: "Heureux de vous retrouver.",
  },
  timeZone: { all: "Tous les fuseaux horaires", common: "Fréquents" },
};

export { appExtras };
